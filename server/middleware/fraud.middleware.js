const FraudLog = require('../models/FraudLog');
const User = require('../models/User');
const SystemState = require('../models/SystemState');

// ── Tunables ─────────────────────────────────────────────────────
const WRITE_WINDOW_MS = 60 * 1000;          // sliding window for write requests
const WRITE_PENALTY = 30;                    // fraudScore added per write-limit offence
const FLAG_THRESHOLD = 80;                   // fraudScore above this => isFlagged
const LOGIN_WINDOW_MS = 15 * 60 * 1000;      // failed-login window
const LOGIN_MAX_FAILURES = 5;                // more than this in the window => lockout
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;     // lockout length for that IP + email
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Max writes per user per minute: FRAUD_WRITE_LIMIT, else strict in production, relaxed elsewhere.
const writeLimit = () =>
  parseInt(process.env.FRAUD_WRITE_LIMIT, 10) || (process.env.NODE_ENV === 'production' ? 60 : 600);

// ── In-memory state (per server process; resets on restart) ──────
const writeState = new Map(); // userId -> { hits: number[], blockedUntil: number }
const loginState = new Map(); // `${ip}|${email}` -> { fails: number[], blockedUntil: number }

// Drop expired entries so the maps can't grow without bound
const sweep = () => {
  const now = Date.now();
  for (const [key, s] of writeState) {
    s.hits = s.hits.filter((t) => now - t < WRITE_WINDOW_MS);
    if (!s.hits.length && s.blockedUntil <= now) writeState.delete(key);
  }
  for (const [key, s] of loginState) {
    s.fails = s.fails.filter((t) => now - t < LOGIN_WINDOW_MS);
    if (!s.fails.length && s.blockedUntil <= now) loginState.delete(key);
  }
};
setInterval(sweep, 60 * 1000).unref();

const tooMany = (res, blockedUntil, message) => {
  res.set('Retry-After', String(Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000))));
  return res.status(429).json({ error: message });
};

// Record a fraud event without ever throwing into the request
const logFraud = (entry) => FraudLog.create(entry).catch((err) => console.error('FraudLog error:', err.message));

// ── Write-request tracking ───────────────────────────────────────
// Use after `protect`. For POST/PUT/PATCH/DELETE (and, with trackAllMethods, any method):
//   - flagged non-admin users get 403
//   - more than writeLimit() tracked requests in 60s: FraudLog, +30 fraudScore (flag above 80), 429
// Other requests (plain reads) pass untouched.
const makeFraudDetect = (trackAllMethods) => async (req, res, next) => {
  try {
    if (!req.user || (!trackAllMethods && !WRITE_METHODS.has(req.method))) return next();

    // req.user was loaded by protect, so this needs no extra query
    if (req.user.isFlagged && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Your account is restricted. Contact an admin.' });
    }

    const key = req.user._id.toString();
    const now = Date.now();
    const state = writeState.get(key) || { hits: [], blockedUntil: 0 };
    writeState.set(key, state);

    // Already penalised for this burst: refuse until the cooldown ends, without piling on more score
    if (state.blockedUntil > now) {
      return tooMany(res, state.blockedUntil, 'Too many requests. Slow down and try again shortly.');
    }

    state.hits = state.hits.filter((t) => now - t < WRITE_WINDOW_MS);
    state.hits.push(now);
    const limit = writeLimit();
    if (state.hits.length <= limit) return next();

    // Offence: penalise once, then cool down for the rest of the window
    const count = state.hits.length;
    state.hits = [];
    state.blockedUntil = now + WRITE_WINDOW_MS;
    await logFraud({
      user: req.user._id,
      ip: req.ip,
      action: `${req.method} ${req.baseUrl}${req.path}`,
      reason: `${WRITE_METHODS.has(req.method) ? 'Write' : 'Costly (AI)'} rate limit exceeded (${count} tracked requests in 60s, limit ${limit})`,
      score: WRITE_PENALTY,
      meta: { limit, windowSeconds: WRITE_WINDOW_MS / 1000 },
    });
    // One atomic update: add the penalty, then flag if the new score is above the threshold
    // (an existing flag, e.g. set by an admin, is never cleared here)
    await User.findByIdAndUpdate(req.user._id, [
      { $set: { fraudScore: { $add: [{ $ifNull: ['$fraudScore', 0] }, WRITE_PENALTY] } } },
      { $set: { isFlagged: { $or: ['$isFlagged', { $gt: ['$fraudScore', FLAG_THRESHOLD] }] } } },
    ], { updatePipeline: true }).catch((err) => console.error('Fraud score update error:', err.message));

    return tooMany(res, state.blockedUntil, 'Too many requests. Slow down and try again shortly.');
  } catch (err) {
    console.error('fraudDetect error:', err.message);
    next(); // never block legitimate users because of a bug in the detector
  }
};
// Writes only (POST/PUT/PATCH/DELETE)
const fraudDetect = makeFraudDetect(false);
// Same tracking and flag check for GET endpoints that cost money per call (LLM requests).
// Shares the per-user counter with writes.
const fraudDetectCostly = makeFraudDetect(true);

