import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { TITLE } from "@/lib/globals";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// export viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
  colorScheme: "light",
  themeColor: "#3B5998",
};

export const metadata: Metadata = {
  title: TITLE,
  description: TITLE,
  icons: { icon: "/apple-touch-icon.png", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
  applicationName: TITLE,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sparrows Ticket Scan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const style = document.createElement('style')
              style.innerHTML = '@layer tailwind-base, tailwind-utilities;'
              style.setAttribute('type', 'text/css')
              document.querySelector('head').prepend(style)
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-primary-100">
        {children}
        <Toaster richColors closeButton position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
