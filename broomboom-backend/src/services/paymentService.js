const axios = require("axios");

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
  if (!orderId || !amount || amount <= 0) {
    throw new Error('Invalid order ID or amount');
  }
  if (!customerId || !customerName || !customerPhone || !customerEmail) {
    throw new Error('Missing customer details');
  }

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
          customer_id: String(customerId),
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
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
          "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds
      }
    );

    return response.data;
  } catch (error) {
    // Log error (avoid logging sensitive data)
    console.error('Cashfree order creation failed:', error.message);
    if (error.response) {
      // Cashfree returned an error response
      console.error('Cashfree error data:', error.response.data);
    }
    // Re-throw a more friendly error
    throw new Error(`Failed to create Cashfree order: ${error.message}`);
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