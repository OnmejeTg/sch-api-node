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
  },
  { timestamp: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
