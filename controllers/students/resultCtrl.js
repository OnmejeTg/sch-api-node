import StudentResult from "../../models/studentResult.js";
import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import Student from "../../models/student.js";
import { validationResult } from "express-validator";
import AcademicYear from "../../models/academicYear.js";
import AcademicTerm from "../../models/academicTerm.js";
import {generatePDF, sample} from  "../../utils/result/studentResult.js"

const uploadScores = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  try {
    const currentSession = await AcademicYear.findOne({ isCurrent: true }).sort(
      {
        updatedAt: -1,
      }
    );
    const currentTerm = await AcademicTerm.findOne({ isCurrent: true }).sort({
      updatedAt: -1,
    });
    const { assessmentType } = req.body;
    if (
      assessmentType !== "assessment1" &&
      assessmentType !== "assessment2" &&
      assessmentType !== "assessment3" &&
      assessmentType !== "exam"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment type should be one of the following: assessment1, assessment2, assessment3, or exam",
      });
    }

    const { buffer } = req.file;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failureCount = 0;
    const failedRecords = [];

    for (const studentData of jsonData) {
      // Check if the student exists
      const student = await Student.findOne({
        studentId: studentData.StudentID,
      });

      if (!student) {
        console.log(
          `Student ${studentData.StudentID} does not exist, skipping.`
        );
        failureCount++;
        failedRecords.push(studentData.StudentID);
        continue;
      }

      // Check if the student result already exists for the current term and year
      let studentResult = await StudentResult.findOne({
        studentId: student._id,
        academicTerm: currentSession, // Replace with actual ObjectId
        academicYear: currentTerm, // Replace with actual ObjectId
      });

      if (studentResult) {
        // Update existing student result
        for (const [key, value] of Object.entries(studentData)) {
          if (key !== "StudentID") {
            const subject = studentResult.subjects.find(
              (sub) => sub.name === key
            );
            if (subject) {
              subject[assessmentType] = value;
            } else {
              studentResult.subjects.push({
                name: key,
                [assessmentType]: value,
              });
            }
          }
        }
      } else {
        // Create a new student result instance
        const subjects = [];
        for (const [key, value] of Object.entries(studentData)) {
          if (key !== "StudentID") {
            subjects.push({ name: key, [assessmentType]: value });
          }
        }

        studentResult = new StudentResult({
          studentId: student._id,
          subjects,
          passMark: 50,
          classLevel: student.currentClassLevel, // Replace with actual ObjectId
          academicTerm: currentTerm, // Replace with actual ObjectId
          academicYear: currentSession, // Replace with actual ObjectId
        });
      }

      // Save the instance to the database
      try {
        await studentResult.save();
        // console.log(`Student result for ${studentData.StudentID} ${studentResult ? 'updated' : 'created'} successfully`);
        successCount++;
      } catch (saveError) {
        console.error(
          `Error saving student result for ${studentData.StudentID}:`,
          saveError
        );
        failureCount++;
        failedRecords.push(studentData.StudentID);
      }
    }

    res.status(200).json({
      message: "Upload completed",
      successCount,
      failureCount,
      failedRecords,
    });
  } catch (error) {
    console.error("Error creating student results:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing the upload" });
  }
});

const allResults = asyncHandler(async (req, res) => {
  try {
    const results = await StudentResult.find().populate([
      "studentId",
      "academicYear",
      "academicTerm",
    ]);
    if (!results) {
      return res.status(404).json({ message: "No results found" });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Results were successfully found",
        count: results.length,
        data: results,
      });
    }
  } catch (error) {
    console.error("Error retrieving results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve results",
      error: error.message,
    });
  }
});

const updateResult = asyncHandler(async (req, res) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const { subject, assessmentType, score } = req.body;

    const result = await StudentResult.findById(id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    let subjectFound = false;

    for (const sub of result.subjects) {
      if (sub.name === subject) {
        sub[assessmentType] = score;
        subjectFound = true;
        break;
      }
    }

    if (!subjectFound) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const updatedResult = await result.save();

    return res.status(200).json({
      status: "success",
      message: "Result was successfully updated",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error updating result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update result",
      error: error.message,
    });
  }
});

const deleteResult = asyncHandler(async (req, res) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const result = await StudentResult.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Result was successfully deleted",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete result",
      error: error.message,
    });
  }
});

const deleteAllResult = asyncHandler(async (req, res) => {
  try {
    await StudentResult.deleteMany();
    return res.status(200).json({
      success: true,
      message: "All results were successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting all results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete all results",
      error: error.message,
    });
  }
});

const getResultById = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await StudentResult.findOne({ studentId }).populate([
      "studentId",
      "academicYear",
      "academicTerm",
      "classLevel"
    ]);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Result was successfully found",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the result",
      error: error.message,
    });
  }
});

const generateResultPDFCtrl = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  try {
    const pdf = await generatePDF(sample);
    const pdfData = pdf.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sample.name}.pdf"`);
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'An error occurred while generating the PDF',
      error: error
    });
  }
});



export {
  uploadScores,
  allResults,
  updateResult,
  deleteResult,
  deleteAllResult,
  getResultById,
  generateResultPDFCtrl
};
