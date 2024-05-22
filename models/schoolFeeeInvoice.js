import mongoose from "mongoose";


const schoolFeeInvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  paymentReference: {
    type: String,
    required: true,
  },
  generatedDate: {
    type: Date,
    default: Date.now(),
  },
  paymentStatus: {
    type: String,
    default: "initiated",
    minlength: 2,
    maxlength: 50,
  },
  amount: {
    type: Number,
    default: 0,
    minlength: 2,
    maxlength: 50,
  },

  url: {
    type: String,
    minlength: 2,
    maxlength: 255,
  },
  paystackReference: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
});

const SchoolFeeInvoice = mongoose.model("SchoolFeeInvoice", schoolFeeInvoiceSchema);


export default SchoolFeeInvoice;