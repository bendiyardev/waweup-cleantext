import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cleantext.waweup.com"),
  title: "CleanText by WaweUp",
  description:
    "Remove invisible and unwanted characters from your text. Processed locally in your browser.",
  openGraph: {
    title: "CleanText by WaweUp",
    description:
      "Remove invisible and unwanted characters from your text. Processed locally in your browser.",
    url: "https://cleantext.waweup.com",
    siteName: "CleanText",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
