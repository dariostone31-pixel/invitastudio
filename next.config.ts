import type { NextConfig } from "next";

const allowIframePreview = process.env.ALLOW_IFRAME_PREVIEW === "1";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(!allowIframePreview
    ? [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
      ]
    : []),
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const noIndexHeader = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/panel/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/personalizar/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/i/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/api/:path*",
        headers: noIndexHeader,
      },
    ];
  },
};

export default nextConfig;
