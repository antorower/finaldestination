import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const NotFound = () => {
  // Παίρνουμε όλα τα headers
  const headersList = headers();
  const headersObj = Object.fromEntries(headersList.entries());

  // IP από x-forwarded-for
  const xff = headersList.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : "unknown";

  // Geo info (αν τα στείλει η Vercel)
  const country = headersList.get("x-vercel-ip-country") || "unknown";
  const city = headersList.get("x-vercel-ip-city") || "unknown";
  const region = headersList.get("x-vercel-ip-region") || "unknown";

  // Άλλα χρήσιμα
  const ua = headersList.get("user-agent") || "-";
  const referer = headersList.get("referer") || "-";
  const url = headersList.get("host") + (headersList.get("x-original-pathname") || "");

  // Log στο Vercel
  console.error("❌ 404 NotFound Request", {
    ip,
    country,
    city,
    region,
    ua,
    referer,
    url,
    headers: headersObj, // για να έχεις τα πάντα
    ts: new Date().toISOString(),
  });

  return <div className="text-white font-bold text-5xl h-dvh w-dvw flex justify-center items-center animate-pulse">404</div>;
};

export default NotFound;
