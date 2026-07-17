import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: here });
const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: { "@next/next/no-img-element": "off" } },
  { files: ["components/pdf/**/*.tsx"], rules: { "jsx-a11y/alt-text": "off", "react/no-unescaped-entities": "off" } },
  { ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts", "**/*.new", "**/*.new2"] },
];

export default config;

