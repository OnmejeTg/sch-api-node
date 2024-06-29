import mongoose from "mongoose";

const { Schema, model } = mongoose; // Use destructuring for cleaner syntax

const ClassLevelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Enforce unique class level names to avoid duplicates
  },
  description: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  formTeacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  numOfStudents: { // Use a more descriptive name (singular form)
    type: Number,
    default: 0, // Set default to 0 to avoid potential errors
  },
  subjects: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  teachers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
}, { timestamps: true });

// Calculate numOfStudents using a virtual field for efficiency
// ClassLevelSchema.virtual("calculatedNumStudents", { // Renamed to calculatedNumStudents
//   get() {
//     return this.students.length;
//   },
// });


// Alternatively, use a pre-save hook to ensure numOfStudents is always updated
ClassLevelSchema.pre("save", async function (next) {
  this.numOfStudents = this.students.length;
  next();
});

const ClassLevel = model("ClassLevel", ClassLevelSchema);

export default ClassLevel;
