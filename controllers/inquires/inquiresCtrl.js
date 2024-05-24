import asyncHandler from "express-async-handler";
import Inquiry from "../../models/inquires.js";

// Create a new Inquiry
const createInquiry = asyncHandler(async (req, res) => {
  const { subject, body } = req.body;
  const user = req.user.id;
  const newInquiry = new Inquiry({ subject, body, user });
  await newInquiry.save();
  res.status(200).json({
    status: "success",
    message: "Inquiry created successfully",
    data: newInquiry,
  });
});

// Read all inquires
const getInquires = asyncHandler(async (req, res) => {
  const inquires = await Inquiry.find();
  res.status(200).json({
    status: "success",
    message: "Inquires were successfully found",
    data: inquires,
  });
});

// Get inquiry by ID
const getSingleInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) {
    res.status(404).json({ message: "Inquiry not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Inquiry was successfully found",
      data: inquiry,
    });
  }
});

// Update an inquiry by ID
const updateInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedInquiry = await Inquiry.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedInquiry) {
    res.status(404).json({ message: "Inquiry not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Inquiry was successfully updated",
      data: updatedInquiry,
    });
  }
});

// Delete an inquiry by ID
const deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedInquiry = await Inquiry.findByIdAndDelete(id);
  if (!deletedInquiry) {
    res.status(404).json({ message: "Inquiry not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Inquiry was successfully deleted",
      data: deletedInquiry,
    });
  }
});

export {
  createInquiry,
  getInquires,
  getSingleInquiry,
  updateInquiry,
  deleteInquiry,
};
