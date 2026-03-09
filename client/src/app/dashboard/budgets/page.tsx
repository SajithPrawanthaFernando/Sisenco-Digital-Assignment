"use client";
import { useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Edit3, Trash2, PieChart, AlertTriangle } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings"; // 1. Import Settings Hook
import api from "@/lib/utils";
import AddBudgetModal from "../AddBudgetModal";
import { useToast } from "@/context/ToastContext";
import ConfirmDeleteModal from "@/app/common/ConfirmDeleteModal";

export default function BudgetsPage() {
  const container = useRef(null);
  const {
    budgets,
    loading: budgetsLoading,
    month,
    setMonth,
    refresh: refreshBudgets,
  } = useBudgets();
  const {
    transactions,
    loading: txLoading,
    refresh: refreshTx,
  } = useTransactions();
  const { categories } = useSettings(); // 2. Get categories for lookup
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = budgetsLoading || txLoading;

  // 3. Create lookup map for Category IDs -> Names
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach((cat: any) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  useGSAP(
    () => {
      if (!isLoading) {
        gsap.from(".budget-card, .anim-header", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: container, dependencies: [isLoading] },
  );

  const handleEdit = (budget: any) => {
    // We pass the display name as well so the Modal can show it in the info banner
    setSelectedBudget({
      ...budget,
      categoryName: categoryMap[budget.category] || budget.category,
      categoryId: budget.category,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/budget/deletebudget/${budgetToDelete}`);
      refreshBudgets();
      showToast("Budget deleted successfully.", "success");
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete budget.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setBudgetToDelete(null);
    }
  };

  const budgetsWithProgress = useMemo(() => {
    if (!budgets || !transactions) return [];

    return budgets.map((budget: any) => {
      const spent = transactions
        .filter(
          (t: any) =>
            t.type === "expense" &&
            t.category === budget.category && // IDs should match here
            t.date.startsWith(budget.month),
        )
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const isExceeded = spent > budget.amount;

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        realPercentage: percentage,
        isExceeded,
      };
    });
  }, [budgets, transactions]);

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 anim-header">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-zinc-400 mt-1">
            Track your spending against your category limits.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl outline-none text-zinc-300 focus:border-blue-500 shadow-xl"
          />
          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> New Budget
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-10">
          Loading budgets and progress...
        </div>
      ) : budgetsWithProgress?.length === 0 ? (
        <div className="text-center bg-zinc-900 border border-zinc-800 rounded-2xl py-16 px-6 anim-header shadow-xl">
          <PieChart size={48} className="mx-auto text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No Budgets Found</h3>
          <p className="text-zinc-500 mt-2">
            You haven't set any budgets for {month}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithProgress?.map((budget: any) => (
            <div
              key={budget._id}
              className={`budget-card bg-zinc-900 border rounded-2xl p-6 shadow-xl relative group overflow-hidden transition-colors ${
                budget.isExceeded ? "border-red-500/50" : "border-zinc-800"
              }`}
            >
              {budget.isExceeded && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-wider shadow-lg">
                  <AlertTriangle size={12} /> Limit Exceeded
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-full uppercase tracking-wider border border-zinc-700">
                    {/* 4. Display mapped name instead of ID */}
                    {categoryMap[budget.category] || "Unknown Category"}
                  </span>
                  <div className="mt-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">
                      Limit
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      LKR {Number(budget.amount).toLocaleString()}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(budget._id)}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    Spent:{" "}
                    <span className="text-white font-medium">
                      LKR {budget.spent.toLocaleString()}
                    </span>
                  </span>
                  <span
                    className={`font-bold ${budget.isExceeded ? "text-red-400" : "text-blue-400"}`}
                  >
                    {budget.realPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      budget.isExceeded
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  />
                </div>

                <div className="text-right text-xs mt-2">
                  {!budget.isExceeded ? (
                    <span className="text-zinc-500">
                      LKR {(budget.amount - budget.spent).toLocaleString()}{" "}
                      remaining
                    </span>
                  ) : (
                    <span className="text-red-500/80 font-medium">
                      LKR {(budget.spent - budget.amount).toLocaleString()} over
                      budget
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={() => {
          refreshBudgets();
          refreshTx();
        }}
        editData={selectedBudget}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this budget limit? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
