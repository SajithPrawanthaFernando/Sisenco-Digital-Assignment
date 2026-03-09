const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const mongoose = require("mongoose");

// Create a jwt token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

/**
 * Validates password strength
 */
const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// service for create a user
exports.registerUser = async (name, email, password, role) => {
  if (!name || !email || !password) {
    const error = new Error("All fields are required.");
    error.statusCode = 400;
    throw error;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error("Invalid email format.");
    error.statusCode = 400;
    throw error;
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    const error = new Error(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
    error.statusCode = 400;
    throw error;
  }

  // Ensure role is either "user" or "admin"
  if (!["user", "admin"].includes(role)) {
    const error = new Error("Invalid role. Must be 'user' or 'admin'.");
    error.statusCode = 400;
    throw error;
  }

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already in use.");
    error.statusCode = 400;
    throw error;
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });

  await user.save();
  const token = createToken(user._id);

  return { user, token };
};

//service for login a user
exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const token = createToken(user._id);

  return { user, token };
};

//service for getting user data
exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/** Update User */
exports.updateUser = async (userId, updateData) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  // Ensure at least one field is provided for the update
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error("At least one field is required to update.");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Define allowed update fields
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "currency",
    "budgetLimit",
  ];
  const invalidFields = Object.keys(updateData).filter(
    (key) => !allowedUpdates.includes(key)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid update fields: ${invalidFields.join(", ")}`);
  }

  // Validate email format if updating email
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      throw new Error("Invalid email format.");
    }

    // Ensure email is not already taken by another user
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new Error("Email is already in use.");
    }
  }

  // Validate password strength if updating password
  if (updateData.password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(updateData.password)) {
      throw new Error(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // Perform the update
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password"); // Exclude password from the response

  return updatedUser;
};

//service for delete a user
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  await User.findByIdAndDelete(userId);
};
