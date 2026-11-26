"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { MotionProfile } from "@/templates/catalog";
import { SILK_EASE } from "@/components/motion/SoulChoreography";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  motionProfile?: MotionProfile;
  luxurySpring?: boolean;
  editorialSlide?: boolean;
  organicFluid?: boolean;
  botanicalStagger?: boolean;
  elasticSpring?: boolean;
}

export function RevealSection({
  children,
  className = "",
  delayMs = 0,
  motionProfile,
  luxurySpring = false,
  editorialSlide = false,
  organicFluid = false,
  botanicalStagger = false,
  elasticSpring = false,
}: RevealSectionProps) {
  const [visible, setVisible] = useState(false);

  if (motionProfile === "editorial" || editorialSlide) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.16 }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 22,
          delay: delayMs / 1000,
        }}
        onViewportEnter={() => setVisible(true)}
        data-revealed={visible ? "true" : "false"}
        className={`reveal-section will-change-transform ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  if (motionProfile === "festive" || elasticSpring) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.16 }}
        transition={{
          type: "spring",
          stiffness: 85,
          damping: 16,
          delay: delayMs / 1000,
        }}
        onViewportEnter={() => setVisible(true)}
        data-revealed={visible ? "true" : "false"}
        className={`reveal-section will-change-transform ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  if (botanicalStagger) {
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.16 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.9,
              ease: SILK_EASE,
              staggerChildren: 0.14,
              delayChildren: delayMs / 1000,
            },
          },
        }}
        onViewportEnter={() => setVisible(true)}
        data-revealed={visible ? "true" : "false"}
        className={`reveal-section will-change-transform ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  if (luxurySpring || organicFluid || motionProfile === "cinematic") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{
          duration: 0.95,
          ease: SILK_EASE,
          delay: delayMs / 1000,
        }}
        onViewportEnter={() => setVisible(true)}
        data-revealed={visible ? "true" : "false"}
        className={`reveal-section will-change-transform ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.9,
        ease: SILK_EASE,
        delay: delayMs / 1000,
      }}
      onViewportEnter={() => setVisible(true)}
      data-revealed={visible ? "true" : "false"}
      className={`reveal-section will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
