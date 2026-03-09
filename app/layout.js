import "./globals.css";

export const metadata = {
  title: "AFBrandworks Tweet Manager",
  description: "AI-powered tweet queue manager for @afurkanbudakcom",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
