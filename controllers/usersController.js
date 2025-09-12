const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not exist!", error: "Authentication Failed" });
  }
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res.status(400).json({ success: false, message: "Invalid credentials!", error: "Authentication Failed" });
  }
  const token = jwt.sign({ email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, });
  return res.status(200).json({ success: true, message: "Welcome Back!", data: { token, username: user.username, email: user.email, role: user.role } });
};

// POST Signup
const signupUser = async (req, res, next) => {
  const { email, username, password } = req.body;
  // Hash the password using await
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  // Create and save user
  const newUser = new User({ username, email, password: hash });
  const user = await newUser.save();
  // Generate token and Set cookie
  const token = jwt.sign({ email, username, role: user.role }, process.env.JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, });
  return res.status(201).json({ success: true, message: "Account Created Successfully!", data: { token, username: user.username, email: user.email, role: user.role } });
};

// GET Logout
const logoutUser = (req, res) => {
  res.clearCookie("token", { httpOnly: true, });
  return res.json({ success: true, message: "Logout Successfully!" });
};


// check user Login and role 
const checkUser = (req, res) => {
  const token = req.cookies?.token;

  // No token → Unauthorized
  if (!token) {
    return res.sendStatus(401);
  }

  // Verify JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(401); // Invalid or expired token
    }

    // Valid token → OK
    res.status(200).json({
      authenticated: true,
      data: decoded
    });
  });
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    //matching password
    const matchPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchPassword) {
      return res.status(401).json({ success: false, message: "Wrong Password", error: "Wrong Password" });
    }
    // Hash the password 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    user.password = hash;
    await user.save();
    return res.status(201).json({ success: true, message: "Password Changed Successfully", data: "password changed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Export all functions at once
module.exports = {
  loginUser,
  signupUser,
  logoutUser,
  checkUser,
  resetPassword
};
