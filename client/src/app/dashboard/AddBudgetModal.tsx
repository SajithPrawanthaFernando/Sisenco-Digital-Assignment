"use client";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import api from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useSettings } from "@/hooks/useSettings";

const budgetSchema = yup.object().shape({
  category: yup.string().required("Category is required."),
  amount: yup
    .number()
    .typeError("Budget limit must be a valid number.")
    .positive("Limit must be greater than 0.")
    .required("Budget limit is required."),
  month: yup.string().required("Target month is required."),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

export default function AddBudgetModal({
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
    resolver: yupResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: "" as unknown as number,
      month: new Date().toISOString().slice(0, 7),
    },
  });

  useEffect(() => {
    if (editData) {
      // Store the category ID during edit population
      setValue("category", editData.categoryId || editData.category);
      setValue("amount", editData.amount);
      setValue("month", editData.month || new Date().toISOString().slice(0, 7));
    } else {
      reset({
        category: "",
        amount: "" as unknown as number,
        month: new Date().toISOString().slice(0, 7),
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
      const payload = { ...data, amount: Number(data.amount) };

      if (editData) {
        await api.put(`/budget/updatebudget/${editData._id}`, {
          amount: payload.amount,
        });
        showToast("Budget limit updated successfully!", "success");
      } else {
        // payload.category now contains the category ID
        await api.post("/budget/createbudget", payload);
        showToast("New budget created!", "success");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save budget", error);
      showToast("Failed to save the budget. Please try again.", "error");
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
        className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Update Budget Limit" : "Create New Budget"}
        </h2>

        {editData && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-sm text-blue-400">
            <AlertCircle size={18} className="shrink-0" />
            <p>
              Updating limit for:{" "}
              <strong>{editData.categoryName || "this category"}</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!editData && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    {...register("category")}
                    className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm appearance-none pr-10 ${
                      errors.category
                        ? "border-red-500/50 bg-red-500/5"
                        : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
                    }`}
                  >
                    <option
                      value=""
                      className="bg-zinc-900 text-zinc-400"
                      disabled
                    >
                      Select category to budget
                    </option>

                    {/* Use cat._id for value instead of cat.name */}
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
                        No categories found. Add them in Settings.
                      </option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-zinc-500" />
                  </div>
                </div>
                {errors.category && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                    <AlertCircle size={14} />
                    {String(errors.category.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Target Month
                </label>
                <input
                  type="month"
                  {...register("month")}
                  className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                    errors.month
                      ? "border-red-500/50 bg-red-500/5"
                      : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
                  }`}
                />
                {errors.month && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                    <AlertCircle size={14} />
                    {String(errors.month.message)}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Budget Limit (LKR)
            </label>
            <input
              type="number"
              step="any"
              {...register("amount")}
              className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                errors.amount
                  ? "border-red-500/50 bg-red-500/5"
                  : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
              }`}
              placeholder="5000"
            />
            {errors.amount && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                <AlertCircle size={14} />
                {String(errors.amount.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-6 border border-blue-400/20 disabled:opacity-70 shadow-lg shadow-blue-900/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : editData ? (
              "Update Budget"
            ) : (
              "Save Budget"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
