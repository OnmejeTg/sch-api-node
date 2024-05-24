import mongoose from "mongoose";

const inquiriesSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
    },
    body: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquiriesSchema);

export default Inquiry;
