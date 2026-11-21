import type { MetadataRoute } from "next";
import { INVITATION_SKINS } from "@/templates/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://invitastudio.vercel.app").replace(
    /\/$/,
    ""
  );
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/encargar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const demoRoutes: MetadataRoute.Sitemap = INVITATION_SKINS.map((skin) => ({
    url: `${baseUrl}/demo/${skin.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...demoRoutes];
}
