// Sign-in throttle: 5 wrong passwords per email in 15 minutes. Kept in the database so it works across server instances.
// It is keyed by the email that was typed, whether or not that account exists, so it reveals nothing about who has one.
// (Trade-off: someone can lock a known email for 15 minutes by guessing wrong on purpose.)

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
let indexed;

function collection(db) {
  const col = db.collection("loginAttempts");
  indexed ??= col.createIndex({ windowStart: 1 }, { expireAfterSeconds: 60 * 60 }).catch(() => {});
  return col;
}

export async function isLimited(db, email) {
  const col = collection(db);
  const doc = await col.findOne({ email });
  if (!doc) return false;
  if (Date.now() - new Date(doc.windowStart).getTime() > WINDOW_MS) {
    await col.deleteOne({ email });
    return false;
  }
  return doc.count >= MAX_FAILURES;
}

export async function recordFailure(db, email) {
  await collection(db).updateOne({ email }, { $inc: { count: 1 }, $setOnInsert: { windowStart: new Date() } }, { upsert: true });
}

export async function clearFailures(db, email) {
  await collection(db).deleteOne({ email });
}

// General fixed-window counter: returns false when `key` already used up `max` hits inside `windowMs`.
// Used for sign-ups (per IP) and placing orders (per account). Stored in the database like the sign-in throttle.
let limitsIndexed;
export async function consume(db, key, max, windowMs) {
  const col = db.collection("rateLimits");
  limitsIndexed ??= col.createIndex({ windowStart: 1 }, { expireAfterSeconds: 24 * 60 * 60 }).catch(() => {});
  const doc = await col.findOne({ key });
  if (doc && Date.now() - new Date(doc.windowStart).getTime() > windowMs) {
    await col.deleteOne({ key });
  } else if (doc && doc.count >= max) {
    return false;
  }
  await col.updateOne({ key }, { $inc: { count: 1 }, $setOnInsert: { windowStart: new Date() } }, { upsert: true });
  return true;
}
