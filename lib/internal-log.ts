export function logInternalFailure(operation: string, error: unknown): void {
  const details = error && typeof error === "object"
    ? error as { name?: unknown; message?: unknown }
    : null;
  console.error("CyberShield operation failed", {
    operation,
    error: {
      name: typeof details?.name === "string" ? details.name : "UnknownError",
      message: typeof details?.message === "string" ? details.message : "Unknown internal failure",
    },
  });
}
