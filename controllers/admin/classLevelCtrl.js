import asyncHandler from "express-async-handler";
import ClassLevel from "../../models/classModel.js"; // Assuming the path to your model
import Student from "../../models/student.js";
import mongoose from "mongoose";
import Subject from "../../models/subject.js";

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

    if (!students || students.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No students found for the given class level",
      });
    }

    res.status(200).json({
      status: "success",
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// const addStudentToClass = asyncHandler(async (req, res) => {
//   try {
//     const classLevelId = req.params.id;

//     // Validate classLevelId (optional but recommended)
//     if (!mongoose.Types.ObjectId.isValid(classLevelId)) {
//       return res.status(400).json({ message: "Invalid class level ID" });
//     }

//     // Efficiently fetch students and class level in a single query
//     const [students, classLevel] = await Promise.all([
//       Student.find({ currentClassLevel: classLevelId }), // Filter students by class level
//       ClassLevel.findById(classLevelId),
//     ]);

//     if (!classLevel) {
//       return res.status(404).json({ message: "Class level not found" });
//     }

//     // Efficient bulk update using updateMany with upsert option
//     const studentIds = students.map((student) => student._id);
//     // console.log(studentIds);
//     let update = {};
//     if (students.length === 0) {
//       update = {
//         $set: { students: [] },
//         $set: { numOfStudents: 0 },
//       };
//     }
//     update = {
//       $set: { students: { $each: studentIds } },
//       $set: { numOfStudents: studentIds.length },
//     };

//     console.log(update);

//     const updatedClassLevel = await ClassLevel.findByIdAndUpdate(
//       classLevelId,
//       update,
//       { new: true, runValidators: true }
//     );

//     res
//       .status(200)
//       .json({ message: "Students added successfully", updatedClassLevel });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

const addStudentToClass = asyncHandler(async (req, res) => {
  try {
    const classLevelId = req.params.id;

    // Validate classLevelId
    if (!mongoose.Types.ObjectId.isValid(classLevelId)) {
      return res.status(400).json({ message: "Invalid class level ID" });
    }

    // Fetch students and class level concurrently
    const [students, classLevel] = await Promise.all([
      Student.find({ currentClassLevel: classLevelId }).select("_id"),
      ClassLevel.findById(classLevelId),
    ]);

    if (!classLevel) {
      return res.status(404).json({ message: "Class level not found" });
    }

    // Prepare the update object
    const studentIds = students.map((student) => student._id);
    const update = {
      students: studentIds, // Overwrite students array with new array
      numOfStudents: studentIds.length, // Update the count
    };

    // Update the class level
    const updatedClassLevel = await ClassLevel.findByIdAndUpdate(
      classLevelId,
      { $set: update },
      { new: true, runValidators: true }
    );

    // Respond with success
    res.status(200).json({
      message: "Students added successfully",
      updatedClassLevel,
      count: updatedClassLevel.students.length, // Number of students in the class level now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const studentIDs = [];

const assignClass = asyncHandler(async (req, res) => {
  if (!Array.isArray(studentIDs)) {
    return res.status(400).json({ message: "Invalid studentID format" });
  }

  try {
    const updatePromises = studentIDs.map((item) => {
      return Student.findOneAndUpdate(
        { studentId: item },
        { currentClassLevel: req.params.id },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Students assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const assignSubject = async (req, res) => {
  const classId = req.params.id;

  const classLevel = await ClassLevel.findById(classId);
  if (!classLevel) {
    return res.status(404).json({ message: "Class level not found" });
  }
  const { subjectId } = req.body;
  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required" });
  }
  // const subject = await Subject.findById(subjectId);
  // if (!subject) {
  //   return res.status(404).json({ message: "Subject not found" });
  // }

  // if (classLevel.subjects.includes(subjectId)) {
  //   return res.status(400).json({ message: "Subject already assigned" });
  // }
  const subjects = [];
  for (let i = 0; i < subjects.length; i++) {
    classLevel.subjects.push(subjects[i]);
  }
  await classLevel.save();
  return res.status(200).json({ message: "Subject assigned successfully" });
  classLevel.subjects.push(subjectId);
  await classLevel.save();
  res.status(200).json({ message: "Subject assigned successfully" });
};

const code = [];
const getStudentClass = asyncHandler(async (req, res) => {
  const classLevel = await Promise.all(
    codes.map(async (id) => {
      const student = await Student.findOne({ studentId: id }).populate([
        "currentClassLevel",
      ]);
      if (
        student &&
        student.currentClassLevel &&
        student.currentClassLevel.name
      ) {
        return {
          studentId: id,
          className: student.currentClassLevel.name,
        };
      }
      return null; // To filter out later
    })
  );

  return res.json(classLevel.filter((entry) => entry !== null));
});

export {
  createClassLevel,
  getClassLevels,
  updateClassLevel,
  deleteClassLevel,
  getClassLevelById,
  getStudentsByClassLevel,
  addStudentToClass,
  assignClass,
  getStudentClass,
  assignSubject,
};
