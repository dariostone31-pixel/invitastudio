import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
  variable: "--font-cormorant",
});

const alexBrush = localFont({
  src: [{ path: "./fonts/alex-brush.woff2", weight: "400", style: "normal" }],
  display: "swap",
  fallback: ["cursive"],
  variable: "--font-script",
});

const pinyonScript = localFont({
  src: [{ path: "./fonts/pinyon-script.woff2", weight: "400", style: "normal" }],
  display: "swap",
  fallback: ["cursive"],
  variable: "--font-pinyon",
});

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
  variable: "--font-fraunces",
});

const jost = localFont({
  src: [{ path: "./fonts/jost.woff2", weight: "300 700", style: "normal" }],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-jost",
});

const cinzel = localFont({
  src: [{ path: "./fonts/cinzel.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
  fallback: ["Georgia", "serif"],
  variable: "--font-cinzel",
});

const jakarta = localFont({
  src: [{ path: "./fonts/plus-jakarta-sans.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-jakarta",
});

const oswald = localFont({
  src: [{ path: "./fonts/oswald.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-oswald",
});

const fredoka = localFont({
  src: [{ path: "./fonts/fredoka.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-fredoka",
});

const playfair = localFont({
  src: [
    { path: "./fonts/playfair-display-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/playfair-display-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://invitastudio-vert.vercel.app")
  ),
  title: "Invita con Alma — Invitaciones Digitales Interactivas",
  description:
    "Invitaciones web interactivas con sobre animado, música integrada, mapas y confirmación de asistencia en tiempo real para Bodas, XV Años, Hombres, Niños y Niñas.",
  openGraph: {
    title: "Invita con Alma — Invitaciones Digitales de Autor",
    description:
      "42 diseños interactivos con sobre animado, música, mapa en 1 toque y panel RSVP para WhatsApp en menos de 24 hs.",
    url: "/",
    siteName: "Invita con Alma",
    images: [
      {
        url: "/images/templates/boda-jardin-botanico.webp",
        alt: "Invita con Alma — Invitaciones Digitales Interactivas",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invita con Alma — Invitaciones Digitales de Autor",
    description:
      "Invitaciones interactivas con sobre animado, música y RSVP inteligente en menos de 24 hs.",
    images: ["/images/templates/boda-jardin-botanico.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${alexBrush.variable} ${pinyonScript.variable} ${fraunces.variable} ${jost.variable} ${cinzel.variable} ${jakarta.variable} ${oswald.variable} ${fredoka.variable} ${playfair.variable}`}
    >
      <body className="font-jakarta antialiased selection:bg-amber-200/60 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
