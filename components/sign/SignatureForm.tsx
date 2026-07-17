"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { CONSENT_TEXT } from "@/lib/agreement/content";

export function SignatureForm({ token, customerName }: { token: string; customerName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const padRef = useRef<SignaturePad | null>(null);
  const [typedName, setTypedName] = useState(""); const [consent, setConsent] = useState(false); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const pad = new SignaturePad(canvas, { minWidth: 0.8, maxWidth: 2.5, penColor: "#111827", backgroundColor: "rgb(255,255,255)" }); padRef.current = pad;
    const resize = () => { const data = pad.isEmpty() ? [] : pad.toData(); const ratio = Math.max(window.devicePixelRatio || 1, 1); const width = canvas.getBoundingClientRect().width; canvas.width = width * ratio; canvas.height = 220 * ratio; canvas.getContext("2d")?.scale(ratio, ratio); pad.clear(); if (data.length) pad.fromData(data); };
    resize(); const observer = new ResizeObserver(resize); observer.observe(canvas); return () => { observer.disconnect(); pad.off(); padRef.current = null; };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); const pad = padRef.current;
    if (!typedName.trim()) return setError("Enter your complete legal name.");
    if (!pad || pad.isEmpty()) return setError("Draw your signature in the box.");
    if (!consent) return setError("You must actively accept the electronic-signature consent.");
    if (!window.confirm("Sign and complete this agreement? After signing, the agreement cannot be changed.")) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, typedSignerName: typedName, consent: "on", consentText: CONSENT_TEXT, signatureDataUrl: pad.toDataURL("image/png") }) });
      const result = await response.json() as { error?: string; completionToken?: string };
      if (!response.ok || !result.completionToken) throw new Error(result.error || "Signing could not be completed");
      window.location.assign(`/sign/complete?token=${encodeURIComponent(result.completionToken)}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Signing could not be completed"); setSubmitting(false); }
  }

  return <form onSubmit={submit} className="sign-form">
    <h2>Electronic signature</h2><p>Type your complete legal name, draw your signature, and review the consent below.</p>
    {error && <div className="sign-alert" role="alert">{error}</div>}
    <label htmlFor="typedSignerName">Complete legal name</label><input id="typedSignerName" value={typedName} onChange={(event) => setTypedName(event.target.value)} maxLength={160} autoComplete="name" required placeholder={customerName} />
    <div className="signature-label"><span>Draw signature</span><button type="button" onClick={() => padRef.current?.clear()}>Clear and redraw</button></div>
    <canvas ref={canvasRef} className="signature-canvas" aria-label="Draw your signature using mouse, touch or stylus" />
    <label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>“{CONSENT_TEXT}”</span></label>
    <button type="submit" className="sign-submit" disabled={submitting}>{submitting ? "Completing securely…" : "Sign and Complete Agreement"}</button>
    <p className="sign-final-note">You will be asked for final confirmation. Once completed, this agreement cannot be changed.</p>
  </form>;
}

