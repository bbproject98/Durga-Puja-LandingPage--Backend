const prisma = require("../config/db");
const paymentService = require("../services/paymentService");

const handleCashfreeWebhook = async (req, res, next) => {
  try {
    const payload = req.body || {};
    console.log("🔔 Cashfree Webhook Received:", JSON.stringify(payload));

    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};

    const orderId = orderData.order_id || payload.orderId || payload.order_id;
    const orderStatus = (
      orderData.order_status ||
      paymentData.payment_status ||
      payload.orderStatus ||
      payload.txStatus ||
      ""
    ).toUpperCase();

    if (orderId) {
      const cleanId = String(orderId).trim();
      const withoutCF = cleanId.startsWith("CF_") ? cleanId.slice(3) : cleanId;

      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { cashfreeOrderId: cleanId },
            { bookingId: cleanId },
            { bookingId: withoutCF },
          ],
        },
      });

      if (booking) {
        if (orderStatus === "PAID" || orderStatus === "SUCCESS") {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
          });
          console.log(`✅ Booking ${booking.bookingId} marked as PAID via webhook`);
        } else if (orderStatus === "FAILED" || orderStatus === "USER_DROPPED") {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "FAILED",
            },
          });
          console.log(`⚠️ Booking ${booking.bookingId} payment marked as FAILED via webhook`);
        }
      }
    }

    return res.status(200).json({ success: true, message: "Webhook acknowledged" });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    return res.status(200).json({ success: true, message: "Acknowledged with warning" });
  }
};

const verifyPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const cleanId = String(orderId).trim();
    const withoutCF = cleanId.startsWith("CF_") ? cleanId.slice(3) : cleanId;
    const withCF = cleanId.startsWith("CF_") ? cleanId : `CF_${cleanId}`;

    let booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { cashfreeOrderId: cleanId },
          { cashfreeOrderId: withCF },
          { bookingId: cleanId },
          { bookingId: withoutCF },
        ],
      },
    });

    const cashfreeStatus = await paymentService.getCashfreeOrderStatus(booking?.cashfreeOrderId || withCF);

    if (cashfreeStatus && booking) {
      const orderStatus = (cashfreeStatus.order_status || cashfreeStatus.orderStatus || "").toUpperCase();
      if (orderStatus === "PAID") {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        });
      } else if (orderStatus === "FAILED" || orderStatus === "CANCELLED") {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "FAILED",
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      booking,
      gatewayStatus: cashfreeStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCashfreeWebhook,
  verifyPaymentStatus,
};
