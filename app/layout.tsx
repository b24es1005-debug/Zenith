import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { auth } from "@/auth";
import { Providers } from "@/app/providers";
import { SiteHeader } from "@/components/navigation/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zenith",
    template: "%s | Zenith",
  },
  description: "A dark-sky astronomy platform for finding stargazing locations, checking sky conditions, and organizing meetups.",
  openGraph: {
    title: "Zenith",
    description: "Plan dark-sky sessions, check weather and light pollution, and organize astronomy meetups.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-white">
        <Providers session={session}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
