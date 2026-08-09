import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/watch/"], // Player pages are utility pages; keep them out of the index.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
