import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getTrades(_req: Request, res: Response) {
  const trades = await prisma.trade.findMany({
    orderBy: { timestamp: "desc" },
    select: {
      id: true,
      price: true,
      quantity: true,
      timestamp: true,
    },
  });

  return res.json(trades);
}
