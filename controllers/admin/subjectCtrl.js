import asyncHandler from "express-async-handler";
import Subject from "../../models/subject.js"; // Assuming the path to your model

// Create a new Subject
const createSubject = asyncHandler(async (req, res) => {
  const { name, description, academicTermId } = req.body;

  // Create new subject
  const newSubject = new Subject({
    name,
    description,
    academicTerm: academicTermId,
    createdBy: req.user.id, // Assuming req.user.id is available
  });
  await newSubject.save();

  res.status(201).json({
    status: "success",
    message: "Subject created successfully",
    data: newSubject,
  });
});

// Get all Subjects
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().populate(
    "teacher academicTerm createdBy"
  );
  res.status(200).json({
    status: "success",
    data: subjects,
  });
});

// Update a Subject
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, staffId, academicTermId } = req.body;

  let subject = await Subject.findById(id);
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  subject.name = name || subject.name;
  subject.description = description || subject.description;
  subject.teacher = staffId || subject.teacher;
  subject.academicTerm = academicTermId || subject.academicTerm;

  await subject.save();

  res.status(200).json({
    status: "success",
    message: "Subject updated successfully",
    data: subject,
  });
});

// Delete a Subject
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  res.status(200).json({
    status: "success",
    message: "Subject deleted successfully",
    data: subject,
  });
});

// Get a single Subject by ID
const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id).populate(
    "teacher academicTerm createdBy"
  );
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  res.status(200).json({
    status: "success",
    data: subject,
  });
});

export {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  getSubjectById,
};
