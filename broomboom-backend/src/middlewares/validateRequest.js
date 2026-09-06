// Simple and effective body validator helper
const validateLeadInput = (req, res, next) => {
  const { name, phone, email } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ success: false, message: "Full Name is required." });
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
    return res.status(400).json({ success: false, message: "Valid 10-digit Phone Number is required." });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Valid Email Address is required." });
  }
  next();
};

const validateBookingInput = (req, res, next) => {
  const { customerName, customerPhone, customerEmail, vehicleName, pickupAddress, totalTariff } = req.body;
  if (!customerName || !customerPhone || !customerEmail) {
    return res.status(400).json({ success: false, message: "Passenger contact details are required." });
  }
  if (!vehicleName) {
    return res.status(400).json({ success: false, message: "Vehicle selection is required." });
  }
  if (!pickupAddress || typeof pickupAddress !== "string" || !pickupAddress.trim()) {
    return res.status(400).json({ success: false, message: "Pickup address in Kolkata is required." });
  }
  if (!totalTariff || typeof totalTariff !== "number") {
    return res.status(400).json({ success: false, message: "Valid tariff amount is required." });
  }
  next();
};

module.exports = {
  validateLeadInput,
  validateBookingInput,
};

