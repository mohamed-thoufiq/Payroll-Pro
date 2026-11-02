import { MongoClient, BSON } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, '..', 'data_backup');

// Usage: node scripts/restore.js "<NEW_MONGO_URI>" [optionalTargetDbName]
async function runRestore() {
  const targetUri = process.argv[2];
  const targetDbName = process.argv[3] || 'test';

  if (!targetUri) {
    console.error('❌ Missing target MongoDB connection URI.');
    console.error('Usage: node scripts/restore.js "<NEW_MONGO_URI>" [optionalTargetDbName]');
    console.error('Example: node scripts/restore.js "mongodb+srv://user:pass@cluster.mongodb.net/test"');
    process.exit(1);
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest not found in data_backup directory. Please run `npm run backup` first.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📂 Found backup from ${manifest.timestamp} with ${Object.keys(manifest.collections).length} collections.`);

  console.log('🔄 Connecting to target MongoDB cluster...');
  const client = new MongoClient(targetUri);

  try {
    await client.connect();
    const targetDb = client.db(targetDbName);
    console.log(`✅ Connected! Restoring to database: "${targetDb.databaseName}"...\n`);

    for (const [colName, info] of Object.entries(manifest.collections)) {
      const filePath = path.join(backupDir, info.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File ${info.file} not found, skipping.`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { docs, indexes } = BSON.EJSON.parse(fileContent, { relaxed: false });

      const targetCol = targetDb.collection(colName);

      if (docs.length > 0) {
        // Drop existing or clean insert
        await targetCol.deleteMany({});
        await targetCol.insertMany(docs);
        console.log(`  ✅ [${colName}]: Restored ${docs.length} documents.`);
      } else {
        console.log(`  ℹ️ [${colName}]: Collection is empty (0 documents).`);
      }

      // Recreate custom indexes (skip _id_)
      if (indexes && indexes.length > 1) {
        for (const idx of indexes) {
          if (idx.name !== '_id_') {
            try {
              const options = { name: idx.name };
              if (idx.unique) options.unique = true;
              if (idx.sparse) options.sparse = true;
              await targetCol.createIndex(idx.key, options);
            } catch (idxErr) {
              // Ignore benign index errors (e.g. existing index)
            }
          }
        }
      }
    }

    console.log(`\n🎉 Data transfer complete! All collections restored to "${targetDb.databaseName}".`);
    console.log('👉 Next step: update MONGO_URI in your backend/.env file to your new cluster connection string.');
  } catch (err) {
    console.error('❌ Restore failed:', err);
  } finally {
    await client.close();
  }
}

runRestore();
