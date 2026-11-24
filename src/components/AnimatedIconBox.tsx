"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedIconBoxProps {
  children: React.ReactNode;
  index?: number;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  floating?: boolean;
}

/**
 * Contenedor animado reutilizable con Framer Motion para iconos de la landing y de invitaciones.
 * - Entrada al hacer scroll: sube suavemente desde abajo con física de resorte y retardo escalonado.
 * - Micro-animación continua muy sutil (levitación orgánica).
 * - Respuesta dinámica al pasar el cursor (elevación, inclinación y escala).
 */
export function AnimatedIconBox({
  children,
  index = 0,
  staggerDelay = 0.08,
  className = "",
  style,
  floating = true,
}: AnimatedIconBoxProps) {
  const delay = Math.min(index * staggerDelay, 0.45);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 16,
        delay,
      }}
      whileHover={{ y: -4, rotate: 4, scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      className={className}
      style={style}
    >
      {floating ? (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={{ y: [0, -2.5, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (index % 5) * 0.28,
          }}
        >
          {children}
        </motion.span>
      ) : (
        <span className="inline-flex items-center justify-center">{children}</span>
      )}
    </motion.div>
  );
}
