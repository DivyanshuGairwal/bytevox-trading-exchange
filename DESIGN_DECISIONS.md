# Design Decisions

## 1. Database Choice

### Selected Database
SQLite

### Reasoning

SQLite was chosen because:

- Lightweight and easy to set up
- Requires no external infrastructure
- Suitable for a single-node exchange simulation
- Fast enough for the expected assignment workload
- Simplifies local development and evaluation

### ORM

Prisma ORM was used to provide:

- Type-safe database access
- Schema management through migrations
- Improved developer productivity
- Cleaner data access patterns

---

## 2. Matching Engine Design

The exchange uses a Price-Time Priority matching strategy.

### Buy Order Matching

When a BUY order is submitted:

1. Find SELL orders where:

   SELL Price ≤ BUY Price

2. Sort matching SELL orders by:

   - Lowest price first
   - Earliest order first

3. Execute trades until:

   - The BUY order is fully filled
   - No compatible SELL orders remain

### Sell Order Matching

When a SELL order is submitted:

1. Find BUY orders where:

   BUY Price ≥ SELL Price

2. Sort matching BUY orders by:

   - Highest price first
   - Earliest order first

3. Execute trades until:

   - The SELL order is fully filled
   - No compatible BUY orders remain

### Trade Execution Price

Trades execute using the resting order price.

This follows common exchange behavior where existing liquidity determines execution price.

---

## 3. Partial Fill Handling

The matching engine supports partial order execution.

### Example

BUY Order

10 @ 100

SELL Order

3 @ 95

Result

Trade Executed:

3 @ 95

Remaining BUY Order:

7 @ 100

### Order States

Each order maintains:

- Original quantity
- Remaining quantity
- Current status

Supported statuses:

- OPEN
- PARTIAL
- FILLED

This allows accurate tracking of order lifecycle.

---

## 4. Data Storage Strategy

### Orders

Orders are stored in the database with:

- ID
- Side (BUY / SELL)
- Price
- Quantity
- Remaining Quantity
- Status
- Timestamp

### Trades

Completed trades are stored separately with:

- Trade ID
- Buy Order ID
- Sell Order ID
- Execution Price
- Quantity
- Timestamp

Separating orders and trades simplifies querying and reporting.

---

## 5. API Design

The backend exposes a minimal REST API.

### POST /orders

Creates a new order and triggers matching.

### GET /orderbook

Returns active BUY and SELL orders.

### GET /trades

Returns completed trade history.

### GET /stats

Returns exchange statistics.

The API was intentionally kept simple to focus on exchange functionality rather than application complexity.

---

## 6. Real-Time Updates

Real-time synchronization was implemented using WebSockets.

### Flow

1. User submits an order
2. Matching engine processes the order
3. Order book and trade history are updated
4. Backend broadcasts a WebSocket event
5. Connected clients automatically refresh data

### Benefits

- No manual page refresh required
- Near real-time market visibility
- Better user experience
- Simulates modern exchange behavior

---

## 7. Containerization

Docker and Docker Compose were implemented to provide:

- Consistent execution environment
- Simplified setup process
- Cross-platform compatibility
- Reproducible development workflow

The entire application can be started using a single Docker Compose command.

---

## 8. Scaling Considerations

For larger workloads (100,000+ active orders and 10,000+ trades per minute), the following improvements would be recommended:

### Database

- Replace SQLite with PostgreSQL
- Add indexing on frequently queried fields
- Implement database replication

### Matching Engine

- Maintain order books in memory
- Use optimized data structures such as heaps or balanced trees
- Separate matching engine into an independent service

### Infrastructure

- Introduce Redis caching
- Use message queues such as Kafka or RabbitMQ
- Deploy multiple API instances behind a load balancer

### Real-Time Distribution

- Use dedicated WebSocket infrastructure
- Publish updates through Redis Pub/Sub
- Support horizontal scaling across servers

These changes would significantly improve throughput and scalability while maintaining low latency.