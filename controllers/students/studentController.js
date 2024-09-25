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
import { cloudinary, uploadImage } from "../../utils/cloudinary.js";
import mongoose from "mongoose";
import AcademicYear from "../../models/academicYear.js";
// import fs from "fs";
import path from "path";
import * as fs from "fs/promises";
// import path from 'path';
import * as XLSX from "xlsx";
import ClassLevel from "../../models/classModel.js";
import { generateFakeStudents } from "../../seeders/studentSeeder.js";

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
    const student = await Student.findOne({ studentId: username });

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
      fullNames: authUser.fullName(),
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      surname,
      othername,
      email,
      classLevels,
      dateOfBirth,
      sex,
      entrySession,
      parentSurname,
      parentOthername,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
    } = req.body;

    // Generate student ID
    const studentId = await generateStudentID(entrySession);
    const academicYear = await AcademicYear.findOne({ isCurrent: true }).sort({
      updatedAt: -1,
    });

    // Create student object
    const student = new Student({
      studentId,
      surname,
      othername,
      email,
      classLevels,
      dateOfBirth,
      sex,
      entrySession,
      parentSurname,
      parentOthername,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
      academicYear,
    });

    // Save student to database
    const savedStudent = await student.save({ session });

    // Create auth user object
    const newUser = await User.create(
      [
        {
          username: studentId,
          surname: surname,
          othername: othername,
          password: surname.toLowerCase(), // Consider using a more secure password strategy
          userType: "student",
        },
      ],
      { session }
    );

    // Update student with authUser reference
    savedStudent.authUser = newUser[0]._id;
    await savedStudent.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with success message and the saved student data
    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: savedStudent,
    });
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();

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
    // const students = await Student.find()
    const students = await Student.find().populate([
      "authUser",
      "currentClassLevel",
      "currentPayment",
    ]);

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
    let student;
    try {
      student = await Student.findOne({ _id: studentId }).populate(
        "currentClassLevel"
      );
    } catch (error) {
      student = await Student.findOne({ studentId }).populate(
        "currentClassLevel"
      );
    }

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
  const userId = req.user.id;
  const updateData = req.body;

  try {
    // Find the student associated with the authenticated user
    const student = await Student.findOne({ authUser: userId });

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

const deleteStudent = async (req, res) => {
  // await Student.deleteMany();
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

const uploadPicture = async (req, res) => {
  const directoryPath = path.join(process.cwd(), "MCSSW STUDENTS/SSS 2B");
  let studentCount = 0;
  const invalidFiles = [];

  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const surname = file.split(".")[0];
        const student = await Student.findOne({
          surname: new RegExp(`^${surname}$`, "i"),
          currentClassLevel: "667581be7f256b0f92d042f1",
        });

        if (student) {
          studentCount++;
          const data = await fs.readFile(filePath);
          const folder = "test/studentProfile";
          const stdImage = await uploadImage(data, folder);

          student.image = stdImage;
          await student.save();
          console.log(`Uploaded ${file} to ${folder}: ${stdImage}`);
        } else {
          invalidFiles.push({
            fileName: file,
            message: "No matching student found",
          });
          console.log(
            `No student found with surname: ${surname}, skipping file: ${file}`
          );
        }
      } else if (stats.isDirectory()) {
        console.log("Directory:", file);
        // You can choose to handle subdirectories here, but be cautious about recursion
      }
    }

    if (invalidFiles.length > 0) {
      await createInvalidFilesReport(invalidFiles);
    }

    console.log(
      `Uploaded ${studentCount} students pictures, skipped ${invalidFiles.length} invalid files`
    );
    res.status(200).send("Files uploaded successfully");
  } catch (err) {
    console.error("Error processing files:", err);
    res.status(500).send("Error uploading files");
  }
};

async function createInvalidFilesReport(invalidFiles) {
  const worksheet = XLSX.utils.json_to_sheet(invalidFiles);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invalid Files");

  await XLSX.writeFile(workbook, "invalid_files_report.xlsx");
  console.log("Invalid files report saved to invalid_files_report.xlsx");
}

// ... rest of your code (assuming it's also written in ESM syntax)

const createStudentAuthUser = async (req, res) => {
  try {
    const students = await Student.find({});

    const createdUsers = await Promise.all(
      students.map(async (student) => {
        const username = student.studentId; // Assuming studentId is unique

        const authUser = new User({
          firstName: student.firstName,
          othername: student.othername,
          surname: student.surname,
          username,
          password: student.surname.toLowerCase().trim(),
        });

        await authUser.save();

        student.authUser = authUser._id;
        await student.save();

        return { student, authUser }; // Return both student and authUser for potential use
      })
    );

    res.status(200).json({
      success: true,
      message: "Student and authUser created successfully",
      data: createdUsers, // Return all created user data
    });
  } catch (err) {
    console.error("Error creating student auth users:", err);
    res.status(500).json({
      success: false,
      message: "Error creating student and authUser",
    });
  }
};

const seedStudents = async (req, res) => {
  try {
    await Student.deleteMany({});
    await User.deleteMany({ userType: "student" });
    const classLevels = await ClassLevel.find();
    // console.log(classLevels);
    if (classLevels.length === 0) {
      return res
        .status(400)
        .json({ message: "No class found to assign student" });
    }
    const fakeStudents = await generateFakeStudents(10, classLevels);
    console.log(fakeStudents);
    for (const fakeStudent of fakeStudents) {
      const student = new Student(fakeStudent);
      await student.save();
    }
    return res
      .status(201)
      .json({ message: "Studentd database seeded successfully " });
  } catch (err) {
    console.error(`Error seeding database: ${err.message}`);
    return res.status(500).json({
      message: "Something went wrong",
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
  uploadPicture,
  createStudentAuthUser,
  seedStudents,
};
