import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

async function initializePayment(email, amount, user) {
  const paystackData = {
    email,
    amount: amount * 100, // Convert to kobo
    currency: "NGN",
    // callback_url: `http://localhost:${port}/api/v2/payment/verify?user=${user}&email=${email}&amount=${amount}`,
    callback_url: `https://dannon.onrender.com/api/v1/payment/verify?user=${user}&email=${email}&amount=${amount}`,
    metadata: { user, email, amount: amount * 100 },
    label: "EDUCATION",
  };

  const headers = {
    Authorization: `Bearer ${process.env.paystackSecretKey}`,
    "Content-Type": "application/json",
  };

  return await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers,
    body: JSON.stringify(paystackData),
  });
}

async function verifyTransaction(reference) {
  const url = `https://api.paystack.co/transaction/verify/${reference}`;
  const headers = {
    Authorization: `Bearer ${process.env.paystackSecretKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { method: "GET", headers });
  // console.log(response)
  if (!response.ok) {
    throw new Error("Failed to verify transaction with Paystack");
  }

  return await response.json();
}

export { verifyTransaction, initializePayment };
