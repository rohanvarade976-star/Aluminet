// Simple in-memory TTL cache for mentor match results (5 min TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  // Prevent unbounded growth — max 200 cached entries
  if (cache.size > 200) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── TF-IDF Cosine Similarity ──────────────────────────────────────

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function buildTF(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => { tf[k] /= total; });
  return tf;
}

function cosine(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, ma = 0, mb = 0;
  keys.forEach(k => {
    const av = a[k] || 0, bv = b[k] || 0;
    dot += av * bv; ma += av * av; mb += bv * bv;
  });
  return (ma && mb) ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0;
}

function buildVec(user) {
  const parts = [
    ...(user.skills || []),
    ...(user.interests || []),
    ...tokenize(user.bio || ''),
    ...tokenize(user.currentRole || ''),
    ...(user.department ? [user.department] : [])
  ];
  return buildTF(parts.map(p => p.toLowerCase()));
}

function matchMentors(student, mentors) {
  // Cache key: studentId + mentor count (invalidates when alumni list changes)
  const cacheKey = `${student._id}_${mentors.length}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const sv = buildVec(student);
  const results = mentors.map(m => {
    let score = cosine(sv, buildVec(m)) * 1.5;
    if (student.department && m.department &&
        student.department.toLowerCase() === m.department.toLowerCase()) score += 0.15;
    if (m.currentCompany && m.currentRole) score += 0.05;

    return {
      mentor: {
        _id: m._id, name: m.name, avatar: m.avatar,
        department: m.department, currentCompany: m.currentCompany,
        currentRole: m.currentRole, skills: m.skills, bio: m.bio,
        location: m.location, graduationYear: m.graduationYear
      },
      matchScore: Math.min(Math.round(score * 100), 99),
      commonSkills: (student.skills || []).filter(s =>
        (m.skills || []).map(x => x.toLowerCase()).includes(s.toLowerCase())
      ),
      commonInterests: (student.interests || []).filter(s =>
        (m.interests || []).map(x => x.toLowerCase()).includes(s.toLowerCase())
      )
    };
  }).filter(m => m.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  setCache(cacheKey, results);
  return results;
}

module.exports = { matchMentors };
