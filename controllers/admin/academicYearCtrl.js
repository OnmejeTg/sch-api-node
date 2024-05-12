import asyncHandler from "express-async-handler";
import AcademicYear from "../../models/academicYear.js";
import Admin from "../../models/admin.js";

// Create a new academic year
const createAcademicYear = asyncHandler(async (req, res) => {
  const { name, fromYear, toYear } = req.body;

  // Check if academic year already exists
  const existingAcademicYear = await AcademicYear.findOne({ name });
  if (existingAcademicYear) {
    throw new Error("Academic Year already exists");
  }

  // Create new academic year
  const newAcademicYear = new AcademicYear({
    name,
    fromYear,
    toYear,
    createdBy: req.user.id,
  });
  await newAcademicYear.save();
  
  res.status(201).json({
    status: "success",
    message: "Academic year created successfully",
    data: newAcademicYear,
  });
});

// Get all academic years
const getAcademicYears = asyncHandler(async (req, res) => {
  const academicYears = await AcademicYear.find();
  
  res.status(200).json({
    status: "success",
    data: academicYears,
  });
});

// Update an academic year
const updateAcademicYear = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, fromYear, toYear } = req.body;

  // Find academic year by ID
  let academicYear = await AcademicYear.findById(id);

  // If academic year not found, return error
  if (!academicYear) {
    res.status(404);
    throw new Error("Academic Year not found");
  }

  // Update academic year data
  academicYear.name = name || academicYear.name;
  academicYear.fromYear = fromYear || academicYear.fromYear;
  academicYear.toYear = toYear || academicYear.toYear;

  // Save updated academic year
  academicYear = await academicYear.save();

  res.status(200).json({
    status: "success",
    message: "Academic year updated successfully",
    data: academicYear,
  });
});

// Delete an academic year
const deleteAcademicYear = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find academic year by ID and remove
  const academicYear = await AcademicYear.findByIdAndDelete(id);

  // If academic year not found, return error
  if (!academicYear) {
    res.status(404);
    throw new Error("Academic Year not found");
  }

  res.status(200).json({
    status: "success",
    message: "Academic year deleted successfully",
    data: academicYear,
  });
});

// Get a single academic year by ID
const getAcademicYearById = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    // Find academic year by ID
    const academicYear = await AcademicYear.findById(id);
  
    // If academic year not found, return error
    if (!academicYear) {
      res.status(404);
      throw new Error("Academic Year not found");
    }
  
    res.status(200).json({
      status: "success",
      data: academicYear,
    });
  });
  
  

export { createAcademicYear, getAcademicYears, updateAcademicYear, deleteAcademicYear, getAcademicYearById };
