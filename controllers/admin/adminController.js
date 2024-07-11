import Admin from "../../models/admin.js";
import Student from "../../models/student.js";
import Teacher from "../../models/teacher.js";
import User from "../../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/authUtils.js";
import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import { generateStudentID } from "../../utils/studentUtils.js";
import Question from "../../models/question.js";
import Exam from "../../models/exam.js";
import SchoolFeeInvoice from "../../models/schoolFeeeInvoice.js";
import ClassLevel from "../../models/classModel.js";
import AcademicYear from "../../models/academicYear.js";
import { uploadImage } from "../../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import createAuditLog from "../../utils/audit.js";

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
      surname: surname,
      othername: othername,
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

    // Create and save audit log
    const userId = req.user.id;
    const authenticatedUser = await User.findById(userId);
    createAuditLog(
      userId,
      "delete",
      "Admin",
      `deleted admin user with id ${admin.username}`
    );

    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete admin:", error.message);

    let errorMessage = "Server error";
    if (error instanceof mongoose.Error.CastError) {
      errorMessage = "Invalid admin ID format";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
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
      id: authUser._id,
      username: authUser.username,
      fullName: authUser.fullName(),
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
    // Find the student associated with the authenticated user
    const student = await Student.findOne({ studentId: studentId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const imageBuffer = req.file?.buffer;
    if (imageBuffer) {
      // Check if user already has a photo that's not default
      if (
        student.image &&
        student.image !== process.env.DEFAULT_PROFILE_PHOTO_URL
      ) {
        const url = student.image;

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
      }

      // Define the folder where the new image will be uploaded
      const folder = "test/studentProfile";

      // Upload the new image
      const stdImage = await uploadImage(imageBuffer, folder);

      // Update the student's data with the new image URL
      updateData.image = stdImage;
    }

    // Update the student data in the database
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      updateData,
      { new: true }
    );

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
  const staffId = req.params.id;
  const updateData = req.body;

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      staffId,
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

const adminAssignTeacherRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { program, classLevel, academicYear, subject } = req.body;

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  if (teacher.isWithdrawn || teacher.isSuspended) {
    return res.status(400).json({
      success: false,
      message: "Teacher is withdrawn or suspended",
    });
  }

  if (program !== undefined) {
    teacher.program = program;
  }

  if (classLevel !== undefined) {
    teacher.classLevel = classLevel;
  }

  if (academicYear !== undefined) {
    teacher.academicYear = academicYear;
  }

  if (subject !== undefined) {
    teacher.subject = subject;
  }

  await teacher.save();

  let message = "";
  if (program) {
    message = "Teacher program updated successfully";
  } else if (classLevel) {
    message = "Teacher class level updated successfully";
  } else if (academicYear) {
    message = "Teacher academic year updated successfully";
  } else if (subject) {
    message = "Teacher subject updated successfully";
  }

  return res.status(200).json({
    success: true,
    message,
    data: teacher,
  });
});

const suspendWithdrawTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isSuspended, isWithdrawn } = req.body;

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  if (isSuspended !== undefined) {
    teacher.isSuspended = isSuspended;
  }

  if (isWithdrawn !== undefined) {
    teacher.isWithdrawn = isWithdrawn;
  }

  await teacher.save();

  return res.status(200).json({
    success: true,
    message: "Teacher status updated successfully",
    data: teacher,
  });
});

