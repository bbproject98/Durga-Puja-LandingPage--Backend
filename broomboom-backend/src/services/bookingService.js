require("../config/env");
const prisma = require("../config/db");
const paymentService = require("./paymentService");
const { promoteCustomerLeadsToLoyal } = require("./leadService");

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

  const fare = Number(totalTariff || data.fare) || 0;
  const advanceAmount = Math.round(fare * 0.25);
  const gstAmount = Math.round(advanceAmount * 0.05);
  const withGst = advanceAmount + gstAmount;
  const gatewayCharge = Math.ceil(withGst * 0.03);
  const finalPayable = withGst + gatewayCharge;
  const balanceDue = Math.max(0, fare - advanceAmount);

  const sanitizedName = (customerName || "").trim() || "Guest Passenger";
  const sanitizedPhone = (customerPhone || "").trim();
  
  let cleanCustomerEmail = null;
  if (customerEmail && typeof customerEmail === "string") {
    const trimmed = customerEmail.trim().toLowerCase();
    if (trimmed && trimmed !== "null" && trimmed !== "undefined") {
      cleanCustomerEmail = trimmed;
    }
  }

  const isPayLater =
    data.payMode === "cod" ||
    data.payMode === "pay_later" ||
    data.isPayLater === true ||
    data.paymentStatus === "PAY_LATER" ||
    data.status === "PAY_LATER";

  let booking = null;
  try {
    booking = await prisma.booking.create({
      data: {
        bookingId,
        customerName: sanitizedName,
        customerPhone: sanitizedPhone,
        customerEmail: cleanCustomerEmail,
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
        status: isPayLater ? (data.status || "CONFIRMED") : (data.status || "PAYMENT_PENDING"),
        paymentStatus: isPayLater ? (data.paymentStatus || "PENDING") : (data.paymentStatus || "PENDING"),
      },
    });

    if (isPayLater) {
      await promoteCustomerLeadsToLoyal(booking.customerPhone);
      return {
        booking,
        paymentSessionId: null,
      };
    }

    const cashfreeOrderId = `CF_${booking.bookingId}`;
    const cashfreeOrder = await paymentService.createCashfreeOrder({
      orderId: cashfreeOrderId,
      amount: finalPayable,
      customerId: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: cleanCustomerEmail || "customer@broomboom.com",
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { cashfreeOrderId: cashfreeOrder.order_id },
    });

    return {
      booking: updatedBooking,
      paymentSessionId: cashfreeOrder.payment_session_id,
    };
  } catch (error) {
    // If Cashfree order initialization fails, clean up the pending record so retries do not collide on unique constraints
    if (booking && !booking.cashfreeOrderId) {
      await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    }
    throw error;
  }
};

const getBookingByRefId = async (id) => {
  if (!id) return null;
  const cleanId = String(id).trim();
  const withoutCF = cleanId.startsWith("CF_") ? cleanId.slice(3) : cleanId;
  const withCF = cleanId.startsWith("CF_") ? cleanId : `CF_${cleanId}`;

  let booking = await prisma.booking.findFirst({
    where: {
      OR: [
        { bookingId: cleanId },
        { bookingId: withoutCF },
        { cashfreeOrderId: cleanId },
        { cashfreeOrderId: withCF },
        { id: cleanId },
      ],
    },
  });
  if (!booking) return null;

  if (booking.paymentStatus !== "PAID" && booking.cashfreeOrderId) {
    try {
      const cashfreeStatus = await paymentService.getCashfreeOrderStatus(booking.cashfreeOrderId);
      if (cashfreeStatus) {
        const orderStatus = cashfreeStatus.order_status || cashfreeStatus.orderStatus;
        if (orderStatus === "PAID") {
          booking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
          });
          await promoteCustomerLeadsToLoyal(booking.customerPhone);
        } else if (orderStatus === "FAILED" || orderStatus === "CANCELLED") {
          booking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "FAILED",
            },
          });
        }
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
  const cleanId = String(id).trim();
  const existing = await prisma.booking.findFirst({
    where: {
      OR: [{ id: cleanId }, { bookingId: cleanId }, { cashfreeOrderId: cleanId }],
    },
  });
  if (!existing) return null;

  const updated = await prisma.booking.update({
    where: { id: existing.id },
    data: { status },
  });

  if (status === "CONFIRMED" || status === "COMPLETED") {
    await promoteCustomerLeadsToLoyal(existing.customerPhone);
  }

  return updated;
};

const updateBooking = async (id, data) => {
  if (!id) return null;
  const cleanId = String(id).trim();
  const existing = await prisma.booking.findFirst({
    where: {
      OR: [{ id: cleanId }, { bookingId: cleanId }, { cashfreeOrderId: cleanId }],
    },
  });
  if (!existing) return null;

  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
  if (data.customerEmail !== undefined) {
    let cleanEmail = null;
    if (data.customerEmail && typeof data.customerEmail === "string") {
      const trimmed = data.customerEmail.trim().toLowerCase();
      if (trimmed && trimmed !== "null" && trimmed !== "undefined") {
        cleanEmail = trimmed;
      }
    }
    updateData.customerEmail = cleanEmail;
  }
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
  if (data.cashfreeOrderId !== undefined) updateData.cashfreeOrderId = data.cashfreeOrderId;

  // Handle all financial breakdown fields cleanly
  const fare = data.fare !== undefined ? Number(data.fare) : (data.totalTariff !== undefined ? Number(data.totalTariff) : undefined);
  if (fare !== undefined) {
    updateData.fare = fare;
    updateData.totalTariff = fare;
  }

  const advance = data.advanceAmount !== undefined ? Number(data.advanceAmount) : (data.advancePaid !== undefined ? Number(data.advancePaid) : undefined);
  if (advance !== undefined) {
    updateData.advanceAmount = advance;
    updateData.advancePaid = advance;
  }

  if (data.gstAmount !== undefined) {
    updateData.gstAmount = Number(data.gstAmount);
  }
  if (data.gatewayCharge !== undefined) {
    updateData.gatewayCharge = Number(data.gatewayCharge);
  }
  if (data.finalPayable !== undefined) {
    updateData.finalPayable = Number(data.finalPayable);
  }

  const balance = data.balanceDue !== undefined ? Number(data.balanceDue) : (data.balancePayable !== undefined ? Number(data.balancePayable) : undefined);
  if (balance !== undefined) {
    updateData.balanceDue = balance;
    updateData.balancePayable = balance;
  }

  const updated = await prisma.booking.update({
    where: { id: existing.id },
    data: updateData,
  });

  if (
    updateData.status === "CONFIRMED" ||
    updateData.status === "COMPLETED" ||
    updateData.paymentStatus === "PAID"
  ) {
    await promoteCustomerLeadsToLoyal(updated.customerPhone || existing.customerPhone);
  }

  return updated;
};

const deleteBooking = async (id) => {
  if (!id) return null;
  const cleanId = String(id).trim();
  const existing = await prisma.booking.findFirst({
    where: {
      OR: [{ id: cleanId }, { bookingId: cleanId }, { cashfreeOrderId: cleanId }],
    },
  });
  if (!existing) return null;

  return await prisma.booking.delete({
    where: { id: existing.id },
  });
};

module.exports = {
  createBooking,
  getBookingByRefId,
  getAllBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
};