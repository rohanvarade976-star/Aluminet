const path = require('path');
const fs = require('fs');

// Root of all uploads on disk. Only AVATARS_DIR is served statically.
const UPLOADS_DIR = path.join(__dirname, '../uploads');
// Public: profile pictures, served at /uploads/avatars
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
// Private: verification documents and resumes. Never served statically;
// verification files are downloaded through an authenticated route.
const PRIVATE_DIR = path.join(UPLOADS_DIR, 'private');

[AVATARS_DIR, PRIVATE_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

module.exports = { UPLOADS_DIR, AVATARS_DIR, PRIVATE_DIR };
