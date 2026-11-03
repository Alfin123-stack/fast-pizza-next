import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const key = () => {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not set. Add it to .env.local.");
  if (process.env.AUTH_SECRET.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key());
    return { id: payload.sub, name: payload.name, email: payload.email };
  } catch {
    return null;
  }
}

export async function createSession(user) {
  const token = await new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export const SESSION_COOKIE = COOKIE;
