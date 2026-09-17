import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

function getDatabaseUrl(): string {
  let url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  const schema = process.env.DB_SCHEMA || "dubaifinance";
  if (url && !url.includes("schema=")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}schema=${schema}`;
  }
  return url;
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: getDatabaseUrl(),
  },
});