# @flomisma/ledger-core

Immutable append-only event ledger with SHA-256 hash chain integrity and
audit trail query interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What this is

A minimal, dependency-free immutable ledger primitive. Each entry is linked
to its predecessor via SHA-256 hash, forming a tamper-evident chain. The
`verify()` method re-computes the entire chain on demand.

## Install

```bash
npm install @flomisma/ledger-core
```

## Usage

```typescript
import { ImmutableLedger, queryAuditTrail } from '@flomisma/ledger-core'

const ledger = new ImmutableLedger()

ledger.append('payment.received', 'tenant-1', 'user-abc', { amount: 100 })
ledger.append('payment.released', 'tenant-1', 'system', { recipient: 'seller-xyz' })

console.log(ledger.verify()) // true — hash chain intact
console.log(ledger.length()) // 2

const trail = queryAuditTrail(ledger, { tenantId: 'tenant-1', type: 'payment.received' })
```

## API

### `ImmutableLedger`

```typescript
append(type, tenantId, actorId, payload): LedgerEntry
verify(): boolean
head(): LedgerEntry | null
length(): number
```

### `queryAuditTrail(ledger, query)`

```typescript
interface AuditQuery {
  tenantId?: string
  actorId?: string
  type?: string
  from?: Date
  to?: Date
  limit?: number
}
```

## Guarantees

- **Append-only.** No `update()` or `delete()` method exists.
- **Hash-chained.** Every entry includes the SHA-256 hash of its predecessor.
- **Self-verifying.** `verify()` recomputes and validates the entire chain.

## Part of Flomisma

This package is part of the [Flomisma](https://github.com/flomisma)
open infrastructure stack.

## License

MIT
