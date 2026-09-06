const prisma = require("../config/db");
const paymentService = require("./paymentService");

const generateBookingId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `BBC-PUJA-${randomNum}`;
};

const createBooking = async (data) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    vehicleName,
    vehicleModels,
    packageTitle,
    travelDate,
    pickupTime,
    returnDate,
    returnTime,
    pickupAddress,
    pickupPincode,
    pickupState,
    totalTariff,
  } = data;

  const vehicleSeats = parseInt(
    data.vehicleSeats || data.venicleSeats || data.venicieSeats || 4
  );

  const bookingId = data.bookingId || generateBookingId();

  const fare = totalTariff;
  const advanceAmount = Math.round(fare * 0.25);
  const withGst = advanceAmount * 1.05;
  const withGateway = withGst * 1.03;
  const finalPayable = Math.ceil(withGateway);
  const gstAmount = Math.round(advanceAmount * 0.05);
  const gatewayCharge = Math.ceil(withGst * 0.03);
  const balanceDue = fare - advanceAmount;

  const booking = await prisma.booking.create({
    data: {
      bookingId,
      customerName: (customerName || "").trim(),
      customerPhone: (customerPhone || "").trim(),
      customerEmail: (customerEmail || "").trim().toLowerCase(),
      vehicleName: vehicleName || "Assigned Chauffeur Cab",
      vehicleModels: vehicleModels || "Standard AC Chauffeur Fleet",
      vehicleSeats,
      packageTitle: packageTitle || "Durga Puja Festive Tour",
      travelDate: travelDate || "Oct 16 (Maha Saptami)",
      pickupTime: pickupTime || "04:00 PM",
      returnDate: returnDate || "Oct 16 (Same Night)",
      returnTime: returnTime || "11:30 PM",
      pickupAddress: (pickupAddress || "").trim(),
      pickupPincode: pickupPincode ? pickupPincode.trim() : null,
      pickupState: pickupState ? pickupState.trim() : null,
      fare,
      advanceAmount,
      gstAmount,
      gatewayCharge,
      finalPayable,
      balanceDue,
      totalTariff: fare,
      advancePaid: advanceAmount,
      balancePayable: balanceDue,
      status: "PAYMENT_PENDING",
      paymentStatus: "PENDING",
    },
  });

  const cashfreeOrderId = `CF_${booking.bookingId}`;
  const cashfreeOrder = await paymentService.createCashfreeOrder({
    orderId: cashfreeOrderId,
    amount: finalPayable,
    customerId: booking.id,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
  });

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { cashfreeOrderId: cashfreeOrder.order_id },
  });

  return {
    booking: updatedBooking,
    paymentSessionId: cashfreeOrder.payment_session_id,
  };
};

const getBookingByRefId = async (id) => {
  if (!id) return null;
  let booking = await prisma.booking.findFirst({
    where: {
      OR: [
        { bookingId: id },
        { cashfreeOrderId: id },
        { id: id },
      ],
    },
  });
  if (!booking) return null;
  if (booking.paymentStatus !== "PAID" && booking.cashfreeOrderId) {
    try {
      const cashfreeStatus = await paymentService.getCashfreeOrderStatus(booking.cashfreeOrderId);
      if (cashfreeStatus && (cashfreeStatus.order_status === "PAID" || cashfreeStatus.orderStatus === "PAID")) {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        });
      }
    } catch (err) {
      console.warn("Could not verify status with Cashfree:", err.message);
    }
  }
  return booking;
};

const getAllBookings = async () => {
  return await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const updateBookingStatus = async (id, status) => {
  if (!id || !status) return null;
  const existing = await prisma.booking.findFirst({
    where: {
      OR: [{ id: id }, { bookingId: id }],
    },
  });
  if (!existing) return null;

  return await prisma.booking.update({
    where: { id: existing.id },
    data: { status },
  });
};

const updateBooking = async (id, data) => {
  if (!id) return null;
  const existing = await prisma.booking.findFirst({
    where: {
      OR: [{ id: id }, { bookingId: id }],
    },
  });
  if (!existing) return null;

  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
  if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
  if (data.vehicleName !== undefined) updateData.vehicleName = data.vehicleName;
  if (data.vehicleModels !== undefined) updateData.vehicleModels = data.vehicleModels;
  if (data.vehicleSeats !== undefined) updateData.vehicleSeats = Number(data.vehicleSeats);
  if (data.packageTitle !== undefined) updateData.packageTitle = data.packageTitle;
  if (data.travelDate !== undefined) updateData.travelDate = data.travelDate;
  if (data.pickupTime !== undefined) updateData.pickupTime = data.pickupTime;
  if (data.returnDate !== undefined) updateData.returnDate = data.returnDate;
  if (data.returnTime !== undefined) updateData.returnTime = data.returnTime;
  if (data.pickupAddress !== undefined) updateData.pickupAddress = data.pickupAddress;
  if (data.pickupPincode !== undefined) updateData.pickupPincode = data.pickupPincode;
  if (data.pickupState !== undefined) updateData.pickupState = data.pickupState;

  if (data.totalTariff !== undefined) {
    updateData.totalTariff = Number(data.totalTariff);
    updateData.fare = Number(data.totalTariff);
  }
  if (data.advancePaid !== undefined) {
    updateData.advancePaid = Number(data.advancePaid);
    updateData.advanceAmount = Number(data.advancePaid);
  }
  if (data.balancePayable !== undefined) {
    updateData.balancePayable = Number(data.balancePayable);
    updateData.balanceDue = Number(data.balancePayable);
  }

  return await prisma.booking.update({
    where: { id: existing.id },
    data: updateData,
  });
};

// ✅ CORRECT EXPORT – ensure these names match
module.exports = {
  createBooking,
  getBookingByRefId,
  getAllBookings,
  updateBookingStatus,
  updateBooking,
};