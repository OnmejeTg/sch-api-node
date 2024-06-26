import Teacher from "../../models/teacher.js";
import User from "../../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/authUtils.js";
import { cloudinary, uploadImage } from "../../utils/cloudinary.js";
import { generatestaffId, isValidUserData } from "../../utils/teacherUtils.js";
import asyncHandler from "express-async-handler";

const createTeacher = async (req, res) => {
  try {
    // Destructure required fields from request body
    const {
      surname,
      othername,
      email,
      sex,
      dateEmployed,
      qualification,
      designation,
      phone,
      appointmentType,
    } = req.body;

    // Check if required fields are present
    if (!isValidUserData(req.body)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user data. Please provide a surname, othername, and email.",
      });
    }

    // Generate teacher ID
    const staffId = generatestaffId(surname);

    // Check if a teacher with the provided email or  ID already exists
    const existingTeacher = await Teacher.findOne({
      $or: [{ email }, { staffId }],
    });
    if (existingTeacher && email !== undefined ) {
      let errorMessage;
      if (existingTeacher.email === email) {
        errorMessage = "A teacher with the same email already exists";
      } else {
        errorMessage = "A teacher with the same ID already exists";
      }
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // Create authentication user
    const authUser = new User({
      username: staffId,
      surname,
      othername,
      password: surname.toLowerCase(),
      userType: designation,
    });

    try {
      // Save authentication user
      await authUser.save();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to save authentication user",
        error: error.message,
      });
    }
    // Create teacher object
    const teacher = new Teacher({
      authUser,
      surname,
      othername,
      email,
      sex,
      dateEmployed,
      staffId,
      qualification,
      designation,
      phone,
      appointmentType,
    });

    try {
      // Save teacher to database
      const savedTeacher = await teacher.save();

      // Respond with success message and the saved teacher data
      return res.status(201).json({
        success: true,
        message: "Teacher registered successfully",
        data: savedTeacher,
      });
    } catch (error) {
      // Delete the authentication user created for the new teacher
      await User.deleteOne({ username: staffId });

      console.error("Error saving teacher:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save teacher",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error registering teacher:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register teacher",
      error: error.message,
    });
  }
};

const allTeachers = async (req, res) => {
  try {
    // Fetch all teacher from the database
    const teacher = await Teacher.find();

    // Respond with success message and the retrieved teacher data
    res.status(200).json({
      success: true,
      message: "Teacher retrieved successfully",
      data: teacher,
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher",
      error: error.message,
    });
  }
};

const getTeacher = async (req, res) => {
  try {
    const staffId = req.params.id;
    const teacher = await Teacher.findById(staffId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Teacher found",
      data: teacher,
    });
  } catch (error) {
    console.error("Error getting teacher:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get teacher",
      error: error.message,
    });
  }
};

const updateTeacher = async (req, res) => {
  const staffId = req?.user?.id;
  const updateData = req.body;

  try {
    const teacher = await Teacher.findOne({ authUser: staffId });
    console.log(teacher);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const imageBuffer = req.file?.buffer;
    if (imageBuffer) {
      // Check if user already has a photo that's not default
      if (
        teacher.image &&
        teacher.image !== process.env.DEFAULT_PROFILE_PHOTO_URL
      ) {
        const url = teacher.image;

        // Regular expression to match the desired part of the URL
        const regex = /\/upload\/v\d+\/(.+)\.jpg$/;
        // Execute the regex on the URL
        const match = url.match(regex);

        const extractedPath = match[1];

        // Delete the existing photo from Cloudinary
        const deletedImg = await cloudinary.api.delete_resources(
          [extractedPath],
          { type: "upload", resource_type: "image" }
        );
        console.log("Deleted image:", deletedImg);
      }

      // Define the folder where the new image will be uploaded
      const folder = "test/studentProfile";

      // Upload the new image
      const stdImage = await uploadImage(imageBuffer, folder);

      // Update the student's data with the new image URL
      updateData.image = stdImage;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacher,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Failed to update teacher:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteTeacher = async (req, res) => {
  
  const staffId = req.params.id;

  try {
    const teacher = await Teacher.findById(staffId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }
    const authUserId = teacher.authUser;

    await Promise.all([
      User.findByIdAndDelete(authUserId),
      Teacher.deleteOne({ _id: staffId }),
    ]);

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  // Step 1: Data Validation
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Both username and password are required.",
    });
  }

  try {
    // Step 2: Find the student in the database
    const teacher = await Teacher.findOne({ staffId: username });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }
    // Step 3: Verify password
    const authUser = await User.findById(teacher.authUser);
    const isPasswordValid = await authUser.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const payLoad = {
      id: authUser._id,
      username: authUser.username,
      surname: authUser.surname,
      othername: authUser.othername,
      userType: authUser.userType,
    };

    const accessToken = generateAccessToken(payLoad);
    const refreshToken = generateRefreshToken(payLoad);

    //TODO: save the refresh token to a separate table (userid and refresh token)

    // Step 4: Respond with successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login.",
    });
  }
};

const uploadSignature = asyncHandler(async (req, res) => {
  // Validate staff ID presence (optional)
  if (!req.params.id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing staff ID" });
  }

  try {
    // Check for uploaded signature image
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No signature image provided" });
    }

    const staffId = req.params.id;
    const signatureBuffer = req.file.buffer;

    // Upload image with proper error handling
    const signatureImage = await uploadImage(
      signatureBuffer,
      "test/signature"
    ).catch((error) => {
      console.error("Error uploading signature:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload signature" });
    });

    // Find and update teacher with signature (ensure new document is returned)
    const teacher = await Teacher.findByIdAndUpdate(
      staffId,
      { signature: signatureImage },
      { new: true }
    );

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Respond with success message (optional)
    res
      .status(200)
      .json({ success: true, message: "Signature uploaded successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export {
  createTeacher,
  allTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  login,
  uploadSignature,
};
