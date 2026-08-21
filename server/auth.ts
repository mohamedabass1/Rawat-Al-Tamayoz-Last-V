import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db, StoredUser } from "./db.js";

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "rawat_al_tamayoz_secure_session_secret_2026";

export interface TokenPayload {
  userId: string;
  username: string;
  exp: number;
}

/**
 * Generates a signed, tamper-proof session token valid for 30 days.
 */
export function generateToken(user?: { id: string; username: string }): string {
  if (!user) {
    return crypto.randomBytes(32).toString("hex");
  }

  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days session
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `rt_${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token.
 */
export function verifySignedToken(token: string): TokenPayload | null {
  if (!token || !token.startsWith("rt_")) return null;

  const parts = token.substring(3).split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8"),
    ) as TokenPayload;
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (req.headers["x-auth-token"]) {
      token = String(req.headers["x-auth-token"]).trim();
    }

    if (!token) {
      res
        .status(401)
        .json({ error: "غير مصرح لك بالوصول. يرجى تسجيل الدخول أولاً." });
      return;
    }

    // 1. Try verifying signed token (resilient, persistent across restarts)
    const verifiedPayload = verifySignedToken(token);
    if (verifiedPayload) {
      const user =
        (await db.findUserById(verifiedPayload.userId)) ||
        (await db.findUserByUsername(verifiedPayload.username));
      if (user) {
        req.user = user;
        next();
        return;
      }
    }

    // 2. Fallback to token array lookup in database / local store
    const user = await db.findUserByToken(token);
    if (!user) {
      res
        .status(401)
        .json({ error: "انتهت صلاحية الجلسة. يرجى إعادة تسجيل الدخول." });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("requireAuth middleware error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء التحقق من الصلاحيات" });
  }
}
