const Joi = require("joi");

// --------------------
// User Validation
// --------------------
const userRegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
  role: Joi.string().valid("admin", "member").default("member"),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// --------------------
// Book Validation
// --------------------
const bookSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 2 characters long",
    "string.max": "Title cannot exceed 100 characters",
  }),
  author: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Author is required",
    "string.min": "Author must be at least 2 characters long",
    "string.max": "Author cannot exceed 100 characters",
  }),
  category: Joi.string().max(50).optional(),
  availableCopies: Joi.number().integer().min(0).required().messages({
    "number.base": "Available copies must be a number",
    "number.min": "Available copies cannot be less than 0",
    "any.required": "Available copies are required",
  }),
  totalCopies: Joi.number().integer().min(1).required().messages({
    "number.base": "Total copies must be a number",
    "number.min": "A book must have at least 1 copy",
    "any.required": "Total copies are required",
  }),
  isbn: Joi.string().required().messages({
    "string.empty": "ISBN is required",
  }),
  image: Joi.string().uri().optional(),
}).custom((value, helpers) => {
  if (value.availableCopies > value.totalCopies) {
    return helpers.error("any.invalid");
  }
  return value;
}).messages({
  "any.invalid": "Available copies cannot be more than total copies",
});

// --------------------
// Validation Middleware
// --------------------
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

module.exports = {
  userRegisterSchema,
  userLoginSchema,
  bookSchema,
  validate,
};
