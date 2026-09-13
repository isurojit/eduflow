import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });
dotenv.config();
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "eduflow");
await Promise.all([
  db.collection("users").createIndex({ uid: 1 }, { unique: true }),
  db.collection("user_states").createIndex({ uid: 1 }, { unique: true }),
  db.collection("documents").createIndex({ ownerUid: 1, createdAt: -1 }),
]);
console.log("EduFlow cloud indexes are ready.");
await client.close();
