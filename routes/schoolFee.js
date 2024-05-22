import express from "express";
import {
  makeSchoolFeePayment,
  testPayment,
  verifyPayment,
} from "../controllers/payment/schoolFee.js";

const schoolFeeRouter = express.Router();

schoolFeeRouter.post("/", makeSchoolFeePayment);
schoolFeeRouter.get("/verify", verifyPayment);
schoolFeeRouter.get("/test", testPayment);

export default schoolFeeRouter;
