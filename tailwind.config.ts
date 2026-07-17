import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020712",
        panel: "#07101f",
        electric: "#2f7dff",
        cyan: "#52d6ff",
      },
      boxShadow: {
        glow: "0 0 60px rgba(47,125,255,.16)",
      },
    },
  },
  plugins: [],
} satisfies Config;

