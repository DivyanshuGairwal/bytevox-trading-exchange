# ByteVox Trading Exchange

A simplified exchange built for the ByteVox Full Stack Engineering Internship Technical Assignment.

## Overview

This project simulates a trading exchange for a fictional asset called BYTE.

Users can:

- Place BUY orders
- Place SELL orders
- View the order book
- View trade history
- View exchange statistics

The system automatically matches compatible orders and supports partial fills.

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- Prisma ORM

### Database
- SQLite

---

## Features

### Order Submission
Create BUY and SELL orders.

### Order Book
Displays:
- Buy Orders (Highest Price First)
- Sell Orders (Lowest Price First)

### Matching Engine
Automatically executes trades when:

BUY PRICE >= SELL PRICE

Supports partial order fills.

### Trade History
Displays:
- Price
- Quantity
- Timestamp

### Statistics
Displays:
- Total Buy Orders
- Total Sell Orders
- Total Trades Executed

---

## API Endpoints

### Create Order

POST /orders

Example:

```json
{
  "side": "BUY",
  "price": 100,
  "quantity": 5
}
```

### Get Order Book

GET /orderbook

### Get Trades

GET /trades

### Get Statistics

GET /stats

---

## Project Structure

```

backend/
frontend/

```

---

## Running Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:3000
```

---

## Running Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3001
```

---

## Future Improvements

- WebSocket based real-time updates
- Order cancellation
- Market orders
- Docker support
- Depth chart visualization
