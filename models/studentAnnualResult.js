import mongoose from "mongoose";

const { Schema } = mongoose;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  firstTerm: {
    type: Number,
    default: 0,
  },
  secondTerm: {
    type: Number,
    default: 0,
  },
  thirdTerm: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  average: {
    type: Number,
    default: 0,
  },
  highest: {
    type: Number,
    default: 0,
  },
  lowest: {
    type: Number,
    default: 0,
  },
  position: {
    type: Number,
    default: 0,
  },
  grade: {
    type: String,
    default: "F",
  },
});

// Calculate total and grade before saving
subjectSchema.pre("save", function (next) {
  this.total =
    this.firstTerm + this.secondTerm + this.thirdTerm;

  if (this.total >= 90) {
    this.grade = "A";
  } else if (this.total >= 80) {
    this.grade = "B";
  } else if (this.total >= 70) {
    this.grade = "C";
  } else if (this.total >= 60) {
    this.grade = "D";
  } else {
    this.grade = "F";
  }
  next();
});


const affirmativeSkillsSchema = new Schema({
  punctuality:{
    type:String,
    default:'F'
  },
  politeness:{
    type:String,
     default:'F'
  },
  neatness:{
    type:String,
     default:'F'
  },
  honesty:{
    type:String,
     default:'F'
  },
  leadership_skill:{
    type:String,
     default:'F'
  },
  cooperation:{
    type:String,
     default:'F'
  },
  attentiveness:{
    type:String,
     default:'F'
  },
  perseverance:{
    type:String,
     default:'F'
  },
  attitude_to_work:{
    type:String,
     default:'F'
  },
})

const psychomotorSkillsSchema = new Schema({
  handwriting:{
    type:String,
    default:'F'
  },
  verbal_fluency:{
    type:String,
     default:'F'
  },
  sports:{
    type:String,
     default:'F'
  },
  handling_tools:{
    type:String,
     default:'F'
  },
  drawing:{
    type:String,
     default:'F'
  },
})

const studentAnnualResultSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjects: [subjectSchema],
    average: {
      type: Number,
      default: 0,
    },
    affirmativeSkills:[affirmativeSkillsSchema],
    psychomotorSkills:[psychomotorSkillsSchema],
    grandScore: {
      type: Number,
      default: 0,
    },
    passMark: {
      type: Number,
      required: true,
      default: 50,
    },
    status: {
      type: String,
      required: true,
      enum: ["failed", "passed"],
      default: "failed",
    },
    remarks: {
      type: String,
      required: true,
      enum: ["Excellent", "Good", "Poor"],
      default: "Poor",
    },
    position: {
      type: Number,
      default: 0,
    },
    classAverage: {
      type: Number,
      default: 0,
    },
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"ClassLevel",
    },
    academicTerm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicTerm",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate grand score, average, status, and remarks before saving
studentAnnualResultSchema.pre("save", function (next) {
  if (this.subjects && this.subjects.length > 0) {
    this.grandScore = this.subjects.reduce(
      (acc, subject) => acc + subject.total,
      0
    );
    this.average = this.grandScore / this.subjects.length;

    if (this.average >= this.passMark) {
      this.status = "passed";
      if (this.average >= 90) {
        this.remarks = "Excellent";
      } else if (this.average >= 75) {
        this.remarks = "Good";
      } else {
        this.remarks = "Poor";
      }
    } else {
      this.status = "failed";
      this.remarks = "Poor";
    }
  }
  next();
});

const studentAnnualResult = mongoose.model("studentAnnualResult", studentAnnualResultSchema);

export default studentAnnualResult;
