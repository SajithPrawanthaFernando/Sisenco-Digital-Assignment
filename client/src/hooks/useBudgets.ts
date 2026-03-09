import { useState, useEffect, useCallback } from "react";
import api from "@/lib/utils";

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/budget/getbudget?month=${month}`);
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return { budgets, loading, month, setMonth, refresh: fetchBudgets };
};
