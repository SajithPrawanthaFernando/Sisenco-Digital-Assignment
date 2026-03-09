const express = require("express");
const userController = require("../../controllers/user/userController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.post("/register", userController.registerUser); // api for regitering a user
router.post("/login", userController.loginUser); // api for login a user
router.post("/logout", requireAuth, userController.logoutUser); // api for logoutting a user
router.get("/profile", requireAuth, userController.getUserProfile); // api for getting user data
router.put("/update", requireAuth, userController.updateUser); // api for updating a user
router.delete("/delete", requireAuth, userController.deleteUser); // api for deletting a user

module.exports = router;
