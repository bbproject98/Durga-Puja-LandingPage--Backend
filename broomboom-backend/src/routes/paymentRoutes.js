const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// POST /api/payments/cashfree/webhook - Cashfree IPN Webhook callback
router.post("/cashfree/webhook", paymentController.handleCashfreeWebhook);

// GET /api/payments/status/:orderId - Verify and fetch Cashfree order status
router.get("/status/:orderId", paymentController.verifyPaymentStatus);

module.exports = router;
