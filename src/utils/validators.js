const { body } = require("express-validator");

const reservationValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters")
    .escape(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ min: 7, max: 30 })
    .withMessage("Phone must be 7-30 characters")
    .matches(/^\+?[\d\s\-()]{7,30}$/)
    .withMessage("Invalid phone number format"),
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Time is required")
    .isLength({ max: 10 })
    .withMessage("Time too long")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Time must be HH:MM format"),
  body("guests")
    .isInt({ min: 1, max: 100 })
    .withMessage("Guests must be between 1 and 100"),
  body("special")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special request too long")
    .escape(),
  body("selectedTours")
    .isArray({ min: 1 })
    .withMessage("At least one tour must be selected"),
  body("selectedTours.*.tourId")
    .notEmpty()
    .withMessage("Each tour must have a tourId")
    .isString()
    .withMessage("Tour ID must be a string")
    .isLength({ max: 50 })
    .withMessage("Tour ID too long"),
  body("selectedTours.*.hasTransport")
    .optional()
    .isBoolean()
    .withMessage("hasTransport must be a boolean"),
];

module.exports = { reservationValidation };
