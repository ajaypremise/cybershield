"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";

export function ShieldVisual() {
  const reduced = useReducedMotion();
  return (
    <div className="shield-visual" aria-label="CyberShield is actively protecting your business network">
      <div className="orbital orbital-one" />
      <div className="orbital orbital-two" />
      <motion.div
        className="shield-core"
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShieldCheck size={78} strokeWidth={1.25} aria-hidden="true" />
        <span className="status-pill"><i /> Protection active</span>
      </motion.div>
      {["Internet", "Cloud", "Office", "Remote"].map((item, index) => (
        <motion.span
          key={item}
          className={`orbit-label orbit-label-${index + 1}`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.2 }}
        >
          <Check size={13} /> {item}
        </motion.span>
      ))}
    </div>
  );
}

