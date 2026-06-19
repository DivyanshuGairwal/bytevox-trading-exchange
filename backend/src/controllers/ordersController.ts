import { Request, Response } from "express";
import { Side } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { matchOrder } from "../services/matchingEngine";

export async function createOrder(req: Request, res: Response) {
  const { side, price, quantity } = req.body;

  if (side !== Side.BUY && side !== Side.SELL) {
    return res.status(400).json({ error: "side must be BUY or SELL" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "price must be greater than 0" });
  }

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({ error: "quantity must be greater than 0" });
  }

  const order = await prisma.order.create({
    data: {
      side,
      price,
      quantity,
      remainingQuantity: quantity,
      status: "OPEN",
    },
  });
  
  const result = await matchOrder(order.id);
  
  return res.status(201).json(result);
}
