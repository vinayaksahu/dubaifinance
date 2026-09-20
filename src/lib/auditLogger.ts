import { db } from "./db";
import { getClientIp } from "./rate-limit";

export interface ParsedClientDevice {
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
}

export interface ClientGeoLocation {
  ip: string;
  country: string;
  city: string;
  region: string;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  AE: "United Arab Emirates",
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  SG: "Singapore",
  MY: "Malaysia",
  SA: "Saudi Arabia",
  QA: "Qatar",
  KW: "Kuwait",
  OM: "Oman",
  BH: "Bahrain",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  RU: "Russia",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  BD: "Bangladesh",
  PK: "Pakistan",
  NP: "Nepal",
  LK: "Sri Lanka",
};

/**
 * Parses user agent string to extract Browser, OS, and Device Category.
 */
export function parseClientDevice(userAgent?: string | null): ParsedClientDevice {
  if (!userAgent || typeof userAgent !== "string") {
    return { browser: "Unknown Browser", os: "Unknown OS", device: "Unknown" };
  }

  const ua = userAgent;

  // 1. Device category
  let device: "Desktop" | "Mobile" | "Tablet" | "Unknown" = "Desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "Mobile";
  } else if (/android/i.test(ua)) {
    device = "Tablet";
  } else if (/windows|macintosh|mac os x|linux|cros/i.test(ua)) {
    device = "Desktop";
  }

  // 2. Operating System
  let os = "Unknown OS";
  if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows 11 / 10";
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = "Windows 8.1";
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = "Windows 7";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/iphone os ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/iphone os ([0-9_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS (iPhone)";
  } else if (/ipad.*os ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/os ([0-9_]+)/i);
    os = match ? `iPadOS ${match[1].replace(/_/g, ".")}` : "iPadOS";
  } else if (/mac os x ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/mac os x ([0-9_]+)/i);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (/android ([0-9.]+)/i.test(ua)) {
    const match = ua.match(/android ([0-9.]+)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  // 3. Browser
  let browser = "Unknown Browser";
  if (/edg\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/edg\/([0-9.]+)/i);
    browser = match ? `Microsoft Edge ${match[1].split(".")[0]}` : "Microsoft Edge";
  } else if (/opr\/([0-9.]+)/i.test(ua) || /opera/i.test(ua)) {
    const match = ua.match(/opr\/([0-9.]+)/i);
    browser = match ? `Opera ${match[1].split(".")[0]}` : "Opera";
  } else if (/samsungbrowser\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/samsungbrowser\/([0-9.]+)/i);
    browser = match ? `Samsung Internet ${match[1].split(".")[0]}` : "Samsung Internet";
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/chrome\/([0-9.]+)/i);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Chrome";
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/firefox\/([0-9.]+)/i);
    browser = match ? `Firefox ${match[1].split(".")[0]}` : "Firefox";
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    const match = ua.match(/version\/([0-9.]+)/i);
    browser = match ? `Safari ${match[1].split(".")[0]}` : "Safari";
  } else if (/safari/i.test(ua)) {
    browser = "Safari";
  } else if (/postmanruntime/i.test(ua)) {
    browser = "Postman API Client";
  } else if (/curl/i.test(ua)) {
    browser = "cURL Terminal";
  }

  return { browser, os, device };
}

/**
 * Extracts IP address and Geolocation from request headers.
 */
export function extractClientGeo(req?: Request | null): ClientGeoLocation {
  if (!req) {
    return { ip: "127.0.0.1", country: "Localhost", city: "Local", region: "Local" };
  }

  const ip = getClientIp(req);

  // Check if IP is localhost / private loopback
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return {
      ip,
      country: "Local Development",
      city: "Dev Environment",
      region: "Internal Network",
    };
  }

  // Reverse proxy / Cloudflare / Vercel geo headers
  const countryCode = (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country-code") ||
    ""
  ).toUpperCase();

  const city =
    req.headers.get("cf-ipcity") ||
    req.headers.get("x-vercel-ip-city") ||
    req.headers.get("x-city") ||
    "Unknown City";

  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    req.headers.get("cf-region") ||
    "Unknown Region";

  const country = COUNTRY_CODE_MAP[countryCode] || countryCode || "Global Internet";

  return {
    ip,
    country,
    city,
    region,
  };
}

export interface RecordLoginSessionParams {
  userId: string;
  portal: "MEMBER" | "ADMIN" | "SUPER_ROOT";
  req?: Request | null;
  status?: "SUCCESS" | "FAILED";
  failureReason?: string | null;
}

/**
 * Records a login session and creates a corresponding ActivityLog entry.
 */
export async function recordLoginSession(params: RecordLoginSessionParams) {
  try {
    const userAgent = params.req?.headers.get("user-agent") || null;
    const { browser, os, device } = parseClientDevice(userAgent);
    const { ip, country, city, region } = extractClientGeo(params.req);
    const status = params.status || "SUCCESS";

    // 1. Create LoginSession entry
    const session = await db.loginSession.create({
      data: {
        userId: params.userId,
        ipAddress: ip,
        userAgent,
        browser,
        os,
        device,
        country,
        city,
        region,
        portal: params.portal,
        status,
        failureReason: params.failureReason || null,
      },
    });

    // 2. Automatically log to ActivityLog
    const portalName =
      params.portal === "SUPER_ROOT"
        ? "Super Root Portal"
        : params.portal === "ADMIN"
        ? "Admin Portal"
        : "Member Portal";

    const logDesc =
      status === "SUCCESS"
        ? `Logged into ${portalName} from ${device} (${browser} on ${os}), IP: ${ip} [${city}, ${country}]`
        : `Failed login attempt to ${portalName} (${params.failureReason || "Authentication failed"}), IP: ${ip}`;

    await db.activityLog.create({
      data: {
        userId: params.userId,
        action: "LOGIN",
        category: "AUTH",
        description: logDesc,
        ipAddress: ip,
        userAgent,
        browser,
        os,
        device,
        country,
        city,
        metadata: JSON.stringify({
          portal: params.portal,
          status,
          failureReason: params.failureReason || null,
        }),
      },
    });

    return session;
  } catch (error) {
    console.error("[auditLogger.recordLoginSession Error]:", error);
    return null;
  }
}

export interface RecordActivityParams {
  userId: string;
  action: string;
  category: "AUTH" | "SECURITY" | "FINANCIAL" | "ADMIN" | "PROFILE";
  description: string;
  req?: Request | null;
  metadata?: Record<string, any> | null;
}

/**
 * Records an activity/function usage log with client telemetry.
 */
export async function recordActivity(params: RecordActivityParams) {
  try {
    const userAgent = params.req?.headers.get("user-agent") || null;
    const { browser, os, device } = parseClientDevice(userAgent);
    const { ip, country, city } = extractClientGeo(params.req);

    const log = await db.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        category: params.category,
        description: params.description,
        ipAddress: ip,
        userAgent,
        browser,
        os,
        device,
        country,
        city,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    return log;
  } catch (error) {
    console.error("[auditLogger.recordActivity Error]:", error);
    return null;
  }
}
