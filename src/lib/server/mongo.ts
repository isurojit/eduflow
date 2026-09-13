import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "eduflow";

declare global {
  var __eduflowMongo: Promise<MongoClient> | undefined;
}

export function mongoConfigured() {
  return Boolean(uri);
}

async function client() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!global.__eduflowMongo) {
    const instance = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    global.__eduflowMongo = instance.connect();
  }

  return global.__eduflowMongo;
}

export async function mongoDb(): Promise<Db> {
  return (await client()).db(dbName);
}
