import asyncHandler from "express-async-handler";
import Fee from "../../models/invoice.js";

const createFee = asyncHandler(async (req, res) => {
  try {
    const { name, amount, amountInWords, description } = req.body;
    const newFee = new Fee({ name, amount, amountInWords, description });
    const savedFee = await newFee.save();
    res.status(201).json(savedFee);
  } catch (error) {
    res.status(500).json({ message: "Error creating fee", error });
  }
});

const getFees = asyncHandler(async (req, res) => {
  try {
    const fees = await Fee.find();
    res.status(200).json({
      status: "success",
      data: fees,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fees", error });
  }
});

const getFee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await Fee.findById(id);
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fee", error });
  }
});

const updateFee = asyncHandler(async (req, res) => {
  try {
    const { name, amount, amountInWords, description } = req.body;
    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      { name, amount, amountInWords, description },
      { new: true, runValidators: true }
    );
    if (updatedFee) {
      res.status(200).json(updatedFee);
    } else {
      res.status(404).json({ message: "Fee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating fee", error });
  }
});

const deleteFee = asyncHandler(async (req, res) => {
  try {
    const deletedFee = await Fee.findByIdAndDelete(req.params.id);
    if (deletedFee) {
      res.status(200).json({ message: "Fee deleted successfully" });
    } else {
      res.status(404).json({ message: "Fee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting fee", error });
  }
});

export { createFee, getFee, deleteFee, updateFee, getFees };
