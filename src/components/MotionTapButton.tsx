"use client";

import React from "react";
import { motion } from "framer-motion";

interface MotionTapProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Envoltorio táctil premium para botones principales:
 * aplica `whileTap={{ scale: 0.97 }}` y transición suave.
 */
export function MotionTap({ children, className = "" }: MotionTapProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
