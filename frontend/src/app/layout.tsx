import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://traumasense-ai.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TraumaSense | Multilingual Crisis Reporting & Clinical Triage Platform India",
    template: "%s | TraumaSense India",
  },
  description:
    "Trauma-informed crisis reporting, acoustic distress triage, and clinical decision support in 7 Indian regional languages for survivors and first responders.",
  keywords: [
    "multilingual crisis helpline India",
    "trauma triage platform",
    "acoustic distress assessment",
    "C-SSRS screening tool",
    "women safety reporting portal",
    "Tele-MANAS integration",
    "emergency response India 112",
    "mental health triage",
    "speech distress biomarkers",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "hi-IN": "/?lang=hi",
      "bn-IN": "/?lang=bn",
      "mr-IN": "/?lang=mr",
      "ta-IN": "/?lang=ta",
      "te-IN": "/?lang=te",
      "or-IN": "/?lang=or",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "TraumaSense India",
    title: "TraumaSense | Multilingual Crisis Reporting & Clinical Triage Platform India",
    description:
      "Trauma-informed crisis reporting, acoustic distress triage, and clinical decision support in 7 Indian regional languages for survivors and first responders.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TraumaSense Clinical Triage & Crisis Response Platform India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TraumaSense | Multilingual Crisis Reporting & Clinical Triage Platform India",
    description:
      "Trauma-informed crisis reporting, acoustic distress triage, and clinical decision support in 7 Indian regional languages for survivors and first responders.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en-IN"
        className={`${newsreader.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-teal-700 selection:text-white">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
          >
            Skip to primary content
          </a>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
