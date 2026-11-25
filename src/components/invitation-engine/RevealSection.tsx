"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
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
  luxurySpring = false,
  editorialSlide = false,
  organicFluid = false,
  botanicalStagger = false,
  elasticSpring = false,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (luxurySpring || editorialSlide || organicFluid || botanicalStagger || elasticSpring) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [luxurySpring, editorialSlide, organicFluid, botanicalStagger, elasticSpring]);

  if (elasticSpring) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{
          type: "spring",
          stiffness: 110,
          damping: 14,
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

  if (luxurySpring) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 18,
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

  if (editorialSlide) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -16, y: 18 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
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

  if (organicFluid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
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
          hidden: { opacity: 0, y: 22 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.11,
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

  return (
    <div
      ref={ref}
      data-revealed={visible ? "true" : "false"}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`reveal-section transition-all duration-700 ease-out will-change-transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
