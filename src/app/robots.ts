import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://invitastudio.vercel.app").replace(
    /\/$/,
    ""
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/encargar", "/demo/"],
        disallow: ["/admin", "/panel/", "/personalizar/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
