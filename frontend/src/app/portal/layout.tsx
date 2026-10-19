import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File a Confidential Distress Report — Voice & Multilingual Text",
  description:
    "Submit a confidential crisis or trauma statement in your preferred Indian language via voice recording or written narrative for immediate clinical triage.",
  alternates: {
    canonical: "/portal",
  },
  openGraph: {
    title: "File a Confidential Distress Report — Voice & Multilingual Text",
    description:
      "Submit a confidential crisis statement via voice or text in 7 Indian regional languages for immediate acoustic and clinical triage.",
    url: "/portal",
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