const generalLogin = async (req, res) => {
  // Step 1: Data Validation
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Both username and password are required.",
    });
  }

  try {
    // Step 2: Find user by username
    const authUser = await User.findOne({ username });
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Step 3: Check user type and find corresponding user
    let user;
    if (authUser.userType === "admin") {
      user = await Admin.findOne({ authUser: authUser.id });
    } else if (authUser.userType === "student") {
      user = await Student.findOne({ authUser: authUser.id });
    } else if (authUser.userType === "teacher" || authUser.userType === "bursar") {
      user = await Teacher.findOne({ authUser: authUser.id });
    }

    // If user type is invalid or specific user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${
          authUser.userType.charAt(0).toUpperCase() + authUser.userType.slice(1)
        } not found`,
      });
    }

    // Step 4: Verify password
    const isPasswordValid = await authUser.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Step 5: Prepare payload and generate tokens
    const payLoad = {
      id: authUser._id,
      username: authUser.username,
      fullName: authUser.fullName(),
      userType: authUser.userType,
    };

    const accessToken = generateAccessToken(payLoad);
    const refreshToken = generateRefreshToken(payLoad);

    // TODO: save the refresh token to a separate table (userid and refresh token)

    // Step 6: Respond with successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
      userType: authUser.userType,
      id: authUser._id,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login.",
    });
  }
};

const getLoggdInUser = async (req, res) => {
  const authUser = req.user;

  let user;
  if (authUser.userType === "admin") {
    user = await Admin.findOne({ authUser: authUser.id });
  } else if (authUser.userType === "student") {
    user = await Student.findOne({ authUser: authUser.id }).populate([
      "currentClassLevel",
    ]);
  } else if (authUser.userType === "teacher") {
    user = await Teacher.findOne({ authUser: authUser.id });
  }

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
};

//TODO: Optimize this
// Endpoint to handle file upload and student creation
const uploadStudent = asyncHandler(async (req, res) => {
  try {
    const { buffer } = req.file;

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failureCount = 0;
    const failedRecords = [];

    for (const student of jsonData) {
      try {
        // Check if student with the same studentId or email already exists
        const existingStudent = await Student.findOne({
          $or: [{ studentId: student.studentId }],
        });

        if (existingStudent) {
          failureCount++;
          failedRecords.push(student);
          continue;
        }
        const classLevels = await ClassLevel.findOne({ name: student.class });
        if (!classLevels) {
          failureCount++;
          failedRecords.push(student);
          continue;
        }
        // const studentID = await generateStudentID(student.entrySession)

        // const newUser = new User({
        //   username: studentID,
        //   surname: student.surname,
        //   othername: student.othername,
        //   password: student.surname.toLowerCase(),
        //   userType: "student",
        // });
        const newUser = new User({
          username: student.studentId,
          surname: student.surname,
          othername: student.othername,
          password: student.surname.toLowerCase(),
          userType: "student",
        });

        // const newUser =  User.findOne({ username: student.studentId})

        await newUser.save();
        const academicYear = await AcademicYear.findOne({
          isCurrent: true,
        }).sort({
          updatedAt: -1,
        });

        const newStudent = new Student({
          authUser: newUser._id,
          studentId: student.studentId,
          surname: student.surname,
          othername: student.othername,
          entrySession: student.entrySession,
          classLevels: classLevels,
          academicYear,
          email: student.email,
          sex: student.sex,
          dateOfBirth: new Date(student.dateOfBirth),
          parentSurname: student.parentSurname,
          parentOthername: student.parentOthername,
          parentOccupation: student.parentOccupation,
          phone: student.phone,
          address: student.address,
          healthStatus: student.healthStatus,
          religion: student.religion,
        });

        await newStudent.save();
        successCount++;
      } catch (error) {
        console.error("Error adding student:", student, error);
        failureCount++;
        failedRecords.push(student);
      }
    }

    res.status(200).json({
      message: "Student upload process completed",
      successCount,
      failureCount,
      failedRecords,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ success: false, message: "Error processing file" });
  }
});

// Endpoint to handle file upload and question creation
const uploadQuestion = asyncHandler(async (req, res) => {
  try {
    const { buffer } = req.file;
    const { examId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failureCount = 0;
    const failedRecords = [];
    const newQuestions = [];

    for (const question of jsonData) {
      try {
        // Check if the question already exists
        const existingQuestion = await Question.findOne({
          question: question.question,
        });
        if (existingQuestion) {
          failureCount++;
          failedRecords.push(question);
          continue;
        }

        const newQuestion = new Question({
          question: question.question,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctAnswer: question.correctAnswer,
          mark: question.mark,
          createdBy: req.user.id,
        });

        newQuestions.push(newQuestion);
      } catch (error) {
        console.error("Error processing question:", question, error);
        failureCount++;
        failedRecords.push(question);
      }
    }

    // Save all new questions in bulk
    const savedQuestions = await Question.insertMany(newQuestions);
    successCount += savedQuestions.length;

    // Add question IDs to the exam and save the exam
    exam.questions.push(...savedQuestions.map((q) => q._id));
    await exam.save();

    res.status(200).json({
      message: "Question upload process completed",
      successCount,
      failureCount,
      failedRecords,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ success: false, message: "Error processing file" });
  }
});

const portalAnalytics = asyncHandler(async (req, res) => {
  try {
    // Run all count queries in parallel
    const [
      adminCount,
      teacherCount,
      studentCount,
      examCount,
      invoiceCount,
      totalAmount,
    ] = await Promise.all([
      Admin.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      Exam.countDocuments(),
      SchoolFeeInvoice.countDocuments({ paymentStatus: "success" }),
      SchoolFeeInvoice.aggregate([
        { $match: { paymentStatus: "success" } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    // Extract the total amount from the aggregation result
    const amount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      adminCount,
      teacherCount,
      studentCount,
      examCount,
      invoiceCount,
      amount,
      message: "Portal analytics retrieved successfully",
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res
      .status(500)
      .json({ success: false, message: "Error getting portal analytics" });
  }
});

// const assignClassTeacher = asyncHandler(async (req, res) => {
//   try {
//     const { teacherId, classId } = req.body;
//     const teacher = await Teacher.findById(teacherId);
//     const classLevel = await ClassLevel.findById(classId);
//     if (!teacher || !classLevel) {
//       return res
//         .status(400)
//         .json({ message: "Invalid teacher or class level ID" });
//     }
//     classLevel.teachers.push(teacher._id);
//     await classLevel.save();
//     return res
//       .status(200)
//       .json({ message: "Class teacher assigned successfully" });
//   } catch (error) {
//     console.error("Error assigning class teacher:", error);
//     return res.status(500).json({ message: "Error assigning class teacher" });
//   }
// });

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}




const assignClassTeacher = asyncHandler(async (req, res) => {
  try {
    // Deconstruct request body for clarity and potential validation
    const { teacherId, classId } = req.body;
    // console.log(teacherId);

    // Fetch teacher and class level in a single operation (if supported by database)
    const [teacher, classLevel] = await Promise.all([
      Teacher.findById(teacherId),
      ClassLevel.findById(classId),
    ]);

    // Validate existence of both teacher and class level (potentially with a custom error class)
    if (!teacher || !classLevel) {
      throw new BadRequestError('Invalid teacher or class level ID');
    }

    // Update classLevel.teachers atomically (if database supports)
    console.log(teacher, classLevel);
    classLevel.teachers = teacher._id;
    teacher.classInSchool = classLevel._id
    teacher.classLevel = classLevel._id
    await classLevel.save();
    await teacher.save();

    return res.status(200).json({ message: 'Class teacher assigned successfully' });
  } catch (error) {
    // Handle specific errors (e.g., BadRequestError) and log others
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    } else {
      console.error('Error assigning class teacher:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
});

const assignBursar = asyncHandler(async (req, res) => {
  try {
    // Destructure id from request parameters
    const { id } = req.params;
    const {designation } = req.body;

    // Find the teacher by id
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Find the associated user by teacher's authUser field
    const user = await User.findById(teacher.authUser);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user type and teacher designation
    user.userType = designation;
    teacher.designation = designation;

    // Save the changes
    await Promise.all([user.save(), teacher.save()]);

    // Respond with success message
    return res.status(200).json({ message: `${designation} assigned successfully` });
  } catch (error) {
    // Handle any other errors
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});




// Done
//TODO: Portal anayltics
//TODO: payment
//TODO: Announcement

//TODO: Result
//TODO: profile pictures for users

export {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  login,
  adminUpdateStudent,
  adminUpdateTeacher,
  adminAssignTeacherRole,
  suspendWithdrawTeacher,
  generalLogin,
  getLoggdInUser,
  uploadStudent,
  uploadQuestion,
  portalAnalytics,
  assignClassTeacher,
  assignBursar
};
