const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// Protect all admin routes
router.use(adminAuth);

// Stats
router.get("/stats", adminController.getStats);

// Reservations CRUD
router.get("/reservations", adminController.getReservations);
router.get("/reservations/:id", adminController.getReservation);
router.put("/reservations/:id", adminController.updateReservation);
router.delete("/reservations/:id", adminController.deleteReservation);

module.exports = router;
