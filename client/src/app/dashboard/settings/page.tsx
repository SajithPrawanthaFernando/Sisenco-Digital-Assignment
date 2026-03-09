"use client";
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  User,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Tag,
  AlertCircle,
  Loader2,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import api from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import ConfirmDeleteModal from "@/app/common/ConfirmDeleteModal";

// Define Yup Schemas
const profileSchema = yup.object().shape({
  name: yup.string().required("Full Name is required."),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  currency: yup.string().required("Base currency is required."),
  budgetLimit: yup
    .number()
    .typeError("Budget Limit must be a valid number.")
    .min(0, "Limit cannot be negative.")
    .required("Default Budget Limit is required."),
  password: yup
    .string()
    .notRequired()
    .test(
      "is-empty-or-min-6",
      "Password must be at least 6 characters long.",
      (value) => !value || value.length >= 6,
    ),
});

const categorySchema = yup.object().shape({
  name: yup.string().required("Category name is required."),
  defaultLimit: yup
    .number()
    .typeError("Limit must be a number.")
    .positive("Limit must be greater than 0.")
    .required("Limit is required."),
});

export default function SettingsPage() {
  const container = useRef(null);
  const { profile, categories, loading, refresh } = useSettings();
  const { showToast } = useToast();

  // Modal & Edit State Management
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isUpdatingProfile },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
    setValue: setCategoryValue,
    formState: { errors: categoryErrors, isSubmitting: isAddingCategory },
  } = useForm({
    resolver: yupResolver(categorySchema),
  });

  // Populate profile form when data loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name,
        email: profile.email,
        currency: profile.currency || "LKR",
        budgetLimit: profile.budgetLimit || 0,
        password: "",
      });
    }
  }, [profile, resetProfile]);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from(".settings-panel", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    },
    { scope: container, dependencies: [loading] },
  );

  // Handle Profile Update
  const onUpdateProfile = async (data: any) => {
    try {
      if (!data.password) delete data.password;

      await api.put("/auth/update", data);
      showToast("Profile updated successfully!", "success");
      refresh();
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast("Failed to update profile. Please try again.", "error");
    }
  };

  const handleEditClick = (cat: any) => {
    setEditingCategory(cat);
    setCategoryValue("name", cat.name);
    setCategoryValue("defaultLimit", cat.defaultLimit);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    resetCategory({ name: "", defaultLimit: "" as unknown as number });
  };

  const onSaveCategory = async (data: any) => {
    try {
      if (editingCategory) {
        // UPDATE API CALL
        await api.put(`/settings/categories/${editingCategory._id}`, {
          name: data.name,
          defaultLimit: Number(data.defaultLimit),
        });
        showToast("Category updated successfully!", "success");
      } else {
        // ADD API CALL
        await api.post("/settings/addcategories", {
          name: data.name,
          defaultLimit: Number(data.defaultLimit),
        });
        showToast("Category added successfully!", "success");
      }

      handleCancelEdit();
      refresh();
    } catch (error) {
      console.error("Failed to save category", error);
      showToast(
        editingCategory
          ? "Failed to update category."
          : "Failed to add category.",
        "error",
      );
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/settings/categories/${categoryToDelete}`);
      refresh();
      showToast("Category deleted.", "success");
      if (editingCategory && editingCategory._id === categoryToDelete) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Failed to delete category", error);
      showToast("Failed to delete category.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] justify-center items-center text-zinc-500 animate-pulse font-medium">
        Loading settings...
      </div>
    );
  }

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="settings-panel flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Settings
          </h2>
          <p className="text-zinc-400 mt-1">
            Manage your account and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ============================== */}
        {/* PROFILE SETTINGS PANEL         */}
        {/* ============================== */}
        <div className="settings-panel bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
            <User size={20} className="text-zinc-400" />
            <h3 className="text-xl font-bold text-white">Profile Details</h3>
          </div>

          <form
            onSubmit={handleProfileSubmit(onUpdateProfile)}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold tracking-wider">
                Full Name
              </label>
              <input
                {...registerProfile("name")}
                className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                  profileErrors.name
                    ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                    : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                }`}
              />
              {profileErrors.name && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                  <AlertCircle size={14} />
                  {String(profileErrors.name.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold tracking-wider">
                Email Address
              </label>
              <input
                {...registerProfile("email")}
                type="email"
                className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                  profileErrors.email
                    ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                    : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                }`}
              />
              {profileErrors.email && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                  <AlertCircle size={14} />
                  {String(profileErrors.email.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold tracking-wider">
                  Base Currency
                </label>
                <input
                  {...registerProfile("currency")}
                  placeholder="LKR"
                  className={`w-full p-3 rounded-xl border outline-none uppercase transition-colors text-sm ${
                    profileErrors.currency
                      ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                      : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                  }`}
                />
                {profileErrors.currency && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">
                    {String(profileErrors.currency.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold tracking-wider">
                  Budget Limit
                </label>
                <input
                  {...registerProfile("budgetLimit")}
                  type="number"
                  step="any"
                  placeholder="0"
                  className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                    profileErrors.budgetLimit
                      ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                      : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                  }`}
                />
                {profileErrors.budgetLimit && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">
                    {String(profileErrors.budgetLimit.message)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold tracking-wider">
                Update Password (Optional)
              </label>
              <input
                {...registerProfile("password")}
                type="password"
                placeholder="Leave blank to keep current"
                className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm placeholder:text-zinc-600 ${
                  profileErrors.password
                    ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                    : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                }`}
              />
              {profileErrors.password && (
                <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
                  <AlertCircle size={14} />
                  {String(profileErrors.password.message)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] mt-2 shadow-lg shadow-blue-600/20 disabled:opacity-70"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>

        <div className="settings-panel flex flex-col gap-8">
          {/* Add/Edit Category Form */}
          <div
            className={`bg-zinc-900 border rounded-2xl p-8 shadow-xl transition-colors ${editingCategory ? "border-blue-500/50" : "border-zinc-800"}`}
          >
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Tag
                  size={20}
                  className={
                    editingCategory ? "text-blue-400" : "text-zinc-400"
                  }
                />
                <h3 className="text-xl font-bold text-white">
                  {editingCategory ? "Update Category" : "Custom Categories"}
                </h3>
              </div>
              {editingCategory && (
                <button
                  onClick={handleCancelEdit}
                  className="text-zinc-500 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <form
              onSubmit={handleCategorySubmit(onSaveCategory)}
              className="flex items-start gap-3"
            >
              <div className="flex-1">
                <input
                  {...registerCategory("name")}
                  placeholder="Category (e.g. Marketing)"
                  className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                    categoryErrors.name
                      ? "border-red-500/50 bg-red-500/5"
                      : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                  }`}
                />
                {categoryErrors.name && (
                  <p className="text-red-400 text-[10px] mt-1 pl-1">
                    {String(categoryErrors.name.message)}
                  </p>
                )}
              </div>
              <div className="w-1/3">
                <input
                  {...registerCategory("defaultLimit")}
                  type="number"
                  step="any"
                  placeholder="Limit"
                  className={`w-full p-3 rounded-xl border outline-none transition-colors text-sm ${
                    categoryErrors.defaultLimit
                      ? "border-red-500/50 bg-red-500/5"
                      : "bg-zinc-800 border-zinc-700 focus:border-blue-500 text-white"
                  }`}
                />
                {categoryErrors.defaultLimit && (
                  <p className="text-red-400 text-[10px] mt-1 pl-1">
                    Required.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isAddingCategory}
                className={`p-3 rounded-xl transition-all active:scale-95 border disabled:opacity-50 text-white ${
                  editingCategory
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-500"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                }`}
              >
                {isAddingCategory ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : editingCategory ? (
                  <Check size={20} />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </form>
          </div>

          {/* List Categories */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex-1 overflow-y-auto max-h-[350px]">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Your Categories
            </h4>
            <div className="space-y-3">
              {!categories || categories.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-sm border border-dashed border-zinc-700/50 rounded-xl">
                  No custom categories added yet.
                </div>
              ) : (
                categories.map((cat: any) => (
                  <div
                    key={cat._id}
                    className={`flex justify-between items-center bg-zinc-800/50 border p-4 rounded-xl group transition-colors ${
                      editingCategory?._id === cat._id
                        ? "border-blue-500/50"
                        : "border-zinc-700/50 hover:border-zinc-600"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{cat.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Default Limit: LKR {cat.defaultLimit.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="text-zinc-500 hover:text-blue-500 p-2 bg-zinc-800 rounded-lg border border-transparent hover:border-blue-500/20"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id)}
                        className="text-zinc-500 hover:text-red-500 p-2 bg-zinc-800 rounded-lg border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render the Custom Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Custom Category"
        message="Are you sure you want to delete this custom category? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
