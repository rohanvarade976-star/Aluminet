/**
 * One-time migration: make existing uploaded documents private.
 *
 * Moves verification documents and resumes from server/uploads/ into
 * server/uploads/private/ and rewrites their stored paths in MongoDB to
 * "private/<filename>". Any other loose file left in the uploads root (for
 * example documents that were replaced by a newer upload) is moved too, so the
 * root only keeps the avatars/ folder.
 *
 * Usage (run from server/):
 *   node scripts/migrate-private-uploads.js --dry-run   # report only, change nothing
 *   node scripts/migrate-private-uploads.js             # move files and update MongoDB
 *
 * Safe to run more than once. File contents are never read.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const VerificationRequest = require('../models/VerificationRequest');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { UPLOADS_DIR, PRIVATE_DIR } = require('../utils/uploadPaths');

const DRY_RUN = process.argv.includes('--dry-run');

const TARGETS = [
  { model: VerificationRequest, label: 'VerificationRequest', fields: ['collegeIdUrl', 'degreeUrl', 'offerLetterUrl'] },
  { model: ResumeAnalysis, label: 'ResumeAnalysis', fields: ['resumeUrl'] },
];

const stats = { filesMoved: 0, filesAlreadyPrivate: 0, filesMissing: 0, collisions: 0, dbUpdated: 0, looseMoved: 0 };

// Move uploads/<name> -> uploads/private/<name>. Returns 'moved' | 'already' | 'missing' | 'collision'.
function moveToPrivate(name) {
  const src = path.join(UPLOADS_DIR, name);
  const dest = path.join(PRIVATE_DIR, name);
  const srcExists = fs.existsSync(src);
  const destExists = fs.existsSync(dest);
  if (srcExists && destExists) return 'collision';
  if (srcExists) {
    if (!DRY_RUN) fs.renameSync(src, dest);
    return 'moved';
  }
  return destExists ? 'already' : 'missing';
}

async function migrateDocuments() {
  for (const { model, label, fields } of TARGETS) {
    const docs = await model.find({});
    for (const doc of docs) {
      const $set = {};
      for (const field of fields) {
        const stored = doc[field];
        if (!stored || stored.startsWith('private/')) continue;
        const name = path.basename(stored);
        const result = moveToPrivate(name);
        if (result === 'moved') stats.filesMoved++;
        else if (result === 'already') stats.filesAlreadyPrivate++;
        else if (result === 'collision') {
          stats.collisions++;
          console.warn(`  ! ${label} ${doc._id}.${field}: file exists in both places, left untouched`);
          continue;
        } else {
          stats.filesMissing++;
          console.warn(`  ! ${label} ${doc._id}.${field}: file not found on disk, database path left unchanged`);
          continue;
        }
        $set[field] = `private/${name}`;
      }
      if (Object.keys($set).length) {
        if (!DRY_RUN) await model.updateOne({ _id: doc._id }, { $set });
        stats.dbUpdated++;
      }
    }
  }
}

// Anything still loose in the uploads root (orphans) belongs in private/ too.
function moveLooseFiles() {
  for (const entry of fs.readdirSync(UPLOADS_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === '.gitkeep') continue;
    const result = moveToPrivate(entry.name);
    if (result === 'moved') stats.looseMoved++;
    else if (result === 'collision') {
      stats.collisions++;
      console.warn('  ! a loose file already exists in private/, left in place');
    }
  }
}

(async () => {
  console.log(DRY_RUN ? 'DRY RUN: no files or database records will be changed' : 'Migrating private uploads...');
  await mongoose.connect(process.env.MONGODB_URI);
  await migrateDocuments();
  moveLooseFiles();
  console.log(JSON.stringify({ dryRun: DRY_RUN, ...stats }, null, 2));
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Migration failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
