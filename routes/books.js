const express = require("express");
const router = express.Router();
const bookController = require("../controllers/booksController");
const asyncWrap = require("../utils/asyncWrap");
const verifyAuth = require("../utils/verifyAuth");
const isAdmin = require("../utils/verfiyAdmin");
const { bookSchema, validate } = require("../utils/joiValidation");


router.get("/", verifyAuth, asyncWrap(bookController.getAllBooks));
router.post("/", verifyAuth, isAdmin, validate(bookSchema), asyncWrap(bookController.addNewBook));
router.get("/:id", verifyAuth, asyncWrap(bookController.getBookById));
router.patch("/:id", verifyAuth, isAdmin, validate(bookSchema), asyncWrap(bookController.updateBook));
router.delete("/:id", verifyAuth, isAdmin, asyncWrap(bookController.deleteBook));

module.exports = router;