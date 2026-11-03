const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy. Allowed on purpose: OpenStreetMap tiles (map), bigdatacloud (address lookup from the
// browser) and inline styles/scripts that Next.js itself emits. Tighten script-src with nonces if you add a proxy for it.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
  `connect-src 'self' https://api.bigdatacloud.net${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["react-icons/lu"] },
  async headers() {
    return [{ source: "/:path*", headers: security }];
  },
};
export default nextConfig;
