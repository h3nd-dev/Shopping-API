const Payment = require("../model/payment");
const express = require("express");
const router = express.Router();
const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Create an instance of axios with base URL and headers
const paystackApi = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initialize Payment Endpoint
router.post("/initializePayment", async (req, res) => {
  const { name, email, amount } = req.body;

  // Ensure all required fields are present
  if (!name || !email || !amount) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, amount) are required",
    });
  }

  const paymentData = {
    email,
    amount: amount * 100, // Paystack requires the amount in kobo (smallest currency unit)
    callback_url: "http://localhost:5173/verify",
  };

  try {
    // Await the API call to ensure the response is received before proceeding
    const response = await paystackApi.post(
      "/transaction/initialize",
      paymentData
    );

    // Check if response and response.data are defined
    if (!response || !response.data || !response.data.data) {
      throw new Error("Error initializing payment");
    }

    // Extract the reference and authorization URL from the response
    const { reference, authorization_url } = response.data.data;

    // Create a new Payment instance
    const payment = new Payment({
      reference: reference,
      amount: paymentData.amount,
      customer: {
        email,
        name,
      },
    });

    // Save the payment instance to the database
    await payment.save();

    // Respond with the payment initialization details
    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      authorizationUrl: authorization_url,
      reference: reference,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);

    // Improved error response handling
    const errorMessage =
      error.response && error.response.data
        ? error.response.data.message
        : error.message;
    res.status(500).json({
      success: false,
      message: errorMessage || "An unexpected error occurred",
    });
  }
});

// Verify payment
router.post("/verifyPayment", async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await paystackApi.get(`/transaction/verify/${reference}`);
    const { data } = response.data;
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    payment.status = data.status;
    payment.paidAt = data.paidAt;
    payment.gatewayResponse = data.gateway_response;
    payment.currency = data.currency;
    payment.customer.id = data.customer.id;
    await payment.save();

    if (payment.status === "success") {
      res.json({
        success: true,
        message: "Payment verified successfully",
        data: payment,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred",
    });
  }
});

module.exports = router;
