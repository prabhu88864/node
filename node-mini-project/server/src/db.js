// server/src/db.js
import mongoose from 'mongoose';
import 'dotenv/config';

let connected = false;

function parseDbName(uri) {
  try {
    const u = new URL(uri);
    const p = (u.pathname || '').replace(/^\//, '');
    if (p && p.length > 0) return p.split('?')[0];
  } catch (e) {
    const m = uri.match(/\/([^/?]+)(\?|$)/);
    if (m && m[1]) return m[1];
  }
  return null;
}

export async function connectDB() {
  if (connected) return mongoose;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  const explicitDb = process.env.DB_NAME;
  const parsed = parseDbName(uri);
  const dbName = explicitDb || parsed || 'crud';

  // Connect without unsupported legacy options
  await mongoose.connect(uri, { dbName });

  connected = true;
  console.log('MongoDB connected. DB NAME =', mongoose.connection.db.databaseName);
  return mongoose;
}
