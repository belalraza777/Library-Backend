require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const ErrorHandle = require("./utils/errorClass");
const cookieParser = require('cookie-parser');
const cors = require("cors")

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,   // allow only this origin
  credentials: true                  // allow cookies
}));


//connect db
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Connection Failed:", err));


const booksRoute = require("./routes/books");
const usersRoute = require("./routes/users");
const issueRoute = require("./routes/issues");

//routes
//--------Home Route
app.get("/", (req, res, next) => {
  return res.json({ message: "Welcome to the Library API!" });
});

//--------Book Route
app.use("/api/books", booksRoute);
//---------Auth Route
app.use("/api/users", usersRoute);
//----------Issue route
app.use("/api/issues", issueRoute);

//Unknown Route 
app.use("", (req, res, next) => {
  next(new ErrorHandle(404, "Page not Found"));
});

//error middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "some error" } = err;
  return res.status(status).json({ success: false, message, error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server Started at ", PORT);
});