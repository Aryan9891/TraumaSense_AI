import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responder Desk — Emergency Triage & Case Management",
  description:
    "Restricted clinical triage and emergency dispatch console for designated response officers and healthcare staff.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
