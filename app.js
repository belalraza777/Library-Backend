require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ErrorHandle = require("./utils/errorClass");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Create app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Connect DB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Connection Failed:", err));

// Routes
const booksRoute = require("./routes/books");
const usersRoute = require("./routes/users");
const issueRoute = require("./routes/issues");

app.get("/", (req, res) => {
  return res.json({ message: "Welcome to the Library API!" });
});

app.use("/api/books", booksRoute);
app.use("/api/users", usersRoute);
app.use("/api/issues", issueRoute);

// Unknown Route
app.use((req, res, next) => {
  next(new ErrorHandle(404, "Page not Found"));
});

// Error Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "some error" } = err;
  return res.status(status).json({ success: false, message, error: message });
});

module.exports = app;
