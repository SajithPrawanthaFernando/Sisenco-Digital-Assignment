export interface MonthlyBalance {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  month: string;
}

export interface FinancialTrend {
  month: string;
  income: number;
  expenses: number;
}
