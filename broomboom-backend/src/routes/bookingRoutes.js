const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { validateBookingInput } = require("../middlewares/validateRequest");

// POST /api/bookings - Create and confirm a new booking
router.post("/", validateBookingInput, bookingController.createBooking);

// GET /api/bookings/:id - Retrieve booking details by booking ID (e.g. BBC-PUJA-XXXXXX)
router.get("/:id", bookingController.getBooking);

// GET /api/bookings - List all bookings
router.get("/", bookingController.getAllBookings);

// PATCH /api/bookings/:id/status - Update booking status
router.patch("/:id/status", bookingController.updateBookingStatus);

// PUT or PATCH /api/bookings/:id - Update booking details
router.put("/:id", bookingController.updateBooking);
router.patch("/:id", bookingController.updateBooking);

module.exports = router;

