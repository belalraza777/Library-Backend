const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap");
const issueController = require("../controllers/issueController");
const verifyAuth = require("../utils/verifyAuth");
const isAdmin = require("../utils/verfiyAdmin");


// GET all issues (admin)
router.get("/", verifyAuth, isAdmin, asyncWrap(issueController.getAllIssues));

// POST rent book
router.post("/:bookId", verifyAuth, asyncWrap(issueController.issueBook));

//user issue b00k
router.get("/myBooks", verifyAuth, asyncWrap(issueController.mybooks));

// request to return book
router.post("/request/:issueId", verifyAuth, asyncWrap(issueController.requestToReturnBook));

//approved return book
router.post("/return/:issueId", verifyAuth, isAdmin, asyncWrap(issueController.approvedReturn));

module.exports = router;
