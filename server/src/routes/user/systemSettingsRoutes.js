const express = require("express");
const systemSettingsController = require("../../controllers/user/systemSettingsController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/categories", systemSettingsController.getSystemSettings); // Fetch available categories (for users/admin)

router.post("/addcategories", systemSettingsController.addCategory); // Add new category

router.put("/categories/:categoryId", systemSettingsController.updateCategory); // Update category

router.delete(
  "/categories/:categoryId",
  systemSettingsController.deleteCategory,
); // Delete category

module.exports = router;
