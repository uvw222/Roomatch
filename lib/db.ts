import mongoose from "mongoose";
import type { Collection, Document } from "mongodb";
import connectToDatabase from "./mongodb";

/**
 * Returns a MongoDB collection instance after ensuring connection.
 */
export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not established");

  return db.collection<T>(name);
}