// ── Failed-login tracking ────────────────────────────────────────
const loginKey = (req, email) => `${req.ip}|${String(email || '').toLowerCase().trim()}`;

// Use before the login handler: refuse while this IP + email is locked out
const loginGuard = (req, res, next) => {
  const state = loginState.get(loginKey(req, req.body?.email));
  if (state && state.blockedUntil > Date.now()) {
    return tooMany(res, state.blockedUntil, 'Too many failed login attempts. Try again later.');
  }
  next();
};

// Call from the login handler on a failed attempt. Returns true when this failure
// triggers the lockout (the handler should then answer 429 instead of 401).
const recordLoginFailure = async (req, email, userId) => {
  const key = loginKey(req, email);
  const now = Date.now();
  const state = loginState.get(key) || { fails: [], blockedUntil: 0 };
  loginState.set(key, state);
  state.fails = state.fails.filter((t) => now - t < LOGIN_WINDOW_MS);
  state.fails.push(now);
  if (state.fails.length <= LOGIN_MAX_FAILURES) return false;

  state.blockedUntil = now + LOGIN_LOCKOUT_MS;
  state.fails = [];
  await logFraud({
    user: userId,
    ip: req.ip,
    action: 'POST /auth/login',
    reason: `Too many failed logins (more than ${LOGIN_MAX_FAILURES} in 15 minutes); IP and email locked out for 15 minutes`,
    score: 0,
    meta: { email: String(email || '').toLowerCase().trim() },
  });
  return true;
};

// Call after a successful login
const clearLoginFailures = (req, email) => { loginState.delete(loginKey(req, email)); };

// ── Score decay ──────────────────────────────────────────────────
// -10 per run. A score of 80 or below is unflagged. Returns true on success.
const decayFraudScores = async () => {
  try {
    const flaggedUsers = await User.find({ fraudScore: { $gt: 0 } }).select('_id fraudScore');
    await Promise.all(flaggedUsers.map(u => {
      const newScore = Math.max(0, u.fraudScore - 10);
      return User.findByIdAndUpdate(u._id, {
        fraudScore: newScore,
        isFlagged: newScore > FLAG_THRESHOLD
      });
    }));
    console.log(`🛡️ Fraud score decay: ${flaggedUsers.length} users updated`);
    return true;
  } catch (err) {
    console.error('Fraud decay error:', err.message);
    return false;
  }
};

const DECAY_KEY = 'fraudDecay';
const DECAY_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Run the decay only if 24h have passed since the last run. The last run time lives in MongoDB
// (SystemState), so restarting the server does not decay again. The run is claimed with an atomic
// update first, so two restarts or two instances can't both decay. Safe to call often.
const runDecayIfDue = async () => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - DECAY_INTERVAL_MS);
    let previous = await SystemState.findOneAndUpdate(
      { key: DECAY_KEY, lastRunAt: { $lte: cutoff } },
      { $set: { lastRunAt: now } },
      { new: false }
    );
    if (!previous) {
      // Not claimed: either it has never run (create the record and run) or it ran less than 24h ago
      try {
        await SystemState.create({ key: DECAY_KEY, lastRunAt: now });
        previous = { lastRunAt: null };
      } catch (err) {
        if (err.code === 11000) return; // record exists and the last run is recent
        throw err;
      }
    }
    if (!(await decayFraudScores())) {
      // Failed: give the run back so it is retried at the next check
      if (previous.lastRunAt) await SystemState.updateOne({ key: DECAY_KEY }, { $set: { lastRunAt: previous.lastRunAt } });
      else await SystemState.deleteOne({ key: DECAY_KEY });
    }
  } catch (err) {
    console.error('Fraud decay scheduling error:', err.message);
  }
};

module.exports = {
  fraudDetect, fraudDetectCostly, loginGuard, recordLoginFailure, clearLoginFailures,
  decayFraudScores, runDecayIfDue,
};
