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
    examId,
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

  // Check if exam already exists
  const questionExists = await Question.exists({
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
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
    createdBy: req.user.id,
  });

  // Save new question
  const questionCreated = await newQuestion.save();


  exam.questions.push(newQuestion._id);
  await exam.save();

  res.status(200).json({
    success: true,
    message: "Question created successfully",
    data: questionCreated,
  });
});

// READ Question
const getQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;

  const question = await Exam.findById(questionId); // Assuming you want to populate teacher details

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// UPDATE Question
const updateQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const updateData = req.body;
  const updatedQuestion = await Exam.findByIdAndUpdate(questionId, updateData, {
    new: true,
  });

  if (!updatedQuestion) {
    res.status(404).json({
      success: false,
      message: "Question not found",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  }
});

// DELETE Question
const deleteQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const deletedQuestion = await Exam.findByIdAndDelete(questionId);
  if (!deletedQuestion) {
    res.status(404).json({
      success: false,
      message: "Question not found",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  }
});

// READ All Questions
const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Exam.find();

  res.status(200).json({
    success: true,
    data: questions,
  });
});

export { createQuestion, getQuestion, updateQuestion, deleteQuestion, getAllQuestions };
