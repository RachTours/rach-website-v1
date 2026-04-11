const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { reservationValidation } = require("../utils/validators");
const rateLimit = require("express-rate-limit");

// Specific limiter for WhatsApp sending
const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 messages per hour
  message: "Too many reservation attempts. Please contact us directly.",
});

router.post(
  "/send-whatsapp",
  whatsappLimiter,
  reservationValidation,
  reservationController.createReservation,
);

module.exports = router;
