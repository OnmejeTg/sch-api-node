import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
  surname: {
    type: String,
    required: true,
  },
  othernames: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admissionId: {
    type: String,
    required: true,
    default: function () {
      return (
        "STU" +
        Math.floor(100 + Math.random() * 900) +
        Date.now().toString().slice(2, 4) +
        this.surname
          .split(" ")
          .map((name) => name[0])
          .join("")
          .toUpperCase()
      );
    },
  },
  role: {
    type: String,
    default: "student",
  },
  classLevels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassLevel",
    },
  ],
  currentClassLevel: {
    type: String,
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
    type:String,
    required: true
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
  parentOthernames: {
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
    required: true,
  },

  healthStatus: {
    type: String,
    default: "Healthy",
  },
  religion: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: String
  }
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

studentSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.fullName =  function (){
  return `${this.surname} ${this.othernames}`
}

const Student = mongoose.model("Student", studentSchema);

export default Student;
