export interface BatchPrior {
  known: boolean;
  data: unknown;
}

/** Read each batch ref before commit. A failed read does not cancel the business write. */
export async function captureBatchBefores<T extends { ref: unknown }>(
  ops: T[],
  read: (ref: unknown) => Promise<BatchPrior>
): Promise<BatchPrior[]> {
  return Promise.all(ops.map(async (op) => {
    try {
      return await read(op.ref);
    } catch {
      return { known: false, data: null };
    }
  }));
}
