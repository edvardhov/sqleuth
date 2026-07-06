import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQLeuth — Noir SQL Detective Game",
  description:
    "A gamified, local-first SQL learning platform styled as a 1940s noir detective game. Solve a murder mystery by querying suspects, alibis, and evidence.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SQLeuth — Noir SQL Detective Game",
    description:
      "Learn SQL by solving a 1940s noir murder mystery. Query suspects, alibis, and evidence.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
