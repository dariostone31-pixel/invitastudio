"use client";

import { useEffect } from "react";
import { captureUtmAndLeadFromUrl } from "@/lib/utm";

export function UtmTracker() {
  useEffect(() => {
    captureUtmAndLeadFromUrl();
  }, []);

  return null;
}
