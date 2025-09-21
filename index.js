require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const ErrorHandle = require("./utils/errorClass");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");

// Cluster setup
const numCPUs = os.cpus().length;
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for dying workers and replace them
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
    cluster.fork();
  });

} else {
  
  // Worker processes
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(methodOverride('_method'));
  app.use(express.static('public'));
  app.use(cookieParser());

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Connect DB
  mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log(`MongoDB connected (Worker ${process.pid})`))
    .catch((err) => console.log("Connection Failed:", err));

  const booksRoute = require("./routes/books");
  const usersRoute = require("./routes/users");
  const issueRoute = require("./routes/issues");

  // Routes
  app.get("/", (req, res, next) => {
    return res.json({ message: "Welcome to the Library API!" });
  });

  app.use("/api/books", booksRoute);
  app.use("/api/users", usersRoute);
  app.use("/api/issues", issueRoute);

  // Unknown Route
  app.use("", (req, res, next) => {
    next(new ErrorHandle(404, "Page not Found"));
  });

  // Error Middleware
  app.use((err, req, res, next) => {
    const { status = 500, message = "some error" } = err;
    return res.status(status).json({ success: false, message, error: message });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started at port ${PORT}`);
  });
}
