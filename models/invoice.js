import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    amountInWords: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
  },
  { timestamps: true }
);

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;
