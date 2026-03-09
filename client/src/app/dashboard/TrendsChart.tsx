"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity } from "lucide-react";

export default function TrendsChart({
  transactions = [],
}: {
  transactions: any[];
}) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const monthsMap: Record<
      string,
      { month: string; income: number; expenses: number }
    > = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthNum}`;

      const label = d.toLocaleString("default", { month: "short" });
      monthsMap[key] = { month: label, income: 0, expenses: 0 };
    }

    transactions.forEach((t: any) => {
      if (!t.date) return;

      const key = t.date.slice(0, 7);

      if (monthsMap[key]) {
        const amt = Number(t.amount) || 0;
        if (t.type === "income") {
          monthsMap[key].income += amt;
        } else if (t.type === "expense") {
          monthsMap[key].expenses += amt;
        }
      }
    });

    return Object.values(monthsMap);
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
        <Activity size={32} className="mb-3 text-zinc-600" />
        <p className="text-sm font-medium">No financial data available yet.</p>
        <p className="text-xs mt-1">
          Add your first transaction to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ fontSize: "12px", color: "#fff" }}
            formatter={(value: any) => `LKR ${Number(value).toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
