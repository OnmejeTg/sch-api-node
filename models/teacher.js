import mongoose from "mongoose";
const teacherSchema = new mongoose.Schema(
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
    signature: {
      type: String
    },
    qualification: {
      type: String
    },
    email: {
      type: String,
      // required: true,
    },
    dateEmployed: {
      type: Date,
      default: Date.now,
    },

    staffId: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      // required: true,
    },
    designation: {
      type: String,
      default: "teacher",
      enum: ["principal", "teacher", "accountant", "librarian", "admin"],
    },
    appointmentType: {
      type: String,
      default: "contractual",
      enum: ["permanent", "contractual", "temporal"],
    },
    classInSchool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassLevel",
    },
    //if witdrawn, the teacher will not be able to login
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    //if suspended, the teacher can login but cannot perform any task
    isSuspended: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      // required: true,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    program: {
      type: String,
    },
    //A teacher can teach in more than one class level
    classLevel: {
      type: String,
    },
    academicYear: {
      type: String,
    },
    examsCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      // required: true,
    },
    academicTerm: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

teacherSchema.methods.fullName = function () {
  return `${this.surname} ${this.othername}`;
};

//model
const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
