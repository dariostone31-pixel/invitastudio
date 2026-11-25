import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Administración — Invita con el Alma",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
