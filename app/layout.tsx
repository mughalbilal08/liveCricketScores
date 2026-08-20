import type { Metadata } from "next";
import { Oswald, Work_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Live Cricket Scores",
  description: "Live cricket scores across every series, scraped from ESPNcricinfo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-pitch text-chalk`}>
        <div className="fixed inset-0 bg-stadium bg-cover bg-center bg-no-repeat -z-10" />
        {children}
      </body>
    </html>
  );
}
