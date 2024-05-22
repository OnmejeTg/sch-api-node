import express from "express";
import SchoolFeeInvoice from "../../models/schoolFeeeInvoice.js";
import generateRandomString from "../../utils/randomCharacterGen.js";
import Student from "../../models/student.js";
import {
  initializePayment,
  verifyTransaction,
} from "../../services/paystack.js";

const schoolFeeRouter = express.Router();

// Make Payment
const makeSchoolFeePayment =  async (req, res) => {
  try {
    let { user, email, amount } = req.body;
    if (!user || !email || !amount) {
      return res.status(400).json({ message: "fill all fields" });
    }

    // Check if invoice already exists
    const existingInvoice = await SchoolFeeInvoice.findOne({ user, email });
    if (
      existingInvoice &&
      !["failed", "abandoned"].includes(existingInvoice.paymentStatus)
    ) {
      return res.redirect(
        `/api/v2/payment/verify?reference=${existingInvoice.paystackReference}&email=${existingInvoice.email}&user=${existingInvoice.user}`
      );
    }

    // Initialize new payment request
    const paystackResponse = await initializePayment(email, amount, user);
    if (!paystackResponse.ok) {
      throw new Error("Failed to initialize transaction with Paystack");
    }

    const paystackJson = await paystackResponse.json();
    const { authorization_url: authorizationUrl } = paystackJson.data;
    const paymentReference = generateRandomString(10);
    amount = amount / 100;
    // Create new invoice
    const newInvoice = new SchoolFeeInvoice({
      user,
      email,
      amount,
      paymentReference,
      url: authorizationUrl,
      paystackReference: paystackJson.data.reference, // Assuming reference is needed
    });
    await newInvoice.save();

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Something went wrong:", error);
    res.status(500).send("Server error");
  }
};

// Verify Payment
const verifyPayment =  async (req, res) => {
  const { reference, user, email } = req.query;

  try {
    const paymentData = await verifyTransaction(reference);
    console.log(paymentData);
    if (paymentData.data.status !== "success") {
      console.log("Transaction failed:", paymentData.data.status);
      return res.status(400).send("Transaction failed");
    }

    const paymentReference = generateRandomString(10);

    // Check for an existing invoice
    let invoice = await SchoolFeeInvoice.findOne({ user, email });

    if (invoice) {
      // Update existing invoice
      invoice.paymentStatus = paymentData.data.status;
      invoice.paystackReference = reference;
      invoice.amount = paymentData.data.amount;
      invoice.url = paymentData.data.authorization_url;
      await invoice.save();
    } else {
      // Create a new invoice if not found
      invoice = new SchoolFeeInvoice({
        user,
        email,
        paymentReference,
        amount: paymentData.data.amount,
        url: paymentData.data.authorization_url,
        paymentStatus: paymentData.data.status,
        paystackReference: reference,
      });
      await invoice.save();
    }

    res.status(200).send({
      status: true,
      message: "Payment successful",
      data: invoice,
    });
    // try {
    //   const userObject = await User.findOne({ _id: user });
    //   userObject.paymentStatus = paymentData.data.status;
    //   console.log(userObject);
    //   userObject.save();
    // } catch (error) {
    //   console.log(error);
    // }
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Form for sending payments data
const testPayment =  (req, res) => {
  res.render("index.ejs");
}

// // Get all invoices
// schoolFeeRouter.get("/invoice", [auth, isSpecialUSer], async (req, res) => {
//   try {
//     const invoices = await Invoice.find().populate("user");
//     return res.status(200).json({
//       success: true,
//       data: invoices,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// schoolFeeRouter.get("/invoice/user", [auth], async (req, res) => {
//   try {
//     const invoices = await Invoice.find({ user: req.user.id });
//     const responseData =
//       invoices.length > 0
//         ? { success: true, data: invoices }
//         : { success: false, message: "No invoices found" };
//     return res.status(invoices.length > 0 ? 200 : 204).json(responseData);
//   } catch (err) {
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Get single invoice
// schoolFeeRouter.get("/invoice/:id", [auth], async (req, res) => {
//   try {
//     const invoices = await Invoice.find({ user: req.params.id });

//     const responseData =
//       invoices.length > 0
//         ? { success: true, data: invoices }
//         : { success: false, message: "No invoices found" };
//     return res.status(invoices.length > 0 ? 200 : 204).json(responseData);
//   } catch (err) {
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Delete an invoice by ID
// schoolFeeRouter.delete(
//   "/invoice/:id",
//   [auth, isSpecialUSer],
//   async (req, res) => {
//     const { id } = req.params; // Extract invoice ID from request parameters

//     try {
//       const deletedInvoice = await Invoice.findByIdAndDelete(id);

//       if (!deletedInvoice) {
//         return res.status(404).json({ error: "Invoice not found" });
//       }

//       res.json({ message: "Invoice deleted successfully", deletedInvoice });
//     } catch (err) {
//       console.error("Error deleting invoice:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

export {
    makeSchoolFeePayment,
    verifyPayment,
    testPayment

} ;
