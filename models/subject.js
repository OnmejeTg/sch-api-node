import mongoose from "mongoose";

const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
    academicTerm: {
      type: Schema.Types.ObjectId,
      ref: "AcademicTerm",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    duration: {
      type: String,
      default: "3 months",
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject

