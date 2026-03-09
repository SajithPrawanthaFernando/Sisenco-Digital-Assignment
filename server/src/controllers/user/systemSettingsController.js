const systemSettingsService = require("../../services/user/systemSettingsService");

/** Get all categories and default limits */
exports.getSystemSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingsService.getSystemSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/** Add a new budget category */
exports.addCategory = async (req, res, next) => {
  try {
    const { name, defaultLimit } = req.body;
    const settings = await systemSettingsService.addCategory(
      name,
      defaultLimit,
    );
    res.status(201).json(settings);
  } catch (error) {
    next(error);
  }
};

/** Update an existing budget category */
exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, defaultLimit } = req.body;
    const settings = await systemSettingsService.updateCategory(
      categoryId,
      name,
      defaultLimit,
    );
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/** Delete a budget category */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const settings = await systemSettingsService.deleteCategory(categoryId);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};
