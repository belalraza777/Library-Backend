const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, "Available copies cannot be less than 0"],
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, "A book must have at least 1 copy"],
    },
    isbn: {
      type: String,
      unique: true,
      required: [true, "ISBN is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/29/29302.png",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Books", bookSchema);
