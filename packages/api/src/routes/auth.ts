import type { Env } from "../index";
import { Database } from "../db";
import type {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ApiResponse,
  AuthPayload,
} from "@syncstuff/shared";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

export async function handleAuth(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.syncstuff_db);
  const jwtSecret = new TextEncoder().encode(env.JWT_SECRET || "dev-secret-key-change-me");

  // POST /api/auth/register
  if (path === "/api/auth/register" && request.method === "POST") {
    try {
      const body = await request.json<RegisterRequest>();
      
      // Basic validation
      if (!body.email || !body.password || !body.username) {
        return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), { status: 400, headers });
      }

      // Check if user exists
      const existing = await db.getUserByEmail(body.email);
      if (existing) {
        return new Response(JSON.stringify({ success: false, error: "Email already exists" }), { status: 409, headers });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Create user
      const newUser = await db.createUser(body, passwordHash);
      if (!newUser) {
        return new Response(JSON.stringify({ success: false, error: "Failed to create user" }), { status: 500, headers });
      }

      // Generate Token
      const token = await new jose.SignJWT({ sub: newUser.id, role: newUser.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(jwtSecret);

      const response: ApiResponse<AuthPayload> = {
        success: true,
        data: {
          token,
          user: newUser,
        },
      };

      return new Response(JSON.stringify(response), { status: 201, headers });

    } catch (e) {
      console.error("Register Error:", e);
      return new Response(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400, headers });
    }
  }

  // POST /api/auth/login
  if (path === "/api/auth/login" && request.method === "POST") {
    try {
      const body = await request.json<LoginRequest>();

      if (!body.email || !body.password) {
        return new Response(JSON.stringify({ success: false, error: "Missing email or password" }), { status: 400, headers });
      }

      const userRecord = await db.getUserByEmail(body.email);
      if (!userRecord) {
        return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), { status: 401, headers });
      }

      // If user has no password (e.g. OAuth only), they can't login with password
      if (!userRecord.password_hash) {
          return new Response(JSON.stringify({ success: false, error: "Please login with your social account" }), { status: 401, headers });
      }

      const isValid = await bcrypt.compare(body.password, userRecord.password_hash);
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), { status: 401, headers });
      }

      const { user } = userRecord;

      // Generate Token
      const token = await new jose.SignJWT({ sub: user.id, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(jwtSecret);

      const response: ApiResponse<AuthPayload> = {
        success: true,
        data: {
          token,
          user,
        },
      };

      return new Response(JSON.stringify(response), { status: 200, headers });

    } catch (e) {
       console.error("Login Error:", e);
       return new Response(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400, headers });
    }
  }

  // POST /api/auth/change-password
  if (path === "/api/auth/change-password" && request.method === "POST") {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers });
        }
        const token = authHeader.split(" ")[1];
        
        let payload;
        try {
            const result = await jose.jwtVerify(token, jwtSecret);
            payload = result.payload;
        } catch {
            return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401, headers });
        }

        const userId = payload.sub;
        if (!userId) {
             return new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401, headers });
        }

        const body = await request.json<ChangePasswordRequest>();
        const { currentPassword, newPassword } = body;

        if (!newPassword) {
            return new Response(JSON.stringify({ success: false, error: "New password is required" }), { status: 400, headers });
        }

        // Get user to check current password
        const userRecord = await db.getUserById(userId);
        if (!userRecord) {
             return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers });
        }

        // Only check current password if one is set
        if (userRecord.password_hash) {
            if (!currentPassword) {
                return new Response(JSON.stringify({ success: false, error: "Current password is required" }), { status: 400, headers });
            }
            const isValid = await bcrypt.compare(currentPassword, userRecord.password_hash);
            if (!isValid) {
                 return new Response(JSON.stringify({ success: false, error: "Incorrect current password" }), { status: 401, headers });
            }
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const updated = await db.updateUserPassword(userId, newPasswordHash);
        
        if (updated) {
             return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        } else {
             return new Response(JSON.stringify({ success: false, error: "Failed to update password" }), { status: 500, headers });
        }

    } catch (e) {
        console.error("Change Password Error:", e);
        return new Response(JSON.stringify({ success: false, error: "Server error" }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers,
  });
}
