"use server";

import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/session";

// Adds or removes a favourite for the signed-in user. Returns { favourite: true | false } or { error }.
export async function toggleFavourite(itemId) {
  const user = await getSession();
  if (!user) return { error: "login" };
  const id = Number(itemId);
  if (!Number.isInteger(id) || id < 1) return { error: "invalid" };
  try {
    const db = await getDb();
    if (!(await db.collection("menu").findOne({ id }))) return { error: "invalid" };
    const col = db.collection("favourites");
    await col.createIndex({ userId: 1, itemId: 1 }, { unique: true });
    if (await col.findOne({ userId: user.id, itemId: id })) {
      await col.deleteOne({ userId: user.id, itemId: id });
      return { favourite: false };
    }
    await col.insertOne({ userId: user.id, itemId: id, createdAt: new Date() });
    return { favourite: true };
  } catch (error) {
    if (error?.code === 11000) return { favourite: true };
    console.error(error);
    return { error: "failed" };
  }
}
