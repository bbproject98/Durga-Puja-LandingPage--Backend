require("../config/env");
const axios = require("axios");

const formatCashfreePhone = (rawPhone) => {
  if (!rawPhone) return "9876543210";
  let cleaned = String(rawPhone).replace(/\D/g, "");
  if (cleaned.length > 10 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }
  if (!cleaned || cleaned.length < 10) {
    return "9876543210";
  }
  return cleaned;
};

const formatCashfreeEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== "string") return "customer@broomboom.com";
  const trimmed = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : "customer@broomboom.com";
};

const createCashfreeOrder = async ({
  orderId,
  amount,
  customerId,
  customerName,
  customerPhone,
  customerEmail,
}) => {
  // Validate required environment variables
  const requiredEnvVars = [
    'CASHFREE_ENV',
    'CASHFREE_APP_ID',
    'CASHFREE_SECRET_KEY',
    'BACKEND_URL',
    'FRONTEND_URL' // new variable for return URL
  ];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Validate inputs
  if (!orderId || !amount || Number(amount) <= 0) {
    throw new Error('Invalid order ID or amount');
  }

  const sanitizedPhone = formatCashfreePhone(customerPhone);
  const sanitizedEmail = formatCashfreeEmail(customerEmail);
  const sanitizedName = (customerName && String(customerName).trim()) || "Guest Passenger";

  const isProduction = process.env.CASHFREE_ENV === "production";
  const baseURL = isProduction
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  // Construct dynamic return URL
  const returnUrl = `${process.env.FRONTEND_URL}/thank-you?order_id={order_id}`;

  try {
    const response = await axios.post(
      `${baseURL}/orders`,
      {
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: String(customerId || orderId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50),
          customer_name: sanitizedName,
          customer_phone: sanitizedPhone,
          customer_email: sanitizedEmail,
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`,
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": process.env.CASHFREE_API_VERSION || "2023-08-01",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds
      }
    );

    return response.data;
  } catch (error) {
    // Extract informative error detail from Cashfree API
    const responseData = error.response?.data;
    const detailMsg = responseData?.message || error.message;
    console.error('Cashfree order creation failed:', detailMsg);
    if (responseData) {
      console.error('Cashfree error data:', responseData);
    }
    // Re-throw a friendly and descriptive error
    throw new Error(`Failed to create Cashfree order: ${detailMsg}`);
  }
};

const getCashfreeOrderStatus = async (orderId) => {
  if (!orderId) return null;

  const isProduction = process.env.CASHFREE_ENV === "production";
  const baseURL = isProduction
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  try {
    const response = await axios.get(`${baseURL}/orders/${orderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": process.env.CASHFREE_API_VERSION || "2023-08-01",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.warn(`Could not verify Cashfree order ${orderId}:`, error.response?.data?.message || error.message);
    return null;
  }
};

module.exports = { createCashfreeOrder, getCashfreeOrderStatus };