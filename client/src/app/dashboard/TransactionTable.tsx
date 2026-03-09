"use client";
import { useState, useMemo } from "react"; // Added useMemo
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react";
import api from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import { useSettings } from "@/hooks/useSettings"; // 1. Import settings

interface Props {
  transactions: any[];
  loading?: boolean;
  refresh: () => void;
  onEdit: (tx: any) => void;
}

export default function TransactionTable({
  transactions,
  loading,
  refresh,
  onEdit,
}: Props) {
  const { showToast } = useToast();
  const { categories } = useSettings(); // 2. Get categories for lookup

  // 3. Create a lookup map (ID -> Name) for performance
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach((cat: any) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(
        `/transactions/deletetransaction/${transactionToDelete}`,
      );
      refresh();
      showToast("Transaction deleted successfully.", "success");
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete transaction.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 shadow-xl">
        Loading transactions...
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden anim-item shadow-xl">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transactions?.map((tx: any) => (
                <tr
                  key={tx._id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {tx.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 uppercase tracking-wider">
                      {/* 4. Display mapped name, or fallback if ID doesn't exist */}
                      {categoryMap[tx.category] ||
                        tx.category ||
                        "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {tx.date
                      ? format(new Date(tx.date), "MMM dd, yyyy")
                      : "Unknown Date"}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-bold tracking-tight ${
                      tx.type === "income" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}{" "}
                    {Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-zinc-500 hover:text-blue-400 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                        title="Edit Transaction"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tx._id)}
                        className="text-zinc-500 hover:text-red-400 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500 italic text-sm"
                  >
                    No transactions found. Adjust filters or add one to get
                    started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? It will be removed from your balance and history."
        isDeleting={isDeleting}
      />
    </>
  );
}
