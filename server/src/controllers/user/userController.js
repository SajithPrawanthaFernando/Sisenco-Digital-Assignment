const userService = require("../../services/user/userService");

// controller for restering user
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.registerUser(name, email, password, role);
    res.status(201).json(user);
  } catch (error) {
    next(error); // Pass error to middleware
  }
};

// controller for logging user
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// controller for logoutting user
exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 }); // Clear cookie
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// controller for getting user data
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user._id);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// controller for updating user
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, password, currency, budgetLimit } = req.body;
    const updatedUser = await userService.updateUser(req.user._id, {
      name,
      email,
      password,
      currency,
      budgetLimit,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// controller for deleting user
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.user._id);
    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    next(error);
  }
};
