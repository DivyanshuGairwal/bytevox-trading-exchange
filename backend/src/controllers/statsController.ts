import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getStats(_req: Request, res: Response) {
  const [totalBuyOrders, totalSellOrders, totalTradesExecuted] =
    await Promise.all([
      prisma.order.count({
        where: { side: "BUY" },
      }),
      prisma.order.count({
        where: { side: "SELL" },
      }),
      prisma.trade.count(),
    ]);

  res.json({
    totalBuyOrders,
    totalSellOrders,
    totalTradesExecuted,
  });
}