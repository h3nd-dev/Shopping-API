// models/Payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "NGN",
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
  },
  gatewayResponse: {
    type: String,
  },
  customer: {

    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
  },
  metadata: {
    type: Object,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
