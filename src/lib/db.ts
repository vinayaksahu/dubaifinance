import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  let connectionString = process.env.DATABASE_URL;

  // Automatically route through Neon's PgBouncer pooler for serverless high-concurrency low-latency
  if (connectionString && connectionString.includes(".neon.tech") && !connectionString.includes("-pooler")) {
    connectionString = connectionString.replace(/ep-([a-z0-9-]+)\./, "ep-$1-pooler.");
  }

  const isSSL = Boolean(
    connectionString?.includes("sslmode=") ||
    connectionString?.includes("neon.tech") ||
    connectionString?.includes("aws")
  );

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 5000,
    ...(isSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  pool.on("error", (err) => {
    console.error("[PG Pool Error]", err);
  });

  let schema = process.env.DB_SCHEMA;
  if (!schema && connectionString) {
    try {
      const parsedUrl = new URL(connectionString);
      schema = parsedUrl.searchParams.get("schema") || undefined;
    } catch {}
  }
  if (!schema) {
    schema = "dubaifinance";
  }

  const adapter = new PrismaPg(pool, { schema });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Always persist on globalThis across all environments to prevent connection pool exhaustion and redundant handshakes
globalForPrisma.prisma = db;