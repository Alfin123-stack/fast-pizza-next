import { MongoClient } from "mongodb";

const DB_NAME = "fast-react-pizza";

// One shared connection, reused across hot reloads in development.
export async function getDb() {
  if (!process.env.DB_URL) throw new Error("DB_URL is not set. Add it to .env.local.");
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(process.env.DB_URL).connect();
  }
  const client = await globalThis._mongoClient;
  return client.db(DB_NAME);
}
