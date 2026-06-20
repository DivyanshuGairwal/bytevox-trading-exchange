# System Architecture

## High-Level Architecture

┌──────────────────────────────┐
│ Frontend (Next.js)           │
│                              │
│ • Order Entry Panel          │
│ • Order Book View            │
│ • Trade History              │
│ • Statistics Dashboard       │
└──────────────┬───────────────┘
               │
               │ REST API
               │
               ▼
┌──────────────────────────────┐
│ Backend (Express.js)         │
│                              │
│ • Order API                  │
│ • Matching Engine            │
│ • Trade Management           │
│ • Statistics Service         │
└──────────────┬───────────────┘
               │
               │ Prisma ORM
               │
               ▼
┌──────────────────────────────┐
│ SQLite Database              │
│                              │
│ • Orders                     │
│ • Trades                     │
└──────────────────────────────┘


Real-Time Communication

┌──────────────────────────────┐
│ Frontend (Next.js)           │
└──────────────┬───────────────┘
               ▲
               │ WebSocket
               ▼
┌──────────────────────────────┐
│ Backend WebSocket Server     │
└──────────────────────────────┘

---

## Order Processing Flow

1. User submits BUY or SELL order.

2. Backend validates request.

3. Order is stored in database.

4. Matching engine searches for compatible orders.

5. Trades are executed when:

   BUY Price ≥ SELL Price

6. Order statuses and remaining quantities are updated.

7. Trade records are stored.

8. Statistics are recalculated.

9. WebSocket event is broadcast.

10. Connected clients refresh market data automatically.

---

## Main Components

### Frontend

Responsible for:

- Order creation
- Order book visualization
- Trade history display
- Statistics dashboard
- WebSocket updates

### Backend

Responsible for:

- API endpoints
- Order validation
- Matching engine execution
- Trade creation
- Statistics generation
- WebSocket broadcasting

### Database

Responsible for:

- Order persistence
- Trade persistence
- Historical data storage

### WebSocket Layer

Responsible for:

- Real-time notifications
- Client synchronization
- Automatic UI updates

---

## Technology Stack

Frontend:
- Next.js
- React
- TypeScript

Backend:
- Express.js
- TypeScript

Database:
- SQLite
- Prisma ORM

Real-Time:
- WebSockets

Containerization:
- Docker
- Docker Compose