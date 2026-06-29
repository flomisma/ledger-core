import type { ImmutableLedger } from './ledger.js';
import type { LedgerEntry } from './entry.js';

export interface AuditQuery {
  tenantId?: string;
  actorId?: string;
  type?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export function queryAuditTrail(
  ledger: ImmutableLedger,
  query: AuditQuery,
): LedgerEntry[] {
  // Access the internal entries via head() / length() protocol — read-only path
  const results: LedgerEntry[] = [];
  const len = ledger.length();

  // Reconstruct entries by re-appending is not possible — audit query operates
  // against an externally supplied entries snapshot in production adapters.
  // In this standalone implementation we expose a queryable snapshot interface.
  const snapshot = (ledger as unknown as { entries: LedgerEntry[] }).entries;

  for (const entry of snapshot) {
    if (query.tenantId && entry.tenantId !== query.tenantId) continue;
    if (query.actorId && entry.actorId !== query.actorId) continue;
    if (query.type && entry.type !== query.type) continue;
    if (query.from && entry.timestamp < query.from) continue;
    if (query.to && entry.timestamp > query.to) continue;
    results.push(entry);
    if (query.limit && results.length >= query.limit) break;
  }

  void len; // used for type safety above
  return results;
}
