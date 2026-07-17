"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Building2, Cloud, Globe2, Laptop, LockKeyhole, Network, ShieldCheck, Smartphone } from "lucide-react";

const nodes = [
  { label: "Internet", sub: "Traffic enters", icon: Globe2 },
  { label: "CyberShield", sub: "Security platform", icon: ShieldCheck, featured: true },
  { label: "Security layers", sub: "Inspect & protect", icon: LockKeyhole },
  { label: "Your network", sub: "Secure access", icon: Network },
  { label: "All devices", sub: "Every connection", icon: Building2 },
];

export function Architecture() {
  const reduced = useReducedMotion();
  return (
    <div className="architecture-panel" aria-label="CyberShield network protection architecture">
      <div className="architecture-grid">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div key={node.label} className="contents">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.88 }}
                whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className={`architecture-node ${node.featured ? "architecture-node-featured" : ""}`}
              >
                <span className="architecture-icon"><Icon size={23} aria-hidden="true" /></span>
                <strong>{node.label}</strong>
                <small>{node.sub}</small>
              </motion.div>
              {index < nodes.length - 1 && (
                <div className="architecture-line" aria-hidden="true">
                  <motion.span
                    animate={reduced ? undefined : { x: ["-20%", "120%"] }}
                    transition={{ duration: 2.1, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="architecture-devices" aria-hidden="true">
        <Laptop size={20} /><Smartphone size={18} /><Cloud size={20} />
        <span>One protected environment</span>
      </div>
    </div>
  );
}
