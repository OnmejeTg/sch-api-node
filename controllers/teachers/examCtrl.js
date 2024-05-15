import Exam from "../../models/exam.js";
import Teacher from "../../models/teacher.js";
import asyncHandler from "express-async-handler";

const createExam = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    subject,
    academicTerm,
    program,
    examDate,
    examTime,
    classLevel,
    academicYear,
  } = req.body;

  // Get teacher id
  const teacher = await Teacher.findById(req.user.id);

  // Check if exam already exists
  const examExists = await Exam.exists({
    name,
    subject,
    academicTerm,
    academicYear,
    program,
    classLevel,
    examDate,
    examTime,
  });

  if (examExists) {
    throw new Error("Exam already exists");
  }

  // Create new exam
  const newExam = new Exam({
    name,
    description,
    subject,
    teacher: teacher._id,
    academicTerm,
    academicYear,
    program,
    classLevel,
    examDate,
    examTime,
    createdBy: teacher._id, // Assuming req.user.id is available
  });

  // Save new exam
  const exam = await newExam.save();

  // Update teacher's examsCreated
  teacher.examsCreated.push(newExam._id);
  await teacher.save();

  res.status(200).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

// READ Exam
const getExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;

  const exam = await Exam.findById(examId); // Assuming you want to populate teacher details

  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  res.status(200).json({
    success: true,
    data: exam,
  });
});

// UPDATE Exam
const updateExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const updateData = req.body;
  const updatedExam = await Exam.findByIdAndUpdate(examId, updateData, {
    new: true,
  });

  if (!updatedExam) {
    res.status(404).json({
      success: false,
      message: "Exam not found",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      data: updatedExam,
    });
  }
});

// DELETE Exam
const deleteExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const deletedExam = await Exam.findByIdAndDelete(examId);
  if (!deletedExam) {
    res.status(404).json({
      success: false,
      message: "Exam not found",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  }
});

// READ All Exams
const getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find(); // Assuming you want to populate teacher details

  res.status(200).json({
    success: true,
    data: exams,
  });
});

export { createExam, getExam, updateExam, deleteExam, getAllExams };
