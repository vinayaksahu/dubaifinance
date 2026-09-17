import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[FATAL SECURITY CONFIGURATION] JWT_SECRET environment variable is missing in production. Application failed closed to prevent token forgery."
      );
    }
    return new TextEncoder().encode("DF-super-secret-key-2026-fallback-dev-only-hs256-minimum-32-chars");
  }

  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION] JWT_SECRET must be at least 32 characters long for HS256 algorithm security."
    );
  }

  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  customId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "SUPER_ROOT_ADMIN";
  email: string;
  adminId?: string | null;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("df_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
