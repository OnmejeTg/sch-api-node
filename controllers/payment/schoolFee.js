import SchoolFeeInvoice from "../../models/schoolFeeeInvoice.js";
import generateRandomString from "../../utils/randomCharacterGen.js";
import Student from "../../models/student.js";
import {
  initializePayment,
  verifyTransaction,
} from "../../services/paystack.js";

import dotenv from "dotenv";
import AcademicTerm from "../../models/academicTerm.js";
import AcademicYear from "../../models/academicYear.js";
import { paymentDataValidationRules } from "../../validators/paymentValidators.js";

dotenv.config();

// Make Payment
const makeSchoolFeePayment = [
  async (req, res) => {
    try {
      const currentSession = await AcademicYear.findOne({
        isCurrent: true,
      }).sort({
        updatedAt: -1,
      });
      const currentTerm = await AcademicTerm.findOne({ isCurrent: true }).sort({
        updatedAt: -1,
      });

      let { user, email, amount } = req.body;

      if (!email) {
        //TODO: supply the school support email here instead
        email = "email@example.com";
      }

      paymentDataValidationRules;

      // Check if invoice already exists
      //TODO: this is not efficient, also check payment type
      const existingInvoice = await SchoolFeeInvoice.findOne({
        user,
        email,
        academicTerm: currentTerm,
        academicTerm: currentTerm,
      });
      if (
        existingInvoice &&
        !["failed", "abandoned"].includes(existingInvoice.paymentStatus)
      ) {
        return res.status(200).json({
          verify: `/api/v2/payment/verify?reference=${existingInvoice.paystackReference}&email=${existingInvoice.email}&user=${existingInvoice.user}`,
        });
      }

      // Initialize new payment request
      const paystackResponse = await initializePayment(email, amount, user);
      // console.log(paystackResponse)
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
        paystackReference: paystackJson.data.reference,
        academicTerm: currentTerm,
        academicYear: currentSession,
      });
      await newInvoice.save();

      res.status(201).send({ checkout_url: authorizationUrl });
    } catch (error) {
      console.error("Something went wrong:", error);
      res.status(500).send("Server error");
    }
  },
];

// Verify Payment
const verifyPayment = async (req, res) => {
  const { reference, user, email } = req.query;

  try {
    const currentSession = await AcademicYear.findOne({ isCurrent: true }).sort(
      {
        updatedAt: -1,
      }
    );
    const currentTerm = await AcademicTerm.findOne({ isCurrent: true }).sort({
      updatedAt: -1,
    });

    // console.log(currentTerm.name, currentTerm.name);

    const paymentData = await verifyTransaction(reference);
    // console.log(paymentData);
    if (paymentData.data.status !== "success") {
      console.log("Transaction failed:", paymentData.data.status);
      let invoice = await SchoolFeeInvoice.findOne({
        paystackReference: reference,
      });
      if (invoice) {
        invoice.paymentStatus = "failed";
        // console.log("Invoice", invoice);
        await invoice.save();
      }
      return res.status(400).send("Verification failed");
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
        academicYear: currentSession,
        academicTerm: currentTerm,
      });
      await invoice.save();
    }

    // res.redirect('https://new-project-3552/0.web.app/student/fee/invoice')
    res.render("success.ejs")

    // res.status(200).send({
    //   status: true,
    //   message: "Payment verification successful",
    //   data: invoice,
    // });
    try {
      const studentObject = await Student.findOne({ _id: user });
      studentObject.paymentStatus = paymentData.data.status;
      // studentObject.currentPayment = `${currentSession} ${currentTerm} term`;
      studentObject.currentPayment = currentTerm._id;
      // console.log(studentObject);
      studentObject.save();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Form for sending payments data
const testPayment = (req, res) => {
  res.render("index.ejs");
};

// Get all invoices
const allSchoolFeeinvoices = async (req, res) => {
  try {
    const invoices = await SchoolFeeInvoice.find().populate([
      "user",
      "academicYear",
      "academicTerm",
    ]);
    return res.status(200).json({
      success: "Success",
      data: invoices,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get payment for a student
const invoiceByLoggedInStudent = async (req, res) => {
  try {
    const student = await Student.find({ authUser: req.user.id });
    const invoices = await SchoolFeeInvoice.find({ user: student }).populate([
      "user",
      "academicYear",
      "academicTerm",
    ]);

    const responseData =
      invoices.length > 0
        ? { success: true, data: invoices }
        : { success: false, message: "No invoices found" };
    return res.status(invoices.length > 0 ? 200 : 204).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single invoice
const invoiceById = async (req, res) => {
  try {
    const invoices = await SchoolFeeInvoice.findById(req.params.id);

    const responseData =
      invoices.length > 0
        ? { success: true, data: invoices }
        : { success: false, message: "No invoices found" };
    return res.status(invoices.length > 0 ? 200 : 204).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an invoice by ID
const deleteInvoice = async (req, res) => {
  const { id } = req.params; // Extract invoice ID from request parameters

  try {
    const deletedInvoice = await SchoolFeeInvoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(204).json({
      message: "Invoice deleted successfully",
      deletedInvoice,
    });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  makeSchoolFeePayment,
  verifyPayment,
  testPayment,
  allSchoolFeeinvoices,
  invoiceByLoggedInStudent,
  invoiceById,
  deleteInvoice,
};
