import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Alex_Brush,
  Pinyon_Script,
  Fraunces,
  Jost,
  Cinzel,
  Plus_Jakarta_Sans,
  Oswald,
  Fredoka,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
});

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jost",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://invitastudio.vercel.app"),
  title: "InvitaStudio — Invitaciones Digitales Interactivas",
  description:
    "Invitaciones web interactivas con sobre animado, música integrada, mapas y confirmación de asistencia en tiempo real para Bodas, XV Años, Hombres, Niños y Niñas.",
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
