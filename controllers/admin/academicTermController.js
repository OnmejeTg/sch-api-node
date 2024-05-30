import AcademicTerm from "../../models/academicTerm.js";
import asyncHandler from "express-async-handler";

const createAcademicTerm = async (req, res) => {
  try {
    const { name, description, duration, academicYear } = req.body;
    const createdBy = req.user.id;
    const newAcademicTerm = new AcademicTerm({
      name,
      description,
      duration,
      createdBy,
      academicYear
    });
    const savedTerm = await newAcademicTerm.save();
    res.status(201).json(savedTerm);
  } catch (error) {
    console.error("Error creating academic term:", error);
    res.status(500).json({ error: "Failed to create academic term" });
  }
};

// Get all academic terms
const getAllTerms = async (req, res) => {
  try {
    // Fetch all term from the database
    const term = await AcademicTerm.find().populate('academicYear');

    // Respond with success message and the retrieved teacher data
    res.status(200).json({
      success: true,
      message: "Term retrieved successfully",
      data: term,
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving term:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve term",
      error: error.message,
    });
  }
};

const getTerm = async (req, res) => {
  try {
    const id = req.params.id;
    const term = await AcademicTerm.findById(id).populate('academicYear');;
    if (!term) {
      return res.status(404).json({
        success: false,
        message: "Term not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Term found",
      data: term,
    });
  } catch (error) {
    console.error("Error getting term:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get term",
      error: error.message,
    });
  }
};

// Update an academic term
const updateTerm = async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  try {
    const updatedTerm = await AcademicTerm.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedTerm) {
      return res.status(404).json({
        success: false,
        message: "Term not found",
      });
    }

    res.json({
      success: true,
      message: "Term updated successfully",
      data: updatedTerm,
    });
  } catch (error) {
    console.error("Failed to update term:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete an academic term
const deleteTerm = async (req, res) => {
  const id = req.params.id;

  try {
    const term = await AcademicTerm.findById(id);
    if (!term) {
      return res.status(404).json({
        success: false,
        message: "Term not found",
      });
    }

    await AcademicTerm.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Term deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete term:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCurrentTerm = asyncHandler(async (req, res) => {
  try {
    const academicTerm = await AcademicTerm.findOne({ isCurrent: true }).sort({
      updatedAt: -1,
    });

    if (!academicTerm) {
      return res.status(404).json({
        success: false,
        message: "No current academic term found",
      });
    }

    res.status(200).json({
      status: "success",
      data: academicTerm,
    });
  } catch (error) {
    console.error("Error fetching current academic term:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the current academic term",
      error: error.message,
    });
  }
});

export {
  createAcademicTerm,
  getAllTerms,
  updateTerm,
  deleteTerm,
  getTerm,
  getCurrentTerm,
};
