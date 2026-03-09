export interface TransactionInput {
  title: string;
  amount: number;
  currency: string;
  type: "income" | "expense";
  date: string;
  category: string;
  description: string;
  tags: string[];
  isRecurring: boolean;
}
