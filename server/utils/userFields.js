// Fields any logged-in user may see on another user's profile.
const PUBLIC_USER_FIELDS = [
  'name', 'avatar', 'coverPhoto', 'role', 'department', 'graduationYear',
  'bio', 'skills', 'interests', 'linkedIn', 'github', 'currentCompany',
  'currentRole', 'location', 'points', 'verificationStatus', 'createdAt',
];

// Mongoose select string for public data (the _id is always included).
const PUBLIC_USER_SELECT = PUBLIC_USER_FIELDS.join(' ');

// Never sent to anyone, not even the owner or an admin. emailVerifyToken and
// emailVerifyExpires also serve as the password-reset token fields.
const SECRET_USER_FIELDS = ['password', 'refreshToken', 'emailVerifyToken', 'emailVerifyExpires'];

// Select string for the full profile (owner / admin): everything except secrets.
const FULL_USER_SELECT = SECRET_USER_FIELDS.map((f) => `-${f}`).join(' ');

module.exports = { PUBLIC_USER_FIELDS, PUBLIC_USER_SELECT, SECRET_USER_FIELDS, FULL_USER_SELECT };
