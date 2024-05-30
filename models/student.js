import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    authUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    othername: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/tgod/image/upload/v1716561104/test/swpzzvle2je29zkbyldz.png",
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    classLevels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClassLevel",
      },
    ],
    currentClassLevel: {
      type: mongoose.Schema.Types.ObjectId,
        ref: "ClassLevel",
      default: function () {
        return this.classLevels[this.classLevels.length - 1];
      },
    },
    isGraduated: {
      type: Boolean,
      default: false,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    sex: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    dateOfAdmission: {
      type: Date,
      default: Date.now(),
    },
    entrySession: {
      type: String,
      required: true,
    },
    examResults: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamResult",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    parentSurname: {
      type: String,
      required: true,
    },
    parentOthername: {
      type: String,
      required: true,
    },
    parentOccupation: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true, // Ensures email is stored in lowercase
      match: /^\S+@\S+\.\S+$/,
      minLength: 3,
      unique: true,
    },

    healthStatus: {
      type: String,
      default: "Healthy",
    },
    religion: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Not Paid",
    },
    currentPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicTerm",
    },
  },
  { timestamp: true }
);

studentSchema.methods.fullName = function () {
  return `${this.surname} ${this.othername}`;
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
