import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { SiteDisclaimer } from "@/components/site-disclaimer";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mitochondriapp",
    template: "%s · Mitochondriapp",
  },
  description:
    "Track Dr. Jack Kruse-inspired lifestyle protocols for light, magnetism, water, and circadian health. Log daily actions, earn points, climb the leaderboard.",
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
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            {children}
            <SiteDisclaimer />
            <BottomNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
