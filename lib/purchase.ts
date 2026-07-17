export type PurchaseCreateResult<T> = { record: T; created: boolean };

export async function createPurchaseOnce<T>(repository: { create(): Promise<T>; findBySubmissionKey(): Promise<T | null> }): Promise<PurchaseCreateResult<T>> {
  const existing = await repository.findBySubmissionKey();
  if (existing) return { record: existing, created: false };
  try { return { record: await repository.create(), created: true }; }
  catch (error) {
    const raced = await repository.findBySubmissionKey();
    if (raced) return { record: raced, created: false };
    throw error;
  }
}

