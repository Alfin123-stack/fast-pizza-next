import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/session";
import { SEED_MENU } from "@/lib/seed";
import { enrich } from "@/lib/pizza";
import { popularIds } from "@/lib/popular";

// Once per server process: add menu items that are not in the database yet (by id). Existing rows are never overwritten.
let seeding;
function ensureSeeded(col) {
  seeding ??= (async () => {
    const have = new Set((await col.find({}, { projection: { id: 1, _id: 0 } }).toArray()).map((d) => d.id));
    const missing = SEED_MENU.filter((p) => !have.has(p.id)).map(({ isNew, ...p }) => ({ ...p, ...(isNew ? { addedAt: new Date() } : {}) }));
    if (missing.length) await col.insertMany(missing);
  })().catch((error) => {
    seeding = undefined;
    throw error;
  });
  return seeding;
}

// The menu changes rarely, so it is cached for 5 minutes (tag "menu" to revalidate on demand).
const loadMenu = unstable_cache(
  async () => {
    const col = (await getDb()).collection("menu");
    await ensureSeeded(col);
    return col.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
  },
  ["menu"],
  { revalidate: 300, tags: ["menu"] }
);

export async function getMenu() {
  try {
    return (await loadMenu()).map(enrich);
  } catch (error) {
    console.error(error);
    throw new Error("The menu could not be loaded. Please try again.");
  }
}

const DAY = 24 * 60 * 60 * 1000;

// Best sellers of the last 30 days (see lib/popular.js). Cached for 10 minutes.
const loadPopular = unstable_cache(
  async () => {
    const db = await getDb();
    const orders = await db.collection("orders").find({ createdAt: { $gte: new Date(Date.now() - 30 * DAY) } }, { projection: { cart: 1, _id: 0 } }).toArray();
    const menu = (await db.collection("menu").find({}, { projection: { id: 1, category: 1, _id: 0 } }).toArray());
    return popularIds(orders, menu);
  },
  ["popular"],
  { revalidate: 600 }
);

export async function getPopularIds() {
  try {
    return await loadPopular();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Ids of the menu items the signed-in user has marked as favourites.
export async function getFavouriteIds() {
  const user = await getSession();
  if (!user) return [];
  try {
    const rows = await (await getDb()).collection("favourites").find({ userId: user.id }, { projection: { itemId: 1, _id: 0 } }).toArray();
    return rows.map((r) => r.itemId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// The lines of the signed-in user's latest order: [{ id, name, quantity }].
export async function getLastOrderLines() {
  const user = await getSession();
  if (!user) return [];
  try {
    const orders = await (await getDb()).collection("orders").find({ userId: user.id }, { projection: { cart: 1, createdAt: 1, _id: 0 } }).sort({ createdAt: -1 }).limit(1).toArray();
    return (orders[0]?.cart ?? []).map((l) => ({ id: l.pizzaId, name: l.name, quantity: l.quantity }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// The signed-in user's saved delivery addresses: [{ id, label, address, position }].
export async function getAddresses() {
  const user = await getSession();
  if (!user) return [];
  try {
    const rows = await (await getDb()).collection("addresses").find({ userId: user.id }, { projection: { id: 1, label: 1, address: 1, position: 1, _id: 0 } }).toArray();
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// The signed-in user's latest orders, newest first (no PIN).
export async function getOrders(limit = 20) {
  const user = await getSession();
  if (!user) return [];
  try {
    const rows = await (await getDb())
      .collection("orders")
      .find({ userId: user.id }, { projection: { _id: 0, pin: 0, userId: 0, pinAttempts: 0, phone: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return rows.map((o) => ({ ...o, created_at: o.createdAt.toISOString(), createdAt: undefined, scheduledFor: o.scheduledFor ? new Date(o.scheduledFor).toISOString() : null }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Phone number of the user's latest order, to save typing.
export async function getLastPhone() {
  const user = await getSession();
  if (!user) return "";
  try {
    const rows = await (await getDb()).collection("orders").find({ userId: user.id }, { projection: { phone: 1, createdAt: 1, _id: 0 } }).sort({ createdAt: -1 }).limit(1).toArray();
    return rows[0]?.phone ?? "";
  } catch {
    return "";
  }
}

// Returns null when the order doesn't exist or belongs to someone else.
// The PIN and owner id are never included.
export async function getOrder(orderCode) {
  const user = await getSession();
  if (!user) return null;
  try {
    const order = await (await getDb())
      .collection("orders")
      .findOne({ orderCode, userId: user.id }, { projection: { _id: 0, pin: 0, userId: 0, pinAttempts: 0 } });
    if (!order) return null;
    return { ...order, created_at: order.createdAt.toISOString(), createdAt: undefined };
  } catch (error) {
    console.error(error);
    throw new Error("The order could not be loaded. Please try again.");
  }
}

// { id, name, email } or null
// Cached per request: the navbar, the layout and the page can all ask without re-verifying the cookie.
export const getUser = cache(async () => getSession());
