import asyncHandler from "express-async-handler";
import ClassLevel from "../../models/classModel.js"; // Assuming the path to your model
import Student from "../../models/student.js";
import mongoose from "mongoose";

// Create a new Class Level
const createClassLevel = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if class level already exists
  const existingClassLevel = await ClassLevel.findOne({ name });
  if (existingClassLevel) {
    res.status(400);
    throw new Error("Class level already exists");
  }

  // Create new class level
  const newClassLevel = new ClassLevel({
    name,
    description,
    createdBy: req.user.id, // Assuming req.user.id is available
  });
  await newClassLevel.save();

  res.status(201).json({
    status: "success",
    message: "Class level created successfully",
    data: newClassLevel,
  });
});

// Get all Class Levels
const getClassLevels = asyncHandler(async (req, res) => {
  const classLevels = await ClassLevel.find();
  //   const classLevels = await ClassLevel.find().populate(
  //     "students subjects teachers"
  //   );
  res.status(200).json({
    status: "success",
    data: classLevels,
  });
});

// Update a Class Level
const updateClassLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, students, subjects, teachers } = req.body;

  let classLevel = await ClassLevel.findById(id);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  classLevel.name = name || classLevel.name;
  classLevel.description = description || classLevel.description;
  classLevel.students = students || classLevel.students;
  classLevel.subjects = subjects || classLevel.subjects;
  classLevel.teachers = teachers || classLevel.teachers;

  await classLevel.save();

  res.status(200).json({
    status: "success",
    message: "Class level updated successfully",
    data: classLevel,
  });
});

// Delete a Class Level
const deleteClassLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classLevel = await ClassLevel.findByIdAndDelete(id);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  res.status(200).json({
    status: "success",
    message: "Class level deleted successfully",
    data: classLevel,
  });
});

// Get a single Class Level by ID
const getClassLevelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  //   const classLevel = await ClassLevel.findById(id).populate(
  //     "students subjects teachers"
  //   );
  const classLevel = await ClassLevel.findById(id);
  console.log(classLevel.numOfStudents);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  res.status(200).json({
    status: "success",
    data: classLevel,
  });
});

const getStudentsByClassLevel = asyncHandler(async (req, res) => {
  try {
    const classLevel = req.params.id;
    const students = await Student.find({ currentClassLevel: classLevel });
    console.log('student found:', students.length);

    if (!students || students.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No students found for the given class level",
      });
    }

    res.status(200).json({
      status: "success",
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

const addStudentToClass = asyncHandler(async (req, res) => {
  try {
    const  classLevelId  = req.params.id;
   
    // Validate classLevelId (optional but recommended)
    const isValidId = mongoose.Types.ObjectId.isValid(classLevelId);
    if (!isValidId) {
      return res.status(400).json({ message: 'Invalid class level ID' });
    }

    // Efficiently fetch students and class level in a single query
    const [students, classLevel] = await Promise.all([
      Student.find({ currentClassLevel: classLevelId }), // Filter students by class level
      ClassLevel.findById(classLevelId)
    ]);

    if (!classLevel) {
      return res.status(404).json({ message: 'Class level not found' });
    }

    // Efficient bulk update using updateMany with upsert option
    const updatedClassLevel = await ClassLevel.updateMany(
      { _id: classLevelId },
      { $addToSet: { students: { $each: students.map(student => student._id) } } },
      { new: true, runValidators: true } // Return updated document and enforce validation
    );

    res.status(200).json({ message: 'Students added successfully', updatedClassLevel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export {
  createClassLevel,
  getClassLevels,
  updateClassLevel,
  deleteClassLevel,
  getClassLevelById,
  getStudentsByClassLevel,
  addStudentToClass
};
