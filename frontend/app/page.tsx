"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Side = "BUY" | "SELL";
type Status = "OPEN" | "PARTIAL" | "FILLED";

interface OrderRow {
  id: number;
  side: Side;
  price: number;
  quantity: number;
  remainingQuantity: number;
  status: Status;
}

interface Trade {
  id: number;
  price: number;
  quantity: number;
  timestamp: string;
}

interface Stats {
  totalBuyOrders: number;
  totalSellOrders: number;
  totalTradesExecuted: number;
}

const API_BASE = "https://bytevox-trading-exchange.onrender.com";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBuyOrders: 0,
    totalSellOrders: 0,
    totalTradesExecuted: 0,
  });
  const [buyOrders, setBuyOrders] = useState<OrderRow[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderRow[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  const [side, setSide] = useState<Side>("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, bookRes, tradesRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/orderbook`),
        fetch(`${API_BASE}/trades`),
      ]);

      const statsData: Stats = await statsRes.json();
      const bookData: { buyOrders: OrderRow[]; sellOrders: OrderRow[] } =
        await bookRes.json();
      const tradesData: Trade[] = await tradesRes.json();

      setStats(statsData);
      setBuyOrders(bookData.buyOrders);
      setSellOrders(bookData.sellOrders);
      setTrades(tradesData);
    } catch {
      setError("Unable to reach the exchange backend.");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Order submission ────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const quantityNum = Number(quantity);

    if (!priceNum || priceNum <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (!quantityNum || quantityNum <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, price: priceNum, quantity: quantityNum }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Order submission failed.");
      }

      setPrice("");
      setQuantity("");
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#D8DEE4] font-mono">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex items-baseline justify-between border-b border-[#1C2127] pb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#F4F6F8]">
              ByteVox
              <span className="ml-2 text-[#5B6470]">/ exchange</span>
            </h1>
            <p className="mt-1 text-xs text-[#5B6470]">
              order matching · price-time priority
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5B6470]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3DD68C]" />
            live
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded border border-[#5A2A2A] bg-[#1F1414] px-4 py-2.5 text-sm text-[#FF8080]">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid grid-cols-3 gap-4">
          <StatCard label="Total Buy Orders" value={stats.totalBuyOrders} accent="#3DD68C" />
          <StatCard label="Total Sell Orders" value={stats.totalSellOrders} accent="#FF6B6B" />
          <StatCard label="Total Trades Executed" value={stats.totalTradesExecuted} accent="#6BA6FF" />
        </section>

        <div className="grid grid-cols-3 gap-6">
          {/* Order Entry */}
          <section className="col-span-1 rounded border border-[#1C2127] bg-[#10141A] p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#5B6470]">
              New Order
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#5B6470]">Side</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["BUY", "SELL"] as Side[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s)}
                      className={`rounded border px-3 py-2 text-sm font-semibold transition-colors ${
                        side === s
                          ? s === "BUY"
                            ? "border-[#3DD68C] bg-[#123322] text-[#3DD68C]"
                            : "border-[#FF6B6B] bg-[#33191c] text-[#FF6B6B]"
                          : "border-[#1C2127] text-[#5B6470] hover:border-[#2A313B]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#5B6470]">Price</label>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-[#1C2127] bg-[#0B0E11] px-3 py-2 text-sm text-[#F4F6F8] placeholder-[#3A4148] outline-none focus:border-[#3D4754]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-[#5B6470]">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full rounded border border-[#1C2127] bg-[#0B0E11] px-3 py-2 text-sm text-[#F4F6F8] placeholder-[#3A4148] outline-none focus:border-[#3D4754]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full rounded px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  side === "BUY"
                    ? "bg-[#3DD68C] text-[#0B0E11] hover:bg-[#34BF7C]"
                    : "bg-[#FF6B6B] text-[#0B0E11] hover:bg-[#E85F5F]"
                }`}
              >
                {submitting ? "Submitting…" : `Place ${side} Order`}
              </button>
            </form>
          </section>

          {/* Order Book */}
          <section className="col-span-2 grid grid-cols-2 gap-4">
            <OrderTable title="Buy Orders" orders={buyOrders} accent="#3DD68C" />
            <OrderTable title="Sell Orders" orders={sellOrders} accent="#FF6B6B" />
          </section>
        </div>

        {/* Trade History */}
        <section className="mt-6 rounded border border-[#1C2127] bg-[#10141A] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#5B6470]">
            Trade History
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1C2127] text-left text-xs text-[#5B6470]">
                <th className="py-2 font-normal">Price</th>
                <th className="py-2 font-normal">Quantity</th>
                <th className="py-2 font-normal">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[#3A4148]">
                    No trades executed yet.
                  </td>
                </tr>
              ) : (
                trades
                  .slice()
                  .reverse()
                  .map((t) => (
                    <tr key={t.id} className="border-b border-[#15191F] text-[#D8DEE4]">
                      <td className="py-2">{t.price.toFixed(2)}</td>
                      <td className="py-2">{t.quantity}</td>
                      <td className="py-2 text-[#5B6470]">
                        {new Date(t.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded border border-[#1C2127] bg-[#10141A] p-5">
      <p className="text-xs text-[#5B6470]">{label}</p>
      <p className="mt-2 text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function OrderTable({
  title,
  orders,
  accent,
}: {
  title: string;
  orders: OrderRow[];
  accent: string;
}) {
  return (
    <div className="rounded border border-[#1C2127] bg-[#10141A] p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
        {title}
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1C2127] text-left text-xs text-[#5B6470]">
            <th className="py-2 font-normal">Price</th>
            <th className="py-2 font-normal">Qty</th>
            <th className="py-2 font-normal">Remaining</th>
            <th className="py-2 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[#3A4148]">
                No open orders.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="border-b border-[#15191F] text-[#D8DEE4]">
                <td className="py-2">{o.price.toFixed(2)}</td>
                <td className="py-2">{o.quantity}</td>
                <td className="py-2">{o.remainingQuantity}</td>
                <td className="py-2 text-[#5B6470]">{o.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}