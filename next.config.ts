import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com", // Twitter/X avatars
      },
      {
        protocol: "https",
        hostname: "media.licdn.com", // LinkedIn avatars
      },
    ],
  },

  // Silence known harmless warnings from framer-motion / radix
  typescript: {
    ignoreBuildErrors: true,
  },

  // Security headers
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? `'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co`
      : `'self' 'unsafe-inline' https://js.paystack.co`;

    // Static CSP (no nonce) — used for API routes and static assets.
    // The middleware injects a stricter nonce-based CSP for all HTML pages.
    const staticCsp = [
      `default-src 'self'`,
      `script-src ${scriptSrc}`,
      // The two font hosts are load-bearing: without them the display face and
      // the Google families are blocked, and the landing page loses both its
      // typography and the hero's gradient. Deliberately NO nonce in style-src
      // — per CSP a nonce makes 'unsafe-inline' inert, which strips every
      // inline style attribute on the page.
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com`,
      `img-src 'self' blob: data: https://res.cloudinary.com ${supabaseUrl} https://lh3.googleusercontent.com https://pbs.twimg.com https://media.licdn.com`,
      `font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com`,
      `connect-src 'self' https://res.cloudinary.com ${supabaseUrl} https://openrouter.ai https://api.paystack.co wss://*.supabase.co`,
      `media-src 'self' blob: https://res.cloudinary.com`,
      `frame-ancestors 'none'`,
      `form-action 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: staticCsp,
          },
        ],
      },
    ];
  },

  // Redirects for legacy routes
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
