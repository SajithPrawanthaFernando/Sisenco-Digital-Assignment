const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next({ statusCode: 401, message: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select("_id email role");

    if (!req.user) {
      return next({
        statusCode: 401,
        message: "User not found. Please log in again.",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next({
        statusCode: 401,
        message: "Session expired. Please log in again.",
      });
    }

    return next({
      statusCode: 401,
      message: "Invalid token. Unauthorized request.",
    });
  }
};

module.exports = requireAuth;
