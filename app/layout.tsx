import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Trainer",
  description: "Blackjack, Poker, and Baccarat training app",
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('casino_trainer_theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
