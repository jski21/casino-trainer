import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Trainer",
  description: "Blackjack and Texas Hold'em training app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
