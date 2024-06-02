import asyncHandler from "express-async-handler";
import Fee from "../../models/invoice.js";

const createFee = asyncHandler(async (req, res) => {
  try {
    const { name, amount, amountInWords, description } = req.body;
    const newFee = new Fee({ name, amount, amountInWords, description });
    const savedFee = await newFee.save();
    res.status(201).json({
      status: "success",
      message: "Fee saved successfully",
      data: savedFee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating fee", error });
  }
});

const getFees = asyncHandler(async (req, res) => {
  try {
    const fees = await Fee.find();

    if (fees.length === 0) {
      return res.status(204).json({
        status: "success",
        message: "Fees not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Fees found",
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

    if (!fee) {
      return res.status(204).json({
        status: "success",
        message: "Fee not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Fee found",
      data: fee,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid fee ID format" });
    }
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
      res.status(200).json({
        status: "success",
        message: "Fee was successfully updated",
        data: updatedFee,
      });
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
