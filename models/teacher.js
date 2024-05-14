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
    email: {
      type: String,
      required: true,
    },
    dateEmployed: {
      type: Date,
      default: Date.now,
    },
    teacherId: {
      type: String,
      required: true,
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

export default Teacher
