import asyncHandler from "express-async-handler";
import Announcement from "../../models/announcement.js";
import mongoose from "mongoose";

// Create a new announcement
const createAnnouncement = asyncHandler(async (req, res) => {
  try {
    // Extract data from request body
    const { subject, body, to } = req.body;

    // Validate if 'to' field exists in Announcement model enums
    const Announcement = mongoose.model("Announcement"); // Assuming 'Announcement' is the model name
    const validToValues = Announcement.schema.path("to").enumValues; // Get enum values from the schema

    if (!validToValues.includes(to)) {
      return res
        .status(400)
        .json({
          message: `Invalid 'to' value. Valid options: ${validToValues.join(
            ", "
          )}`,
        });
    }

    // Rest of the code remains the same...

    // Create a new announcement instance
    const newAnnouncement = new Announcement({ subject, body, to });

    // Save the announcement to the database
    await newAnnouncement.save();

    // Respond with success message and announcement data
    res.status(200).json({
      status: "success",
      message: "Announcement created successfully",
      data: newAnnouncement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Read all announcements
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find();
  res.status(200).json({
    status: "success",
    message: "Announcements were successfully found",
    data: announcements,
  });
});

// Get announcement by ID
const getSingleAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await Announcement.findById(id);
  if (!announcement) {
    res.status(404).json({ message: "Announcement not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Announcement was successfully found",
      data: announcement,
    });
  }
});

// Update an announcement by ID
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  if (!updatedAnnouncement) {
    res.status(404).json({ message: "Announcement not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Announcement was successfully updated",
      data: updatedAnnouncement,
    });
  }
});

// Delete an announcement by ID
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
  if (!deletedAnnouncement) {
    res.status(404).json({ message: "Announcement not found" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Announcement was successfully deleted",
      data: deletedAnnouncement,
    });
  }
});

export {
  createAnnouncement,
  getAnnouncements,
  getSingleAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
