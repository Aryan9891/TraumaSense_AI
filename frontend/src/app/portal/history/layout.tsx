import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Case Status & Safety Recommendations",
  description:
    "Securely monitor filed distress reports, clinical SVI severity scores, and prescribed medical or legal safety plans.",
  alternates: {
    canonical: "/portal/history",
  },
  openGraph: {
    title: "Track Your Case Status & Safety Recommendations",
    description:
      "Review case history, stress vulnerability indices, and emergency action status.",
    url: "/portal/history",
  },
};

export default function CaseHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
