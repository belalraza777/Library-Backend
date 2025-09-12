const Books = require("../models/booksModel");

// GET all books
const getAllBooks = async (req, res) => {
  const allBooks = await Books.find({});
  return res.json({ success: true, message: "All books fetched successfully", data: allBooks || "no books added"});
};

// POST create new book (admin)
const addNewBook = async (req, res) => {
  const book = req.body;
  const addBook = new Books(book);
  await addBook.save();
  return res.status(201).json({ success: true, message: "Book Added Successfully!", data: addBook });
};

// GET one book detail
const getBookById = async (req, res) => {
  const { id } = req.params;
  const book = await Books.findById(id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found", error: "Not Found" });
  }
  return res.json({ success: true, message: "Book fetched successfully", data: book });
};

// PATCH update book (admin)
const updateBook = async (req, res) => {
  const { id } = req.params;
  const updatedBook = req.body;
  const book = await Books.findByIdAndUpdate(id, updatedBook, { new: true });
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found", error: "Not Found" });
  }
  return res.json({ success: true, message: "Book Updated Successfully!", data: book });
};

// DELETE a book  (admin)
const deleteBook = async (req, res) => {
  const { id } = req.params;
  const book = await Books.findByIdAndDelete(id);
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found", error: "Not Found" });
  }
  return res.status(200).json({ success: true, message: "Book Deleted Successfully!", data: { id } });
};

// Export all controllers at once
module.exports = {
  getAllBooks,
  addNewBook,
  getBookById,
  updateBook,
  deleteBook,
};
