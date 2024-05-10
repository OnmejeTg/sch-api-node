import Admin from "../../models/admin.js";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";
import User from "../../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/authUtils.js";

const createAdmin = async (req, res) => {
  try {
    const { surname, othername, username, password, email } = req.body;

    if (!username || !password || !email || !surname || !othername) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create authentication user
    const authUser = new User({
      username: username,
      password: password,
      userType: "admin",
    });

    // Save the authUser to ensure the username is unique and saved correctly
    await authUser.save();

    const newAdmin = new Admin({
      authUser: authUser._id, // assuming you want to store a reference
      surname,
      othername,
      username,
      email,
    });

    await newAdmin.save();

    res.json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Failed to create admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.errorResponse.errmsg,
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    // Fetch all admin records from the database
    const admins = await Admin.find({}).populate("authUser");

    // Check if we have admins
    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No admins found",
      });
    }

    // Respond with the list of admins
    res.json({
      success: true,
      message: "Admins retrieved successfully",
      data: admins,
    });
  } catch (error) {
    console.error("Failed to retrieve admins:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const authUserId = admin.authUser;

    await Promise.all([
      User.findByIdAndDelete(authUserId),
      Admin.deleteOne({ _id: adminId }),
    ]);

    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateAdmin = async (req, res) => {
  const { adminId } = req.params;
  const updateData = req.body;

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
    });
    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Failed to update admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAdmin = async (req, res) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findById(adminId).populate("authUser");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Admin retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Failed to retrieve admin:", error);
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
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }
    // Step 3: Verify password
    const authUser = await User.findById(admin.authUser);
    const isPasswordValid = await authUser.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const payLoad = {
      id: admin._id,
      username: admin.fullName(),
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

//Admin update student information
const adminUpdateStudent = async (req, res) => {
  const studentId = req.params.id;
  const updateData = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Failed to update student:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//Admin update teacher information
const adminUpdateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  const updateData = req.body;

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
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

export {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  login,
  adminUpdateStudent,
  adminUpdateTeacher,
};
