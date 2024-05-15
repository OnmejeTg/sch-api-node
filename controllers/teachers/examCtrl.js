import Exam from "../../models/exam.js";
import Teacher from "../../models/teacher.js";
import asyncHandler from "express-async-handler";

const createExam = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    subjectId,
    academicTermId,
    programID,
    examDate,
    examTime,
    classLevel,
    academicYearID,
  } = req.body;

  //Get teacher id
  const teacherFound = await Teacher.findById(req.user.id);

  //check if exsma is already exists
  const examExists = await Exam.findOne({
    name,
    subject: subjectId,
    academicTerm: academicTermId,
    academicYear: academicYearID,
    program: programID,
    classLevel: classLevel,
    examDate,
    examTime,
  });
  if (examExists) {
    res.status(400);
    throw new Error("Exam already exists");
  }

  const newExam = new Exam({
    name,
    description,
    subject: subjectId,
    teacher: teacherFound._id,
    academicTerm: academicTermId,
  });
  teacherFound.examsCreated.push(newExam);
  await teacherFound.save();
  const exam = await newExam.save();
  res.status(200).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

export { createExam };
