import crypto from 'node:crypto';

export interface LedgerEntry {
  id: string;
  sequence: number; // monotonic, never decremented
  type: string;
  tenantId: string;
  actorId: string;
  payload: unknown;
  timestamp: Date;
  hash: string; // SHA-256 of (sequence + type + payload + prevHash)
  prevHash: string; // hash of previous entry, 'GENESIS' for first
}

export function createEntry(
  params: Omit<LedgerEntry, 'id' | 'sequence' | 'hash' | 'prevHash'>,
  prev: LedgerEntry | null,
): LedgerEntry {
  const sequence = prev ? prev.sequence + 1 : 0;
  const prevHash = prev ? prev.hash : 'GENESIS';
  const id = crypto.randomUUID();

  const hashInput = `${sequence}:${params.type}:${JSON.stringify(params.payload)}:${prevHash}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

  return { ...params, id, sequence, hash, prevHash };
}
