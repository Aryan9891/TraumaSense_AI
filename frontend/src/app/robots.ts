import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://traumasense-ai.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/portal", "/portal/history"],
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
