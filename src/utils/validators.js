const { body } = require("express-validator");

const reservationValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name too long")
    .escape(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ max: 30 })
    .withMessage("Phone too long"),
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
    .withMessage("Each tour must have a tourId"),
  body("selectedTours.*.hasTransport")
    .optional()
    .isBoolean()
    .withMessage("hasTransport must be a boolean"),
];

module.exports = { reservationValidation };
