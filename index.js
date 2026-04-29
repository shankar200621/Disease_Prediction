require('dotenv').config();

const connectDB = require('./config/db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('[warn] JWT_SECRET is not set in .env — auth will return 503 until you add it (see .env.example).');
}

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      console.log(`[Groq] model=${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
    } else {
      console.warn(
        '[info] GROQ_API_KEY not set — using on-server health tips (offline). Add a key to .env for Groq AI.'
      );
    }
  });
}

start();


