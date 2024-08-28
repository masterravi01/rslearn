import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

let instance = new Razorpay({
  key_id: process.env.Razor_key_id,
  key_secret: process.env.Razor_key_secret,
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  var amount = req.body.price * 100;
  var options = {
    amount: amount, // amount in the smallest currency unit here paise
    currency: "INR",
    receipt: "order_rcptid_11",
    notes: {
      key1: "value3",
      key2: "value2",
    },
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      res.status(500);
      let response = { status: 500, data: err };
      res.send(response);
    } else if (order) {
      res.status(200);
      let response = { status: 200, data: order };
      res.send(response);
    }
  });
});

const validatePayment = asyncHandler(async (req, res) => {
  const razorpay_signature = req.body.razorpay_signature;
  const secret = instance.key_secret;
  const order_id = req.body.original_order_id;
  const razorpay_payment_id = req.body.razorpay_payment_id;

  const isPaymentVerfied = validatePaymentVerification(
    { order_id: order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    secret
  );
  isPaymentVerfied ? res.status(200) : res.status(500);
  res.send({ data: { isPaymentVerfied: isPaymentVerfied } });
});

export { createPaymentOrder, validatePayment };
