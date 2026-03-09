"use client";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const goalSchema = yup.object().shape({
  title: yup.string().required("Goal title is required."),
  targetAmount: yup
    .number()
    .typeError("Target amount must be a valid number.")
    .positive("Target amount must be greater than 0.")
    .required("Target amount is required."),
  deadline: yup.string().required("Target deadline is required."),
  savingsPercentage: yup
    .number()
    .typeError("Savings percentage must be a valid number.")
    .min(1, "Percentage must be at least 1%.")
    .max(100, "Percentage cannot exceed 100%.")
    .required("Savings percentage is required."),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

export default function AddGoalModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(goalSchema),
    defaultValues: {
      title: "",
      targetAmount: "" as unknown as number,
      deadline: "",
      savingsPercentage: 20,
    },
  });

  useEffect(() => {
    if (editData) {
      setValue("title", editData.title);
      setValue("targetAmount", editData.targetAmount);
      setValue(
        "deadline",
        editData.deadline ? editData.deadline.split("T")[0] : "",
      );
      setValue("savingsPercentage", editData.savingsPercentage);
    } else {
      reset({
        title: "",
        targetAmount: "" as unknown as number,
        deadline: "",
        savingsPercentage: 20,
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
      const payload = {
        title: data.title,
        targetAmount: Number(data.targetAmount),
        deadline: data.deadline,
        savingsPercentage: Number(data.savingsPercentage),
      };

      if (editData) {
        await api.put(`/goals/updategoals/${editData._id}`, payload);
        showToast("Financial goal updated successfully!", "success");
      } else {
        await api.post("/goals/creategoal", payload);
        showToast("New financial goal created!", "success");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save goal", error);
      showToast("Failed to save the goal. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0"
    >
      <div
        ref={modalRef}
        className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Financial Goal" : "Create New Goal"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Goal Title
            </label>
            <input
              {...register("title")}
              className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                errors.title
                  ? "border-red-500/50 bg-red-500/5"
                  : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
              }`}
              placeholder="e.g., Emergency Fund"
            />
            {errors.title && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                <AlertCircle size={14} />
                {String(errors.title.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Target Amount (LKR)
            </label>
            <input
              type="number"
              step="any"
              {...register("targetAmount")}
              className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                errors.targetAmount
                  ? "border-red-500/50 bg-red-500/5"
                  : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
              }`}
              placeholder="100000"
            />
            {errors.targetAmount && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                <AlertCircle size={14} />
                {String(errors.targetAmount.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              {...register("deadline")}
              className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                errors.deadline
                  ? "border-red-500/50 bg-red-500/5"
                  : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
              }`}
            />
            {errors.deadline && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                <AlertCircle size={14} />
                {String(errors.deadline.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Monthly Savings Percentage (%)
            </label>
            <input
              type="number"
              {...register("savingsPercentage")}
              className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                errors.savingsPercentage
                  ? "border-red-500/50 bg-red-500/5"
                  : "bg-black/40 border-white/5 focus:border-blue-500/50 focus:bg-black/60 text-white"
              }`}
              placeholder="20"
            />
            {errors.savingsPercentage ? (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                <AlertCircle size={14} />
                {String(errors.savingsPercentage.message)}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 mt-1.5 font-medium">
                Percentage of income dedicated to this goal.
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
              "Update Goal"
            ) : (
              "Save Goal"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
