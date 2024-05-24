import asyncHandler from "express-async-handler";
import Announcement from "../../models/announcement.js";

// Create a new announcement
const createAnnouncement = asyncHandler(async (req, res) => {
  const { subject, body } = req.body;
  const newAnnouncement = new Announcement({ subject, body });
  await newAnnouncement.save();
  res.status(200).json({
    status: "success",
    message: "Announcement created successfully",
    data: newAnnouncement,
  });
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
