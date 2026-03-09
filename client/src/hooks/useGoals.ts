import { useState, useEffect, useCallback } from "react";
import api from "@/lib/utils";

export interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  deadline: string;
  savingsPercentage: number;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/goals/getgoals");
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { goals, loading, refresh: fetchGoals };
};
