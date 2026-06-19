# Design Decisions

## Database Choice

SQLite was chosen because:

- Lightweight
- Easy local setup
- No external database required
- Suitable for assignment scope

Prisma ORM was used for type-safe database access.

---

## Matching Logic

When a BUY order is submitted:

- Find SELL orders with price <= BUY price
- Sort by lowest price first
- Execute trades until quantity is filled

When a SELL order is submitted:

- Find BUY orders with price >= SELL price
- Sort by highest price first
- Execute trades until quantity is filled

Execution uses the resting order price.

---

## Partial Fill Handling

Example:

BUY:
10 @ 100

SELL:
3 @ 95

Trade:
3 @ 95

Remaining BUY:
7 @ 100

Orders are updated using remainingQuantity.

Status values:

- OPEN
- PARTIAL
- FILLED

---

## Data Storage

### Orders

Stored in SQLite using Prisma.

Fields:

- id
- side
- price
- quantity
- remainingQuantity
- status
- createdAt

### Trades

Stored separately.

Fields:

- id
- buyOrderId
- sellOrderId
- price
- quantity
- timestamp

---

## API Design

POST /orders

Creates an order and triggers matching.

GET /orderbook

Returns active BUY and SELL orders.

GET /trades

Returns completed trades.

GET /stats

Returns exchange statistics.

---

## Scaling Considerations

For 100,000+ active orders:

- Use PostgreSQL
- Add indexes on price and status
- Use Redis for caching
- Store order books in memory
- Introduce WebSockets for real-time updates
- Separate matching engine into dedicated service