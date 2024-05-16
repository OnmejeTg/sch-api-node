import Student from "../../models/student.js";
import User from "../../models/user.js";
import {
  generateStudentID,
  isValidUserData,
} from "../../utils/studentUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/authUtils.js";

//*******************LOGIN*******************
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
    const student = await Student.findOne({ admissionId: username });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    // Step 3: Verify password
    const authUser = await User.findById(student.authUser);
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
      fullNames:authUser.fullName(),
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

//*****************************LOGOUT*****************************
const logout = async (req, res) => {
  console.log("logout");
};

//***********************Create Student*********************
const registerStudent = async (req, res) => {
  try {
    // Destructure required fields from request body
    const {
      surname,
      othername,
      email,
      classLevels,
      dateOfBirth,
      sex,
      dateOfAdmission,
      entrySession,
      parentSurname,
      parentOthername,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
    } = req.body;

    // Check if required fields are present
    if (!isValidUserData(req.body)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user data. Please provide a surname, othername, and email.",
      });
    }

    // Generate admission ID
    const admissionId = generateStudentID(surname);

    // Check if a student with the provided email or admission ID already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { admissionId }],
    });
    if (existingStudent) {
      let errorMessage;
      if (existingStudent.email === email) {
        errorMessage = "A student with the same email already exists";
      } else {
        errorMessage = "A student with the same admission ID already exists";
      }
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // Create authentication user
    const authUser = new User({
      username: admissionId,
      surname: surname,
      othername: othername,
      password: surname.toLowerCase(),
      userType: "student",
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
    // Create student object
    const student = new Student({
      authUser,
      surname,
      othername,
      entrySession,
      email,
      dateOfBirth,
      admissionId,
      sex,
      dateOfAdmission,
      parentSurname,
      parentOthername,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
    });

    try {
      // Save student to database
      const savedStudent = await student.save();

      // Respond with success message and the saved student data
      return res.status(201).json({
        success: true,
        message: "Student registered successfully",
        data: savedStudent,
      });
    } catch (error) {
      // Delete the authentication user created for the new student
      await User.deleteOne({ username: admissionId });

      console.error("Error saving student:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save student",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error registering student:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register student",
      error: error.message,
    });
  }
};

//******************Get all students******************************
const getStudents = async (req, res) => {
  try {
    // Fetch all students from the database
    const students = await Student.find();

    // Respond with success message and the retrieved student data
    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "student not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "student found",
      data: student,
    });
  } catch (error) {
    console.error("Error getting student:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get student",
      error: error.message,
    });
  }
};

const updateStudent = async (req, res) => {
  const studentId = req.user.id;
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

const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    const authUserId = student.authUser;

    await Promise.all([
      User.findByIdAndDelete(authUserId),
      Student.deleteOne({ _id: studentId }),
    ]);

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete student:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  registerStudent,
  getStudents,
  login,
  logout,
  getStudent,
  updateStudent,
  deleteStudent,
};
