import { Request, Response } from "express";
import { Side, Status } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function getOrderbook(_req: Request, res: Response) {
  const activeStatuses = [Status.OPEN, Status.PARTIAL];

  const [buyOrders, sellOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        side: Side.BUY,
        status: { in: activeStatuses },
      },
      orderBy: { price: "desc" },
    }),
    prisma.order.findMany({
      where: {
        side: Side.SELL,
        status: { in: activeStatuses },
      },
      orderBy: { price: "asc" },
    }),
  ]);

  return res.json({ buyOrders, sellOrders });
}
