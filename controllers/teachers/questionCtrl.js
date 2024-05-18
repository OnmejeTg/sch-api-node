import Exam from "../../models/exam.js";
import Question from "../../models/question.js";
import Teacher from "../../models/teacher.js";
import asyncHandler from "express-async-handler";



// Teacher create question. logged in user can create question with this method
const createQuestion = asyncHandler(async (req, res) => {
  const {
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    isCorrect,
    mark,
    examId
  } = req.body;

  // Get teacher
  const teacher = await Teacher.findById(req.user.id);

  // Get exam for this question
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: "Exam not found",
    });
  }
  console.log(req.user.id)

  // Check if exam already exists
  const questionExists = await Question.exists({
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer
  });

  if (questionExists) {
    throw new Error("Question already exists");
  }

  // Create new exam
  const newQuestion = new Question({
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    isCorrect,
    mark,
    createdBy:req.user.id
  });

  // Save new question
  const questionCreated = await newQuestion.save();

  // Update teacher's examsCreated
  exam.questions.push(newQuestion._id);
  await exam.save();

  res.status(200).json({
    success: true,
    message: "Question created successfully",
    data: questionCreated,
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

export { createQuestion, getExam, updateExam, deleteExam, getAllExams };
