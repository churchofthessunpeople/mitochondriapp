import type { Metadata, Viewport } from "next";
import { SiteDisclaimer } from "@/components/site-disclaimer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mitochondriapp",
    template: "%s · Mitochondriapp",
  },
  description:
    "A quiet, public field guide to light, water, magnetism, and supportive mitochondrial habits.",
  icons: {
    icon: "/icons/app-icon.jpg",
    apple: "/icons/app-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    title: "Mitochondriapp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0a06" },
    { media: "(prefers-color-scheme: light)", color: "#f4ead4" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        {children}
        <SiteDisclaimer />
      </body>
    </html>
  );
}
