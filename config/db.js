const mongoose = require('mongoose');

/**
 * Connect to MongoDB and seed KG. Throws on failure so the process can exit cleanly.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in .env — cannot connect to MongoDB.');
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  try {
    const { seedKG } = require('../services/knowledgeGraphService');
    const { seeded } = await seedKG();
    if (seeded) console.log('Clinical knowledge graph document created');
  } catch (e) {
    console.warn('Knowledge graph seed skipped:', e.message);
  }

  return conn;
};

module.exports = connectDB;
