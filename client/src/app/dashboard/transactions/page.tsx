"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Plus,
  Filter,
  XCircle,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionTable from "../TransactionTable";
import AddTransactionModal from "../AddTransactionModal";
import { useSettings } from "@/hooks/useSettings";

export default function TransactionsPage() {
  const container = useRef(null);

  const { transactions, loading, filters, updateFilter, refresh } =
    useTransactions();

  const { categories } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useGSAP(
    () => {
      gsap.from(".anim-element", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: container, dependencies: [] },
  );

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const clearFilters = () => {
    updateFilter("category", "");
    updateFilter("type", "");
    updateFilter("dateFrom", "");
    updateFilter("dateTo", "");
  };

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 anim-element">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            All Transactions
          </h2>
          <p className="text-zinc-400 mt-1">
            Search, filter, and manage your financial history.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col xl:flex-row gap-4 anim-element shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 flex flex-col justify-end">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 tracking-wider hidden sm:block">
              Type
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ArrowRightLeft
                  size={16}
                  className="text-zinc-500 group-focus-within:text-blue-500 transition-colors"
                />
              </div>
              <select
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-blue-500/50 outline-none text-white text-sm px-11 py-2.5 rounded-xl appearance-none cursor-pointer transition-colors shadow-inner"
              >
                <option value="" className="bg-zinc-900 text-white">
                  All Types
                </option>
                <option value="income" className="bg-zinc-900 text-white">
                  Income
                </option>
                <option value="expense" className="bg-zinc-900 text-white">
                  Expense
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-1 flex flex-col justify-end">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 tracking-wider hidden sm:block">
              Category
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter
                  size={16}
                  className="text-zinc-500 group-focus-within:text-blue-500 transition-colors"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 focus:border-blue-500/50 outline-none text-white text-sm px-11 py-2.5 rounded-xl appearance-none cursor-pointer transition-colors shadow-inner"
              >
                <option value="" className="bg-zinc-900 text-white">
                  All Categories
                </option>
                {categories?.map((cat: any) => (
                  <option
                    key={cat._id}
                    value={cat.name}
                    className="bg-zinc-900 text-white"
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Dates Group */}
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 tracking-wider">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 px-4 py-2.5 rounded-xl outline-none text-sm text-zinc-300 focus:border-blue-500/50 transition-colors w-full shadow-inner"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1 mb-1 tracking-wider">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 px-4 py-2.5 rounded-xl outline-none text-sm text-zinc-300 focus:border-blue-500/50 transition-colors w-full shadow-inner"
            />
          </div>

          <div className="h-[42px] flex items-center">
            {(filters.category && filters.category !== "") ||
            (filters.type && filters.type !== "") ||
            filters.dateFrom ||
            filters.dateTo ? (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 h-full w-full sm:w-auto text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
                title="Clear all filters"
              >
                <XCircle size={16} />
                Clear
              </button>
            ) : (
              <div className="w-[90px] hidden sm:block"></div>
            )}
          </div>
        </div>
      </div>

      <div className="anim-element">
        <TransactionTable
          transactions={transactions}
          loading={loading}
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
