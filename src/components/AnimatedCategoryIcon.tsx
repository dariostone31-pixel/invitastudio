"use client";

import React from "react";
import type { EventCategory } from "@/templates/catalog";

interface AnimatedCategoryIconProps {
  category: "all" | EventCategory;
  className?: string;
}

export function AnimatedCategoryIcon({
  category,
  className = "h-4 w-4",
}: AnimatedCategoryIconProps) {
  switch (category) {
    case "boda":
      // Interlocked wedding rings with subtle glint
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-ring-glint`}
          aria-hidden="true"
        >
          <circle cx="9.5" cy="14" r="5" />
          <circle cx="14.5" cy="14" r="5" />
          <path d="M12 4.5l1.2 1.8L12 8l-1.2-1.7L12 4.5z" />
        </svg>
      );
    case "xv":
      // Royal XV crown
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-crown-float`}
          aria-hidden="true"
        >
          <path d="M3 18h18l-1.5-9-4.5 3.5L12 6l-3 6.5L4.5 9 3 18z" />
          <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case "hombre":
      // Dual toast glasses / rooftop celebration
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-icon-sway`}
          aria-hidden="true"
        >
          <path d="M8 21h8" />
          <path d="M12 15v6" />
          <path d="M7 4h10l-1.4 7.2a3.7 3.7 0 0 1-7.2 0L7 4z" />
          <path d="M18.5 3.5l.8 1.2M5.5 3.5l-.8 1.2" />
        </svg>
      );
    case "nino":
      // Space rocket with gentle bob
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-rocket-bob`}
          aria-hidden="true"
        >
          <path d="M12 3c3.5 3 5 6.8 5 10.5L14 16H10l-3-2.5C7 9.8 8.5 6 12 3z" />
          <circle cx="12" cy="10" r="1.5" />
          <path d="M10 19l2 2 2-2" />
        </svg>
      );
    case "nina":
      // Delicate butterfly
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-butterfly-flutter`}
          aria-hidden="true"
        >
          <path d="M12 7v11" />
          <path d="M12 10C9.5 5 4 5.5 4 9.5c0 2.5 3 3.5 5 3.5-2 1-3.5 2.5-2.5 4.5 1.2 2 4.5 1 5.5-2" />
          <path d="M12 10c2.5-5 8-4.5 8-.5 0 2.5-3 3.5-5 3.5 2 1 3.5 2.5 2.5 4.5-1.2 2-4.5 1-5.5-2" />
        </svg>
      );
    case "bautismo":
      // Olive branch & dove halo
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-dove-glide`}
          aria-hidden="true"
        >
          <path d="M4 17c4 0 7-3 10-7 2-2.6 4.5-4 6-4-1 3.5-2 6-4.5 8.5C13 17 9 18.5 4 17z" />
          <path d="M7 16l-2 3" />
          <path d="M15 6.5c1.5-.8 3-.5 4 .5" />
        </svg>
      );
    case "all":
    default:
      // Four-point editorial star
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} animate-icon-beat`}
          aria-hidden="true"
        >
          <path d="M12 3l2.1 6.2L20 12l-5.9 2.8L12 21l-2.1-6.2L4 12l5.9-2.8L12 3z" />
        </svg>
      );
  }
}
