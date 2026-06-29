import crypto from 'node:crypto';
import { createEntry, type LedgerEntry } from './entry.js';

/**
 * Append-only. No entry may be modified or deleted after write.
 * Integrity verified via SHA-256 hash chain.
 */
export class ImmutableLedger {
  private entries: LedgerEntry[] = [];

  append(
    type: string,
    tenantId: string,
    actorId: string,
    payload: unknown,
  ): LedgerEntry {
    const entry = createEntry(
      { type, tenantId, actorId, payload, timestamp: new Date() },
      this.entries.at(-1) ?? null,
    );
    this.entries.push(entry);
    return entry;
  }

  verify(): boolean {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const prev = i === 0 ? null : this.entries[i - 1];
      const expectedPrevHash = prev ? prev.hash : 'GENESIS';
      if (entry.prevHash !== expectedPrevHash) return false;

      const hashInput = `${entry.sequence}:${entry.type}:${JSON.stringify(entry.payload)}:${entry.prevHash}`;
      const expectedHash = crypto.createHash('sha256').update(hashInput).digest('hex');
      if (entry.hash !== expectedHash) return false;
    }
    return true;
  }

  head(): LedgerEntry | null {
    return this.entries.at(-1) ?? null;
  }

  length(): number {
    return this.entries.length;
  }
}
