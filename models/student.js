import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
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
  admissionId: {
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: String,
  },
});

studentSchema.methods.fullName = function () {
  return `${this.surname} ${this.othername}`;
};

const Student = mongoose.model("Student", studentSchema);

export default Student;

// const mongoose = require("mongoose");
// const studentSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     studentId: {
//       type: String,
//       required: true,
//       default: function () {
//         return (
//           "STU" +
//           Math.floor(100 + Math.random() * 900) +
//           Date.now().toString().slice(2, 4) +
//           this.name
//             .split(" ")
//             .map(name => name[0])
//             .join("")
//             .toUpperCase()
//         );
//       },
//     },
//     role: {
//       type: String,
//       default: "student",
//     },
//     //Classes are from level 1 to 6
//     //keep track of the class level the student is in
//     classLevels: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "ClassLevel",
//       },
//     ],
//     currentClassLevel: {
//       type: String,
//       default: function () {
//         return this.classLevels[this.classLevels.length - 1];
//       },
//     },
//     academicYear: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AcademicYear",
//     },
//     dateAdmitted: {
//       type: Date,
//       default: Date.now,
//     },

//     examResults: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "ExamResult",
//       },
//     ],

//     program: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Program",
//     },

//     isPromotedToLevel200: {
//       type: Boolean,
//       default: false,
//     },
//     isPromotedToLevel300: {
//       type: Boolean,
//       default: false,
//     },
//     isPromotedToLevel400: {
//       type: Boolean,
//       default: false,
//     },
//     isGraduated: {
//       type: Boolean,
//       default: false,
//     },
//     isWithdrawn: {
//       type: Boolean,
//       default: false,
//     },
//     isSuspended: {
//       type: Boolean,
//       default: false,
//     },
//     prefectName: {
//       type: String,
//     },
//     // behaviorReport: [
//     //   {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "BehaviorReport",
//     //   },
//     // ],
//     // financialReport: [
//     //   {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: "FinancialReport",
//     //   },
//     // ],
//     //year group
//     yearGraduated: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// //model
// const Student = mongoose.model("Student", studentSchema);

// module.exports = Student;
