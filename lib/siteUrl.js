import { headers } from "next/headers";

function normalizeSiteUrl(value) {
  const urlMatch = String(value || "").match(/https?:\/\/[^\s"']+/);

  if (!urlMatch) {
    return "";
  }

  return urlMatch[0].replace(/\/$/, "");
}

export async function getSiteUrl() {
  const configuredUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  const headerStore = await headers();
  const origin = normalizeSiteUrl(headerStore.get("origin"));

  if (origin) {
    return origin;
  }

  const vercelUrl = process.env.VERCEL_URL;

  return vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
}
