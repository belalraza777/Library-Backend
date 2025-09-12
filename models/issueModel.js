const mongoose = require("mongoose");

const issueSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books"
    },
    issueDate: {
        type: Date,
        default: Date.now()
    },
    returnDate: {
        type: Date
    },
    dueDate: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    fineAmount: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    isReturnRequest: {
        type: Boolean,
        default: false
    },
    returnAccept: {
        type: Boolean,
        default: false
    },
},
 {
    // IMPORTANT: We need to enable virtuals so they are included when we convert
    // the document to JSON, which happens when we send it in an API response.
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



// VIRTUAL PROPERTY FOR DYNAMIC FINE CALCULATION
// This 'fine' property will not be stored in the database.
// It will be calculated on-the-fly whenever we access an 'Issue' document.
issueSchema.virtual('fine').get(function() {
    // If the book has already been returned, the fine is fixed.
    // So we just return the stored fineAmount.
    if (this.returnDate) {
        return this.fineAmount;
    }

    const now = new Date();
    const dueDate = this.dueDate;
    let calculatedFine = 0;

    // Check if the due date has passed
    if (now > dueDate) {
        const lateDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        const finePerDay = 50; // You can make this configurable
        calculatedFine = lateDays * finePerDay;
    }

    return calculatedFine;
});



module.exports = mongoose.model("Issue", issueSchema);