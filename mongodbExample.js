/**
 * mongodbExample.js — Minimal MongoDB Atlas Example (Node.js)
 *
 * This single file demonstrates connecting to MongoDB Atlas, inserting
 * realistic healthcare-prediction documents, querying them, and cleaning up.
 *
 * ─── Install & Run ───────────────────────────────────────────────
 *   npm install mongodb dotenv        (mongodb driver + env loader)
 *   node mongodbExample.js            (run this file)
 * ─────────────────────────────────────────────────────────────────
 *
 * Your .env file (or system env) must contain:
 *   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/...
 *
 * NEVER hardcode or commit real credentials.
 */

// Load .env so process.env.MONGODB_URI (or MONGO_URI) is available
require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');

// ── 1. Read the connection string from the environment ──────────
//    We check both MONGODB_URI and MONGO_URI for flexibility.
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error('❌  Set MONGODB_URI (or MONGO_URI) in your .env file.');
  process.exit(1);
}

// ── 2. Choose database and collection names ─────────────────────
const DB_NAME         = 'healthcare_prediction';
const COLLECTION_NAME = 'patient_predictions';

// ── Helper: generate 10 realistic patient-prediction documents ──
function createSampleDocs() {
  const symptoms = [
    ['fever', 'cough', 'fatigue'],
    ['headache', 'nausea', 'dizziness'],
    ['chest pain', 'shortness of breath', 'sweating'],
    ['joint pain', 'swelling', 'stiffness'],
    ['abdominal pain', 'bloating', 'diarrhea'],
    ['sore throat', 'runny nose', 'sneezing'],
    ['blurred vision', 'frequent urination', 'thirst'],
    ['rash', 'itching', 'redness'],
    ['back pain', 'numbness', 'tingling'],
    ['anxiety', 'insomnia', 'rapid heartbeat'],
  ];

  const diseases = [
    'Influenza', 'Migraine', 'Angina Pectoris',
    'Rheumatoid Arthritis', 'Irritable Bowel Syndrome',
    'Common Cold', 'Type 2 Diabetes', 'Contact Dermatitis',
    'Sciatica', 'Generalized Anxiety Disorder',
  ];

  const names = [
    'Aarav Sharma', 'Priya Patel', 'Rohan Gupta',
    'Sneha Reddy', 'Vikram Singh', 'Anjali Nair',
    'Karthik Iyer', 'Divya Joshi', 'Arjun Mehta', 'Meera Das',
  ];

  // Each document gets a timestamp spread over the last 10 days
  // so we can demonstrate sorting by recency.
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return names.map((name, i) => ({
    patientName : name,
    age         : 25 + i * 5,                              // 25, 30, 35 …
    symptoms    : symptoms[i],
    predicted   : diseases[i],
    confidence  : +(0.75 + Math.random() * 0.2).toFixed(2), // 0.75 – 0.95
    createdAt   : new Date(now - (10 - i) * ONE_DAY),       // oldest → newest
  }));
}

// ── Main flow ───────────────────────────────────────────────────
async function main() {
  let client;

  try {
    // ── 3. Connect to MongoDB Atlas ─────────────────────────────
    console.log('🔗  Connecting to MongoDB Atlas …');
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅  Connected successfully!\n');

    const db         = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // ── 4. Insert 10 realistic documents ────────────────────────
    const docs   = createSampleDocs();
    const result = await collection.insertMany(docs);
    console.log(`📝  Inserted ${result.insertedCount} patient-prediction documents.\n`);

    // ── 5. Read the 5 most recent documents (sorted by createdAt desc) ──
    console.log('📋  5 most recent predictions:\n');
    const recentDocs = await collection
      .find({})
      .sort({ createdAt: -1 })   // newest first
      .limit(5)
      .toArray();

    recentDocs.forEach((doc, idx) => {
      console.log(
        `  ${idx + 1}. ${doc.patientName} (age ${doc.age})` +
        ` — ${doc.predicted} (${(doc.confidence * 100).toFixed(0)}%)` +
        ` — ${doc.createdAt.toISOString()}`
      );
    });

    // ── 6. Read one document by its _id ─────────────────────────
    //    We grab the _id of the very first inserted document.
    const firstId  = result.insertedIds[0];
    const singleDoc = await collection.findOne({ _id: firstId });
    console.log(`\n🔍  Lookup by _id (${firstId}):`);
    console.log(singleDoc);

    // ── 7. Clean up: remove the sample documents we just inserted ──
    //    (Remove this block if you want to keep the data.)
    const del = await collection.deleteMany({
      _id: { $in: Object.values(result.insertedIds) },
    });
    console.log(`\n🗑️   Cleaned up ${del.deletedCount} sample documents.`);

  } catch (err) {
    // Simple error handling so beginners can see what went wrong
    console.error('❌  Something went wrong:', err.message);
    process.exit(1);

  } finally {
    // ── 8. Always close the connection ──────────────────────────
    if (client) {
      await client.close();
      console.log('\n🔒  MongoDB connection closed. Done!');
    }
  }
}

// Run!
main();
