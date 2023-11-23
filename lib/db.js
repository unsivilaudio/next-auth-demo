import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('Failed to parse "MONGO_URI" from .env.local');
}

export async function connectToDatabase() {
  const client = await MongoClient.connect(MONGO_URI);

  return client;
}
