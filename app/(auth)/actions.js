"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongo";
import { createSession, destroySession } from "@/lib/session";
import { validate } from "@/lib/validation";
import { headers } from "next/headers";
import { isLimited, recordFailure, clearFailures, consume } from "@/lib/rateLimit";

// bcrypt hash of a random string: compared when the email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), 12);

// Only allow same-site relative redirects.
function safeNext(value) {
  const next = String(value || "");
  // "/\\evil.com" and control characters are read as another site by browsers, so only plain "/path" is allowed.
  return /^\/(?![/\\])[^\\\u0000-\u001f]*$/.test(next) ? next : "/menu";
}

export async function login(_prev, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));

  if (password.length > 1000) return { error: "Your email or password is incorrect.", values: { email } };
  const errors = validate("login", { email, password });
  if (Object.keys(errors).length) return { errors, values: { email } };

  let user;
  try {
    const db = await getDb();
    if (await isLimited(db, email)) {
      return { error: "Too many attempts. Try again in a few minutes.", values: { email } };
    }
    const found = await db.collection("users").findOne({ email });
    const ok = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);
    if (found && ok) {
      user = { id: found._id.toString(), name: found.name, email: found.email };
      await clearFailures(db, email);
    } else {
      await recordFailure(db, email);
    }
  } catch (error) {
    console.error(error);
    return { error: "We couldn't reach the database. Please try again.", values: { email } };
  }
  if (!user) return { error: "Your email or password is incorrect.", values: { email } };

  await createSession(user);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(_prev, formData) {
  const name = String(formData.get("name") || "").trim().replace(/\s+/g, " ");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const next = safeNext(formData.get("next"));
  const values = { name, email };

  const errors = validate("register", { name, email, password, confirm });
  if (Object.keys(errors).length) return { errors, values };

  let user;
  try {
    const db = await getDb();
    const ip = ((await headers()).get("x-forwarded-for") || "local").split(",")[0].trim().slice(0, 64);
    if (!(await consume(db, `register:${ip}`, 10, 60 * 60 * 1000))) {
      return { error: "Too many sign-ups from this network. Try again later.", values };
    }
    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    const result = await users.insertOne({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date(),
    });
    user = { id: result.insertedId.toString(), name, email };
  } catch (error) {
    if (error?.code === 11000) {
      return { errors: { email: "An account with this email already exists." }, exists: true, values };
    }
    console.error(error);
    return { error: "We couldn't create your account. Please try again.", values };
  }

  await createSession(user);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
