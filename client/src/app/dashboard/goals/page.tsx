"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Plus,
  Edit3,
  Trash2,
  Target,
  Calendar,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

import api from "@/lib/utils";
import { format } from "date-fns";
import AddGoalModal from "../AddGoalModal";
import { useToast } from "@/context/ToastContext";
import ConfirmDeleteModal from "@/app/common/ConfirmDeleteModal";

export default function GoalsPage() {
  const container = useRef(null);
  const { goals, loading, refresh } = useGoals();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // Modal State Management
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".goal-card, .anim-header", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: container, dependencies: [loading] },
  );

  const handleEdit = (goal: any) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/goals/deletegoals/${goalToDelete}`);
      refresh();
      showToast("Goal deleted successfully.", "success");
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete goal.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
    }
  };

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 anim-header">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Financial Goals
          </h2>
          <p className="text-zinc-400 mt-1">
            Track your savings targets and deadlines.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Add New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="text-center text-zinc-500 py-10">Loading goals...</div>
      ) : goals?.length === 0 ? (
        <div className="text-center bg-zinc-900 border border-zinc-800 rounded-2xl py-16 px-6 anim-header shadow-xl">
          <Target size={48} className="mx-auto text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No Goals Set</h3>
          <p className="text-zinc-500 mt-2">
            Start planning for your future by adding a goal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals?.map((goal: any) => {
            // Calculate Progress
            const target = Number(goal.targetAmount) || 0;
            const current = Number(goal.currentAmount) || 0;
            const percentage =
              target > 0 ? Math.min((current / target) * 100, 100) : 0;
            const isCompleted = goal.isCompleted || percentage >= 100;

            return (
              <div
                key={goal._id}
                className={`goal-card bg-zinc-900 border rounded-2xl p-6 shadow-xl relative group flex flex-col justify-between min-h-[220px] transition-colors ${
                  isCompleted ? "border-emerald-500/50" : "border-zinc-800"
                }`}
              >
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-wider shadow-lg">
                    <CheckCircle2 size={12} /> Goal Reached
                  </div>
                )}

                {/* Card Header & Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}
                    >
                      <Target size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-blue-400 transition-colors border border-transparent hover:border-blue-500/20"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(goal._id)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Goal Details & Progress */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">
                        Saved:{" "}
                        <span className="text-white font-medium">
                          LKR {current.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={`font-bold ${isCompleted ? "text-emerald-400" : "text-blue-400"}`}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          isCompleted
                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-zinc-500 uppercase font-bold tracking-wider">
                        Target: LKR {target.toLocaleString()}
                      </span>
                      {!isCompleted && (
                        <span className="text-zinc-500">
                          LKR {(target - current).toLocaleString()} to go
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar size={16} className="text-zinc-500" />
                      <span
                        className="text-sm truncate"
                        title={
                          goal.deadline
                            ? format(new Date(goal.deadline), "MMM dd, yyyy")
                            : "No Date"
                        }
                      >
                        {goal.deadline
                          ? format(new Date(goal.deadline), "MMM dd, yyyy")
                          : "No Date"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Percent size={16} className="text-zinc-500" />
                      <span className="text-sm truncate">
                        {goal.savingsPercentage}% Income
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add Modal */}
      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGoal(null);
        }}
        onSuccess={refresh}
        editData={selectedGoal}
      />

      {/* Custom Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Financial Goal"
        message="Are you sure you want to abandon this goal? This will permanently remove it from your tracker."
        isDeleting={isDeleting}
      />
    </div>
  );
}
