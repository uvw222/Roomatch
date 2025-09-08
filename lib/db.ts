
//lib/db.ts
import mongoose from "mongoose";
import type { Document } from "mongoose";
import connectToDatabase from "./mongodb";

/**
 * Returns a MongoDB collection instance after ensuring connection.
 */
export async function getCollection<T extends Document = Document>(
  name: string
): Promise<any> {
  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not established");

  return db.collection<T>(name);
}
