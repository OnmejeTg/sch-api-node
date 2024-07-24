import User from "../../models/user.js";
import { isValidUserData } from "../../utils/authUtils.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { generateAccessToken } from "../../utils/authUtils.js";
import Student from "../../models/student.js";
import mongoose from "mongoose";
import Admin from "../../models/admin.js";
import Teacher from "../../models/teacher.js";
import asyncHandler from "express-async-handler";
import { sendOtp } from "../../utils/emailSender.js";

//CREATE USER
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Validate user input
    if (!isValidUserData(userData)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user data. Please provide a username and password.",
      });
    }

    // Check if user with the same email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

//GET USER BY ID
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

//UPDATE USER
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

//DELETE USER
const deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Use Promise.all to perform parallel deletion of related documents
    const [user] = await Promise.all([
      // User.deleteMany(),
      Admin.deleteMany({ authUser: userId }),
      Student.deleteMany({ authUser: userId }),
      Teacher.deleteMany({ authUser: userId }),
      // Add more delete operations for other related models if needed
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User and all linked instances deleted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

//REFRESH TOKEN
const refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }
  //TODO: if user and refresh token exists in the refresh token table
  //
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const payLoad = {
      id: user._id,
      username: user.username,
    };
    const accessToken = generateAccessToken(payLoad);
    return res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });
};

const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, oldPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // console.log(user)

    const isPasswordValid = await user.verifyPassword(oldPassword);
    console.log(!isPasswordValid);

    if (isPasswordValid) {
      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
        data: user,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Old password is incorrect",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: err.message,
    });
  }
});

const adminChangePassword = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: user,
  });
});

const sendEmail = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  sendOtp(email, otp);
});


const deleteInvalidUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    const deletionPromises = users.map(async (user) => {
      const isValidUser = await Student.findOne({ authUser: user._id }) ||
                          await Teacher.findOne({ authUser: user._id }) ||
                          await Admin.findOne({ authUser: user._id });

      if (!isValidUser) {
        await User.findByIdAndDelete(user._id);
        console.log(`User with id ${user._id} has been deleted`);
      }
    });

    await Promise.all(deletionPromises);

    return res.status(200).json({
      success: true,
      message: "All invalid users have been deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting invalid users",
      error: error.message,
    });
  }
});




export {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  refreshToken,
  changePassword,
  adminChangePassword,
  sendEmail,
  deleteInvalidUsers
};
