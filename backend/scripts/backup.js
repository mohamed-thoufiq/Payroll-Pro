import 'dotenv/config';
import { MongoClient, BSON } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, '..', 'data_backup');

async function runBackup() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ No MONGO_URI in .env');
    process.exit(1);
  }

  console.log('🔄 Connecting to source MongoDB cluster...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    console.log(`✅ Connected! Fetching collections from database: "${db.databaseName}"...`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = await db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections.`);

    const manifest = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: {}
    };

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      const indexes = await collection.indexes();

      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, BSON.EJSON.stringify({ docs, indexes }, { relaxed: false }), 'utf-8');

      manifest.collections[colName] = {
        count: docs.length,
        file: `${colName}.json`
      };

      console.log(`  💾 [${colName}]: backed up ${docs.length} documents -> ${colName}.json`);
    }

    fs.writeFileSync(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log(`\n🎉 Backup complete! All data saved safely to: ${backupDir}`);
  } catch (err) {
    console.error('❌ Backup failed:', err);
  } finally {
    await client.close();
  }
}

runBackup();
