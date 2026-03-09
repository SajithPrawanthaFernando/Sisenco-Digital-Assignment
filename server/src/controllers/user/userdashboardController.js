const dashboardService = require("../../services/user/userdashboardService");

exports.getSavingsProgress = async (req, res, next) => {
  try {
    const progressData = await dashboardService.getSavingsProgressData(
      req.user._id
    );
    res.status(200).json(progressData);
  } catch (error) {
    next(error);
  }
};

exports.getUserDashboard = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.getUserDashboardData(
      req.user._id
    );
    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};
