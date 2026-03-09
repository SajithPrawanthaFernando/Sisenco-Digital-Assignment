"use client";
import { useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useBudgets } from "@/hooks/useBudgets";
import { useSettings } from "@/hooks/useSettings";
import TrendsChart from "./TrendsChart";
import TransactionTable from "./TransactionTable";
import AddTransactionModal from "./AddTransactionModal";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
];

export default function DashboardOverview() {
  const container = useRef(null);

  const {
    balance,
    trends,
    transactions,
    loading: dashLoading,
    refresh,
  } = useDashboardData();
  const { budgets, loading: budgetLoading } = useBudgets();
  const { categories } = useSettings();

  const loading = dashLoading || budgetLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach((cat: any) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  const expenseDistribution = useMemo(() => {
    if (!transactions) return [];
    const expenses = transactions.filter((t: any) => t.type === "expense");
    const categoryTotals = expenses.reduce((acc: any, t: any) => {
      const categoryName =
        categoryMap[t.category] || t.category || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {});

    return Object.keys(categoryTotals)
      .map((key) => ({
        name: key,
        value: categoryTotals[key],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categoryMap]);

  const budgetVsActual = useMemo(() => {
    if (!budgets || !transactions) return [];

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = transactions.filter(
      (t: any) => t.type === "expense" && t.date.startsWith(currentMonth),
    );

    const spentByCategory = monthlyExpenses.reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    return budgets.map((b: any) => ({
      // Map category ID to Name for chart labels
      category: categoryMap[b.category] || b.category,
      Budget: b.amount,
      Spent: spentByCategory[b.category] || 0,
    }));
  }, [budgets, transactions, categoryMap]);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".anim-item", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    },
    { scope: container, dependencies: [loading] },
  );

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-zinc-500 animate-pulse font-medium text-lg">
          Loading your financials...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="space-y-8 pb-10 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 anim-item">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-zinc-400 mt-1">
            Your financial health at a glance.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20 shrink-0"
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="anim-item p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={100} />
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            Current Balance
          </p>
          <h3 className="text-3xl font-bold text-white">
            <span className="text-lg text-zinc-500 mr-1">LKR</span>
            {balance?.remainingBalance?.toLocaleString() || "0"}
          </h3>
        </div>

        <div className="anim-item p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
            <TrendingUp size={100} />
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            Monthly Income
          </p>
          <h3 className="text-3xl font-bold text-emerald-400">
            + {balance?.totalIncome?.toLocaleString() || "0"}
          </h3>
        </div>

        <div className="anim-item p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-red-500">
            <TrendingDown size={100} />
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            Monthly Expenses
          </p>
          <h3 className="text-3xl font-bold text-red-400">
            - {balance?.totalExpenses?.toLocaleString() || "0"}
          </h3>
        </div>

        <div className="anim-item p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
            <Target size={100} />
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            Active Budgets
          </p>
          <h3 className="text-3xl font-bold text-blue-400">
            {budgets?.length || 0}
          </h3>
          <p className="text-xs text-zinc-500 mt-2">Tracked this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="anim-item lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">
            Income vs. Expenses (Last 6 Months)
          </h3>
          <div className="h-[300px] w-full">
            <TrendsChart transactions={transactions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="anim-item bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">
            Expense Distribution
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            Where your money went this month.
          </p>
          <div className="flex-1 w-full min-h-[250px] relative">
            {expenseDistribution.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-600 italic">
                No expenses recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) =>
                      `LKR ${Number(value).toLocaleString()}`
                    }
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="anim-item bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">
          Budget vs. Actual Spending
        </h3>
        <p className="text-xs text-zinc-500 mb-8">
          Compare your limits against actual monthly expenses.
        </p>
        <div className="w-full h-[300px] relative">
          {budgetVsActual.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-600 italic">
              No budgets configured for this month.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetVsActual}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
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
                  tickFormatter={(value) => `LKR ${value}`}
                />
                <Tooltip
                  cursor={{ fill: "#27272a", opacity: 0.4 }}
                  formatter={(value: any) =>
                    `LKR ${Number(value).toLocaleString()}`
                  }
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="Budget"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="Spent"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="anim-item">
        <h3 className="text-xl font-bold text-white mb-4 pl-1">
          Recent Transactions
        </h3>
        <TransactionTable
          transactions={transactions?.slice(0, 5)}
          loading={dashLoading}
          refresh={refresh}
          onEdit={handleEdit}
        />
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={refresh}
        editData={selectedTransaction}
      />
    </div>
  );
}
