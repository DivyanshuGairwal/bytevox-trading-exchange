import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import ordersRouter from "./routes/orders";
import orderbookRouter from "./routes/orderbook";
import tradesRouter from "./routes/trades";
import statsRouter from "./routes/stats";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/orders", ordersRouter);
app.use("/orderbook", orderbookRouter);
app.use("/trades", tradesRouter);
app.use("/stats", statsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/test-db", async (_req, res) => {
  const orderCount = await prisma.order.count();

  res.json({
    message: "Database connected",
    orderCount,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
