import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/motion/MotionProvider";
import { SITE } from "@/content/landing";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: { card: "summary", title: SITE.name, description: SITE.description },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets the cart bar respect env(safe-area-inset-*)
  themeColor: "#fff8ec",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        {/* Without JavaScript, scroll-reveal elements must still be visible. */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only z-[100] rounded-pill bg-oven-dark px-5 py-3 text-body-sm text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
