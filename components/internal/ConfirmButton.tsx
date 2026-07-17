"use client";

import { useFormStatus } from "react-dom";

export function ConfirmButton({ children, message, className = "internal-primary", danger = false }: { children: React.ReactNode; message: string; className?: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={`${className} ${danger ? "internal-danger" : ""}`} disabled={pending} onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>{pending ? "Working…" : children}</button>;
}

