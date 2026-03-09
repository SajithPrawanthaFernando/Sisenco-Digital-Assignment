const SystemSettings = require("../../models/SystemSettings");
const mongoose = require("mongoose");

/** Get all categories and default limits */
exports.getSystemSettings = async () => {
  let settings = await SystemSettings.findOne();

  if (!settings) {
    settings = await SystemSettings.create({ categories: [] });
  }

  return settings;
};

/** Add a new category with a default limit */
exports.addCategory = async (name, defaultLimit) => {
  let settings = await SystemSettings.findOne();

  if (!settings) {
    settings = await SystemSettings.create({ categories: [] });
  }

  // Ensure category does not already exist
  if (settings.categories.some((category) => category.name === name)) {
    throw new Error("Category already exists.");
  }

  settings.categories.push({ name, defaultLimit });
  await settings.save();
  return settings;
};

/** Update an existing category */
exports.updateCategory = async (categoryId, name, defaultLimit) => {
  // Validate categoryId format
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID format.");
  }

  // Ensure at least one field is provided for the update
  if (!name && defaultLimit === undefined) {
    throw new Error(
      "At least one field (name or defaultLimit) is required to update."
    );
  }

  // Fetch settings
  const settings = await SystemSettings.findOne();
  if (!settings) throw new Error("System settings not found.");

  // Find the category
  const category = settings.categories.find(
    (category) => category._id.toString() === categoryId
  );

  if (!category) throw new Error("Category not found.");

  // Prevent duplicate category names
  if (
    name &&
    settings.categories.some(
      (cat) => cat.name === name && cat._id.toString() !== categoryId
    )
  ) {
    throw new Error("Category name already exists.");
  }

  // Update fields
  category.name = name || category.name;
  category.defaultLimit =
    defaultLimit !== undefined ? defaultLimit : category.defaultLimit;

  await settings.save();
  return settings;
};

/** Delete a category */
exports.deleteCategory = async (categoryId) => {
  // Validate categoryId format
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID format.");
  }

  // Fetch settings
  const settings = await SystemSettings.findOne();
  if (!settings) throw new Error("System settings not found.");

  // Ensure category exists before deleting
  const categoryExists = settings.categories.some(
    (category) => category._id.toString() === categoryId
  );
  if (!categoryExists) {
    throw new Error("Category not found.");
  }

  // Remove the category
  settings.categories = settings.categories.filter(
    (category) => category._id.toString() !== categoryId
  );
  await settings.save();

  return { message: "Category deleted successfully." };
};
