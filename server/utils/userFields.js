// Fields any logged-in user may see on another user's profile.
const PUBLIC_USER_FIELDS = [
  'name', 'avatar', 'coverPhoto', 'role', 'department', 'graduationYear',
  'bio', 'skills', 'interests', 'linkedIn', 'github', 'currentCompany',
  'currentRole', 'location', 'points', 'verificationStatus', 'isVerified', 'createdAt',
];

// Mongoose select string for public data (the _id is always included).
const PUBLIC_USER_SELECT = PUBLIC_USER_FIELDS.join(' ');

// Never sent to anyone, not even the owner or an admin. emailVerifyToken and
// emailVerifyExpires also serve as the password-reset token fields.
const SECRET_USER_FIELDS = ['password', 'refreshToken', 'emailVerifyToken', 'emailVerifyExpires'];

// Select string for the full profile (owner / admin): everything except secrets.
const FULL_USER_SELECT = SECRET_USER_FIELDS.map((f) => `-${f}`).join(' ');

// Moderation fields: kept on req.user for server-side checks (fraud middleware),
// shown to admins, but stripped from every response sent to the user themselves.
const OWNER_HIDDEN_FIELDS = ['fraudScore', 'isFlagged'];

// Select string for responses sent to the owner: no secrets, no moderation fields.
const OWNER_USER_SELECT = [...SECRET_USER_FIELDS, ...OWNER_HIDDEN_FIELDS].map((f) => `-${f}`).join(' ');

module.exports = {
  PUBLIC_USER_FIELDS, PUBLIC_USER_SELECT,
  SECRET_USER_FIELDS, FULL_USER_SELECT,
  OWNER_HIDDEN_FIELDS, OWNER_USER_SELECT,
};
