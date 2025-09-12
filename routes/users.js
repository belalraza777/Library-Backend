const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { userRegisterSchema, userLoginSchema, validate } = require("../utils/joiValidation");
const verifyAuth = require("../utils/verifyAuth");

// Login routes
router.post("/login", validate(userLoginSchema), usersController.loginUser);

// Signup routes
router.post("/signup", validate(userRegisterSchema), usersController.signupUser);

// Logout route
router.get("/logout", usersController.logoutUser);

//to Check Login and role in frontend 
router.get("/check", usersController.checkUser);

//reset password
router.patch("/reset", verifyAuth, usersController.resetPassword);


module.exports = router;
