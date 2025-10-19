import type React from "react";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Fiddle Code",
  description: "Fiddle Code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className} antialiased cursor-crosshair`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#ededed",
                border: "1px solid #27272a",
                fontFamily: "Space Mono, monospace",
              },
              className: "sonner-toast",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
