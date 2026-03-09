import { useState, useEffect } from "react";
import api from "@/lib/utils";
import { FinancialTrend, MonthlyBalance } from "@/types/dashboard";

export const useDashboardData = () => {
  const [balance, setBalance] = useState<MonthlyBalance | null>(null);
  const [trends, setTrends] = useState<FinancialTrend[]>([]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [balanceRes, trendsRes, transRes] = await Promise.all([
        api.get("/balance/monthlybalance"),
        api.get("/financial/financial-trends"),
        api.get("/transactions/getalltransaction"),
      ]);

      setBalance(balanceRes.data);
      setTrends(trendsRes.data);
      console.log("Transactions fetched:", transRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    balance,
    trends,
    transactions,
    loading,
    refresh: fetchDashboardData,
  };
};
