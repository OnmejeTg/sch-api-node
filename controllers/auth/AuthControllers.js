import User from "../../models/user.js";
import { isValidUserData } from "../../utils/authUtils.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { generateAccessToken } from "../../utils/authUtils.js";


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
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
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

export {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  refreshToken,
};
