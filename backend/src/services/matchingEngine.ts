import { Order, Trade, Side, Status } from "@prisma/client";
import { prisma } from "../lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchResult {
  order: Order;
  trades: Trade[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveStatus(remainingQuantity: number): Status {
  return remainingQuantity === 0 ? Status.FILLED : Status.PARTIAL;
}

// ─── Core Engine ──────────────────────────────────────────────────────────────

/**
 * Match an incoming order against resting OPEN orders on the opposite side.
 *
 *   BUY  incoming → match against OPEN SELL orders, lowest price first,
 *                    while buy price >= sell price
 *   SELL incoming → match against OPEN BUY  orders, highest price first,
 *                    while sell price <= buy price
 *
 * Runs inside a single transaction so concurrent submissions cannot
 * double-match the same resting order.
 */
export async function matchOrder(orderId: number): Promise<MatchResult> {
  return prisma.$transaction(async (tx) => {
    const incoming = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    if (incoming.status === Status.FILLED) {
      return { order: incoming, trades: [] };
    }

    const isBuy = incoming.side === Side.BUY;

    // ── Fetch eligible resting orders ────────────────────────────────────────

    const restingOrders = await tx.order.findMany({
        where: {
          side: isBuy ? Side.SELL : Side.BUY,
          status: {
            in: [Status.OPEN, Status.PARTIAL],
          },
          price: isBuy
            ? { lte: incoming.price }
            : { gte: incoming.price },
        },
        orderBy: [
          { price: isBuy ? "asc" : "desc" },
          { id: "asc" },
        ],
      });

    // ── Walk the book and fill ───────────────────────────────────────────────

    let remaining = incoming.remainingQuantity;
    const trades: Trade[] = [];

    for (const resting of restingOrders) {
      if (remaining <= 0) break;

      const fillQty = Math.min(remaining, resting.remainingQuantity);
      const fillPrice = resting.price; // resting order's price is used for execution

      const trade = await tx.trade.create({
        data: {
          buyOrderId: isBuy ? incoming.id : resting.id,
          sellOrderId: isBuy ? resting.id : incoming.id,
          price: fillPrice,
          quantity: fillQty,
        },
      });
      trades.push(trade);

      const restingRemaining = resting.remainingQuantity - fillQty;
      await tx.order.update({
        where: { id: resting.id },
        data: {
          remainingQuantity: restingRemaining,
          status: resolveStatus(restingRemaining),
        },
      });

      remaining -= fillQty;
    }

    // ── Update the incoming order ────────────────────────────────────────────

    const updatedOrder = await tx.order.update({
      where: { id: incoming.id },
      data: {
        remainingQuantity: remaining,
        status:
          remaining === incoming.quantity
            ? Status.OPEN // no fills occurred
            : resolveStatus(remaining),
      },
    });

    return { order: updatedOrder, trades };
  });
}