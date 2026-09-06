// ------------------------------------------
// Import service functions directly
// ------------------------------------------
const {
  createBooking: createBookingService,
  getBookingByRefId,
  getAllBookings: getAllBookingsService,
} = require("../services/bookingService");
const bookingService = require("../services/bookingService");
console.log("🔍 bookingService:", bookingService);
console.log("🔍 Keys:", Object.keys(bookingService));
// ------------------------------------------
// CREATE BOOKING
// ------------------------------------------
const createBooking = async (req, res, next) => {
  try {
    const result = await createBookingService(req.body);

    return res.status(201).json({
      success: true,
      message: "Booking created. Proceed to payment.",
      data: {
        booking: result.booking,
        paymentSessionId: result.paymentSessionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------
// GET SINGLE BOOKING by ID
// ------------------------------------------
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await getBookingByRefId(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------
// GET ALL BOOKINGS
// ------------------------------------------
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await getAllBookingsService();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------
// UPDATE BOOKING STATUS
// ------------------------------------------
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required.",
      });
    }

    const updated = await bookingService.updateBookingStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Booking '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------
// UPDATE BOOKING (All fields)
// ------------------------------------------
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await bookingService.updateBooking(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Booking '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------
// EXPORT ROUTE HANDLERS
// ------------------------------------------
module.exports = {
  createBooking,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  updateBooking,
};