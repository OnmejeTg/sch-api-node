import express from "express";
import {
  allSchoolFeeinvoices,
  deleteInvoice,
  invoiceById,
  invoiceByLoggedInStudent,
  makeSchoolFeePayment,
  testPayment,
  verifyPayment,
} from "../controllers/payment/schoolFee.js";
import { isAdmin, isLoggedin, isStudent } from "../middleware/auth.js";
import { paymentDataValidationRules } from "../validators/paymentValidators.js";

const schoolFeeRouter = express.Router();

schoolFeeRouter.post("/", paymentDataValidationRules, makeSchoolFeePayment);
schoolFeeRouter.get("/verify", verifyPayment);
schoolFeeRouter.get("/test", testPayment);
schoolFeeRouter.get("/all-invoices",isLoggedin, isAdmin, allSchoolFeeinvoices);
schoolFeeRouter.get("/student-invoice", isLoggedin, isStudent, invoiceByLoggedInStudent);
schoolFeeRouter.get("/admin-invoice/:id", isLoggedin, isAdmin, invoiceById);
schoolFeeRouter.delete("/delete-invoice/:id", isLoggedin, isAdmin, deleteInvoice);

export default schoolFeeRouter;
