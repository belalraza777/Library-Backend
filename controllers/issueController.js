const Books = require("../models/booksModel");
const Issues = require("../models/issueModel");
const User = require("../models/usersModel");

// GET all rented issues (or rental history page)
const getAllIssues = async (req, res) => {
  const allIssuedBooks = await Issues.find({}).populate("userId").populate("bookId");
  return res.json({ success: true, message: "All issued books fetched successfully", data: allIssuedBooks });
};

// POST borrow a book
const issueBook = async (req, res) => {
  const { bookId } = req.params; // get book id from route params
  const book = await Books.findById(bookId); // find the book in DB
  const user = await User.findOne({ email: req.user.email }); // get current logged-in user

  // check if the user already issued this book and hasn’t returned it yet
  const alreadyIssued = await Issues.findOne({ userId: user._id, bookId, returnDate: null });
  if (alreadyIssued) {
    return res.status(400).json({
      success: false,
      message: "You've already issued this book!",
      error: "Bad Request"
    });
  }

  // check if book copies are available
  if (book.availableCopies) {
    // create new issue record
    const issue = new Issues({
      userId: user._id,
      bookId: bookId,
    });
    const issued = await issue.save();

    // update available copies
    book.availableCopies = book.availableCopies - 1;
    await book.save();

    // update user's issued books
    user.issuedBooks.push(issued);
    await user.save();

    // success response with selected details
    return res.status(201).json({
      success: true,
      message: "Book Issued Successfully!",
      data: {
        issued,
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
        },
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      }
    });
  } else {
    // if no copies left
    return res.status(400).json({
      success: false,
      message: "Sorry Book is not available!",
      error: "Bad Request"
    });
  }
};


//rented book by a user
const mybooks = async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    //nested populate
    path: "issuedBooks",
    populate: {
      path: "bookId",
      model: "Books",
    },
  });
  const mybooks = user.issuedBooks;
  return res.json({ success: true, message: "My books fetched successfully", data: mybooks });
};


// request to return a book by user
const requestToReturnBook = async (req, res) => {
  const { issueId } = req.params;
  const issue = await Issues.findById(issueId).populate("bookId");
  issue.isReturnRequest = true;
  await issue.save();
  return res.json({ success: true, message: "Request Sent for Return Successfully!", data: issue });
};

//return acecpt my admin
const approvedReturn = async (req, res) => {
   const { issueId } = req.params;
    const issue = await Issues.findById(issueId).populate("bookId").populate("userId");

    // Remove the issued record from the user's list
    // await User.findByIdAndUpdate(issue.userId._id, { $pull: { issuedBooks: issueId } });

    // The fine is calculated by our virtual property. We just need to "freeze" it
    // into the fineAmount field for the historical record.
    issue.returnDate = new Date();
    issue.fineAmount = issue.fine; // Get the final fine from the virtual property
    issue.returnAccept = true;
    issue.isReturnRequest = false;

    await issue.save();

    // Increase available copy count
    await Books.findByIdAndUpdate(issue.bookId._id, {
        $inc: { availableCopies: 1 },
    });

    return res.json({ success: true, message: "Book Return Accepted Successfully!", data: issue });
}

module.exports = {
  getAllIssues,
  issueBook,
  mybooks,
  approvedReturn,
  requestToReturnBook
};
