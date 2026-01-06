import type { Env } from "../index";
import { Database } from "../db";
import type { LoginRequest, RegisterRequest, ApiResponse, AuthPayload } from "@syncstuff/shared";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

export async function handleAuth(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
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

        const body: any = await request.json(); // TODO: Add type
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return new Response(JSON.stringify({ success: false, error: "Missing fields" }), { status: 400, headers });
        }

        // Get user to check current password
        const userRecord = await db.getUserById(userId);
        if (!userRecord) {
             return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers });
        }

        const isValid = await bcrypt.compare(currentPassword, userRecord.password_hash);
        if (!isValid) {
             return new Response(JSON.stringify({ success: false, error: "Incorrect current password" }), { status: 401, headers });
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