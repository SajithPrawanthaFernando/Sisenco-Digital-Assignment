"use client";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import gsap from "gsap";
import { X, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import api from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { useToast } from "@/context/ToastContext";
import { useSettings } from "@/hooks/useSettings";

const transactionSchema = yup.object().shape({
  title: yup.string().required("Title is required."),
  amount: yup
    .number()
    .typeError("Amount must be a valid number.")
    .positive("Amount must be greater than 0.")
    .required("Amount is required."),
  type: yup.string().oneOf(["income", "expense"]).required("Type is required."),
  category: yup.string().required("Category is required."),
  description: yup.string().optional(),
  isRecurring: yup.boolean().optional(),
  currency: yup.string().optional(),
  date: yup.string().optional(),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const { showToast } = useToast();
  const { categories } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      title: "",
      amount: "" as unknown as number,
      type: "expense",
      category: "",
      description: "",
      isRecurring: false,
      currency: "LKR",
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (editData) {
      setValue("title", editData.title);
      setValue("amount", editData.amount);
      setValue("type", editData.type);
      // Ensure we use categoryId if available, otherwise fallback to name/id
      setValue("category", editData.categoryId || editData.category);
      setValue("description", editData.description || "");
      setValue("isRecurring", editData.isRecurring || false);
    } else {
      reset({
        title: "",
        amount: "" as unknown as number,
        type: "expense",
        category: "",
        description: "",
        isRecurring: false,
        currency: "LKR",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, setValue, reset, isOpen]);

  useGSAP(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      );
    }
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    try {
      if (editData) {
        const editPayload = {
          amount: Number(data.amount),
          description: data.description,
        };

        await api.put(
          `/transactions/updatetransaction/${editData._id}`,
          editPayload,
        );
        showToast("Transaction updated successfully!", "success");
      } else {
        const payload = {
          ...data,
          amount: Number(data.amount),
          // data.category now contains the category _id from the select value
        };
        await api.post("/transactions/createtransaction", payload);
        showToast("Transaction added successfully!", "success");
      }

      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save transaction", error);
      showToast("Failed to save transaction. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 px-4"
    >
      <div
        ref={modalRef}
        className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Transaction" : "Add Transaction"}
        </h2>

        {editData && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-sm text-blue-400">
            <AlertCircle size={18} className="shrink-0" />
            <p>
              You can only update the <strong>amount</strong> and{" "}
              <strong>description</strong> of an existing transaction.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Title
              </label>
              <input
                {...register("title")}
                disabled={!!editData}
                className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                  errors.title
                    ? "border-red-500/50 bg-red-500/5"
                    : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Dinner"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">
                  {String(errors.title.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Amount (LKR)
              </label>
              <input
                {...register("amount")}
                type="number"
                step="any"
                className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                  errors.amount
                    ? "border-red-500/50 bg-red-500/5"
                    : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
                }`}
                placeholder="2500"
              />
              {errors.amount && (
                <p className="text-red-400 text-xs mt-1">
                  {String(errors.amount.message)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Type
              </label>
              <div className="relative">
                <select
                  {...register("type")}
                  disabled={!!editData}
                  className="w-full p-3 bg-black/40 rounded-xl border border-white/5 focus:border-blue-500/50 outline-none transition-colors text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-10"
                >
                  <option value="expense" className="bg-zinc-900 text-white">
                    Expense
                  </option>
                  <option value="income" className="bg-zinc-900 text-white">
                    Income
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 ${!!editData ? "opacity-50" : ""}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  {...register("category")}
                  disabled={!!editData}
                  className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm appearance-none pr-10 ${
                    errors.category
                      ? "border-red-500/50 bg-red-500/5"
                      : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option
                    value=""
                    className="bg-zinc-900 text-zinc-400"
                    disabled
                  >
                    Select category
                  </option>

                  {/* USE cat._id AS THE VALUE INSTEAD OF cat.name */}
                  {categories?.map((cat: any) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="bg-zinc-900 text-white"
                    >
                      {cat.name}
                    </option>
                  ))}

                  {(!categories || categories.length === 0) && (
                    <option
                      value=""
                      disabled
                      className="bg-zinc-900 text-zinc-500"
                    >
                      No categories found.
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 ${!!editData ? "opacity-50" : ""}`}
                  />
                </div>
              </div>
              {errors.category && (
                <p className="text-red-400 text-xs mt-1">
                  {String(errors.category.message)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full p-3 bg-black/40 rounded-xl border border-white/5 focus:border-blue-500/50 focus:bg-black/60 outline-none transition-colors text-white text-sm resize-none"
              rows={2}
              placeholder="Optional details..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isRecurring")}
              id="recurring"
              disabled={!!editData}
              className="w-4 h-4 rounded border-zinc-700 bg-black/40 accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="recurring"
              className={`text-sm ${!!editData ? "text-zinc-600" : "text-zinc-400"}`}
            >
              Mark as Recurring
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-6 border border-blue-400/20 disabled:opacity-70 shadow-lg shadow-blue-900/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving...
              </>
            ) : editData ? (
              "Update Transaction"
            ) : (
              "Save Transaction"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
