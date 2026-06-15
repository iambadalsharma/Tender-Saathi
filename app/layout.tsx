import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tender Saathi",
  description:
    "A simple customer portal for tender filing, order tracking, and tender folders.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

