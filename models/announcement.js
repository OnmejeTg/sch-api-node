import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      enum: ["all", "students", "teachers", "parents"],
      default: "all",
      required: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
