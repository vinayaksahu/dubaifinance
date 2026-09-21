import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_SECRET_KEY ||
    "DF-super-secret-key-2026-fallback-dev-only-hs256-minimum-32-chars";
  return new TextEncoder().encode(secret);
}

interface JWTSessionPayload {
  userId: string;
  customId: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "SUPER_ROOT_ADMIN";
  email: string;
  adminId?: string | null;
  sessionId?: string;
}

async function verifyEdgeToken(token: string): Promise<JWTSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as JWTSessionPayload;
  } catch {
    return null;
  }
}

function isAllowedHost(hostToCheck: string, currentHost: string): boolean {
  if (!hostToCheck) return false;
  const hostNoPort = hostToCheck.split(":")[0].toLowerCase();
  const currentHostNoPort = currentHost.split(":")[0].toLowerCase();

  if (hostNoPort === currentHostNoPort) return true;
  if (hostNoPort === "localhost" || hostNoPort === "127.0.0.1") return true;
  if (hostNoPort === "dubaifinance.online" || hostNoPort === "www.dubaifinance.online") return true;
  if (hostNoPort.endsWith(".vercel.app")) return true;

  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Immediately block decommissioned / sensitive leaked routes
  if (
    pathname === "/superrootadmin" ||
    pathname.startsWith("/superrootadmin/") ||
    pathname === "/superrootadminlogin" ||
    pathname.startsWith("/superrootadminlogin/")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // 2. API CSRF & Origin Security Guard for Mutating Requests
  if (pathname.startsWith("/api")) {
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (mutatingMethods.includes(req.method)) {
      // Reject cross-site requests identified by modern browsers
      const secFetchSite = req.headers.get("sec-fetch-site");
      if (secFetchSite === "cross-site") {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Cross-site request blocked." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate Origin header if present
      const origin = req.headers.get("origin");
      const currentHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";

      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (!isAllowedHost(originUrl.host, currentHost)) {
            return new NextResponse(
              JSON.stringify({ error: "Forbidden: Invalid request origin." }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
        } catch {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: Malformed origin header." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    return NextResponse.next();
  }

  // 3. Extract and Verify Session Token for Page Routes
  const token = req.cookies.get("df_session")?.value;
  const session = token ? await verifyEdgeToken(token) : null;

  // 4. Edge Route Protection for /member
  if (pathname === "/member" || pathname.startsWith("/member/")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Edge Route Protection for /admin (excluding /adminlogin)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      const adminLoginUrl = new URL("/adminlogin", req.url);
      return NextResponse.redirect(adminLoginUrl);
    }

    // Block non-admin users from accessing /admin dashboard
    if (
      session.role !== "ADMIN" &&
      session.role !== "SUPER_ADMIN" &&
      session.role !== "SUPER_ROOT_ADMIN"
    ) {
      const memberUrl = new URL("/member", req.url);
      return NextResponse.redirect(memberUrl);
    }
  }

  // 6. Redirect already logged-in users away from auth landing pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    if (session && session.role === "USER") {
      const memberUrl = new URL("/member", req.url);
      return NextResponse.redirect(memberUrl);
    }
  }

  if (pathname === "/adminlogin") {
    if (
      session &&
      (session.role === "ADMIN" ||
        session.role === "SUPER_ADMIN" ||
        session.role === "SUPER_ROOT_ADMIN")
    ) {
      const adminUrl = new URL("/admin", req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets (.png, .jpg, .svg, .webp, .ico, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
