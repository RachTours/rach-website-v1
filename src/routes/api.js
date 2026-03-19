const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { reservationValidation } = require("../utils/validators");
const rateLimit = require("express-rate-limit");

// Rate limiter for reservation submissions
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many reservation attempts. Please contact us directly.",
  },
});

// Public: Create reservation
router.post(
  "/send-whatsapp",
  reservationLimiter,
  reservationValidation,
  reservationController.createReservation,
);

// Public: Confirmed bookings calendar data (no PII)
router.get("/confirmed-bookings", reservationController.getConfirmedBookings);

module.exports = router;
