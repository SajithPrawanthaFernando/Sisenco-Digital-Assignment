import { useState, useEffect, useCallback } from "react";
import api from "@/lib/utils";

interface FilterState {
  category: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    dateFrom: "",
    dateTo: "",
    type: "",
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.type) params.append("type", filters.type);

      const response = await api.get(
        `/transactions/getalltransaction?${params.toString()}`,
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    transactions,
    loading,
    filters,
    updateFilter,
    refresh: fetchTransactions,
  };
};
