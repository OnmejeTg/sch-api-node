import StudentResult from "../../models/studentResult.js";
import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import Student from "../../models/student.js";
import { Result, validationResult } from "express-validator";
import AcademicYear from "../../models/academicYear.js";
import AcademicTerm from "../../models/academicTerm.js";
import {
  generatePDF,
  generateAnnualPDF,
  createGradingFunction,
} from "../../utils/result/studentResult.js";
import axios from "axios";
import Teacher from "../../models/teacher.js";
import studentAnnualResult from "../../models/studentAnnualResult.js";
import ClassLevel from "../../models/classModel.js";
import { processResults } from "../../utils/studentUtils.js";

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
        // console.log(
        //   `Student ${studentData.StudentID} does not exist, skipping.`
        // );
        failureCount++;
        failedRecords.push(studentData.StudentID);
        continue;
      }
      // Check if the student result already exists for the current term and year
      let studentResult = await StudentResult.findOne({
        studentId: student._id.toString(),
        academicYear: currentSession._id.toString(), // Replace with actual ObjectId
        academicTerm: currentTerm._id.toString(), // Replace with actual ObjectId
      });

      if (studentResult) {
        // Update existing student result
        for (const [key, value] of Object.entries(studentData)) {
          if (key !== "StudentID") {
            const subject = studentResult.subjects.find(
              (sub) => sub.name === key
            );
            const integerValue = parseInt(value, 10); // Convert value to integer
            if (subject) {
              subject[assessmentType] = integerValue;
            } else {
              studentResult.subjects.push({
                name: key,
                [assessmentType]: integerValue,
              });
            }
          }
        }
      } else {
        // Create a new student result instance
        const subjects = [];
        for (const [key, value] of Object.entries(studentData)) {
          const integerValue = parseInt(value, 10); // Convert value to integer
          if (key !== "StudentID") {
            subjects.push({ name: key, [assessmentType]: integerValue });
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
      "classLevel",
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

  const result = await StudentResult.findOne({ studentId }).populate([
    "studentId",
    "academicYear",
    "academicTerm",
    "classLevel",
  ]);

  const teacherId = result.classLevel.teachers;
  // console.log(result.classLevel)
  const teacher = await Teacher.findById(teacherId);
  const teacherSignature = teacher.signature;
  const principal = await Teacher.findOne({ designation: "principal" });
  const principalSignature = principal.signature;

  let studentRes = { data: result };
  const stdImg = studentRes.data.studentId.image;

  try {
    const pdf = await generatePDF(
      studentRes,
      teacher,
      stdImg,
      teacherSignature,
      principalSignature
    );
    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${studentRes.data.studentId.studentId}.pdf"`
    );
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "An error occurred while generating the PDF",
      error: error,
    });
  }
});



const calResult = asyncHandler(async (req, res) => {
  try {
    const { classId, resultType } = req.body;
    const model = resultType === "annual" ? studentAnnualResult : StudentResult;
    const classLevel = await ClassLevel.findById(classId);
    if (!classLevel) {
      return res
        .status(404)
        .send({ message: "Class not found", classId: classId });
    }

    let numberOfTerms = 1;

    if (resultType === "annual") {
      if (
        classLevel.name === "JSS3A" ||
        classLevel.name === "SS2A" ||
        classLevel.name === "SS2B"
      ) {
        numberOfTerms = 2;
      } else {
        numberOfTerms = 3;
      }
    }

    const results = await model.find({ classLevel: classId });
    // console.log(results[0].subjects);

    const subjectScores = {};

    // Collect scores for each subject
    results.forEach((result) => {
      result.subjects.forEach((subject) => {
        if (!subjectScores[subject.name]) {
          subjectScores[subject.name] = [];
        }
        subjectScores[subject.name].push({
          total: subject.total,
          studentId: result.studentId,
        });
      });
    });

    // Calculate average, highest, lowest, and rank for each subject
    for (const [subjectName, scores] of Object.entries(subjectScores)) {
      const totalScore = scores.reduce((sum, score) => sum + score.total, 0);
      const average = totalScore / (scores.length * numberOfTerms);

      // Sort scores to determine highest, lowest, and rank
      scores.sort((a, b) => b.total - a.total);

      const highest = scores[0].total;
      const lowest = scores[scores.length - 1].total;

      // Assign ranks
      let currentRank = 1;
      scores.forEach((score, index) => {
        if (index > 0 && scores[index - 1].total !== score.total) {
          currentRank = index + 1;
        }
        score.rank = currentRank;
      });

      // Update results with calculated values
      results.forEach((result) => {
        result.subjects.forEach((subject) => {
          if (subject.name === subjectName) {
            const studentScore = scores.find(
              (score) => score.studentId === result.studentId
            );
            subject.average = average;
            subject.highest = highest;
            subject.lowest = lowest;
            subject.position = studentScore.rank;
          }
        });
      });
    }

    // Save updated results to the database
    await Promise.all(results.map((result) => result.save()));

    res.json({
      status: "success",
      message: "Results were successfully calculated",
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const calClassPosition = asyncHandler(async (req, res) => {
  const { classId, resultType } = req.body;
  const model = resultType === "annual" ? studentAnnualResult : StudentResult;

  // Fetch class level information
  const classLevel = await ClassLevel.findById(classId);
  if (!classLevel) {
    return res.status(404).json({ message: "Class not found", classId });
  }

  // Determine number of terms
  const numberOfTerms = resultType === "annual" && ["JSS3A", "SS2A", "SS2B"].includes(classLevel.name) ? 2 : 3;

  // Retrieve results for the class
  const results = await model.find({ classLevel: classId });

  // Ensure all results have the same number of subjects
  const numSubsArray = results.map(result => result.subjects.length);
  const numSubs = numSubsArray[0];
  const allSubjectsEqual = numSubsArray.every(num => num === numSubs);

  // if (!allSubjectsEqual) {
  //   return res.status(400).json({ message: "All students must have the same number of subjects" });
  // }

  // Calculate total score and class average
  const totalStudents = results.length;
  const totalScore = results.reduce((sum, result) => sum + result.grandScore, 0);
  const classAverage = totalScore / (numSubs * numberOfTerms * totalStudents);

  // Extract scores and sort
  const scores = results.map(result => ({
    studentId: result.studentId,
    grandScore: result.grandScore
  }));
  scores.sort((a, b) => b.grandScore - a.grandScore);

  // Assign ranks and prepare bulk operations
  let currentRank = 1;
  let previousScore = scores[0]?.grandScore || 0;
  const bulkOps = scores.map((score, index) => {
    if (index > 0 && previousScore !== score.grandScore) {
      currentRank = index + 1;
    }
    previousScore = score.grandScore;
    score.rank = currentRank;

    // let remarks = createGradingFunction(2000);
    //  remarks  = remarks(score.grandScore)

    return {
      updateOne: {
        filter: { studentId: score.studentId, classLevel: classId },
        update: {
          $set: {
            position: score.rank,
            classAverage: classAverage,
            // remarks: remarks
          }
        }
      }
    };
  });

  // Perform bulk update
  if (bulkOps.length > 0) {
    await model.bulkWrite(bulkOps);
  }

  res.status(200).json({
    message: "Class positions calculated successfully",
    scores
  });
});


const getResultByClassId = asyncHandler(async (req, res) => {
  try {
    const results = await StudentResult.find({ classLevel: classId }).populate([
      "studentId",
      "academicYear",
      "academicTerm",
      "classLevel",
    ]);

    if (!results.length) {
      return res.status(404).json({
        status: "fail",
        message: "No results found for this class ID",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Results were successfully found",
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the results",
      error: error.message,
    });
  }
});

const getMasterSheet = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const results = await StudentResult.find({
    classLevel: id,
  }).populate(["studentId"]);
  const formattedData = await processResults(results);

  // Headers should include 'Student Name' and 'Student ID'
  const headers = [
    "studentName",
    "studentID",
    ...new Set(
      results.flatMap((item) =>
        item.subjects.flatMap((subject) => [
          `${subject.name}_1stCA`,
          `${subject.name}_2ndCA`,
          `${subject.name}_Test`,
          `${subject.name}_Exam`,
          `${subject.name}_Total`,
        ])
      )
    ),
    "Total",
    "Average",
    "Position",
    "Remarks",
    "Status",
    "Class",
  ];

  const data = [
    headers,
    ...formattedData.map((item) => headers.map((header) => item[header] || "")),
  ];

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(data);

  xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

  const filePath = "output.xlsx";
  xlsx.writeFile(workbook, filePath);

  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file.");
    } else {
      // console.log("File downloaded successfully.");
    }
  });
});

const uploadAnnualResult = asyncHandler(async (req, res) => {
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
      assessmentType !== "firstTerm" &&
      assessmentType !== "secondTerm" &&
      assessmentType !== "thirdTerm"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment type should be one of the following: firstTerm, secondTerm, thirdTerm",
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
        // console.log(
        //   `Student ${studentData.StudentID} does not exist, skipping.`
        // );
        failureCount++;
        failedRecords.push(studentData.StudentID);
        continue;
      }

      // Check if the student result already exists for the current term and year
      let studentResult = await studentAnnualResult.findOne({
        studentId: student._id.toString(),
        academicYear: currentSession._id.toString(), // Replace with actual ObjectId
        academicTerm: currentTerm._id.toString(), // Replace with actual ObjectId
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

        studentResult = new studentAnnualResult({
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

const getResIds = async (req, res) => {
  const { resultType } = req.query;

  const model = resultType === "annual" ? studentAnnualResult : StudentResult;

  try {
    const results = await model.find().populate("studentId classLevel");
    console.log(results);

    const data = results.map((result) => ({
      resId: result._id,
      studentId: result.studentId._id,
      classLevel: result.studentId.currentClassLevel,
      classLevelName: result?.classLevel?.name || undefined,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student results",
    });
  }
};

const retrieveStudentClass = async (req, res) => {
  try {
    const studentPromises = studentID.map((id) =>
      Student.findOne({ studentId: id }).populate("currentClassLevel")
    );

    const students = await Promise.all(studentPromises);

    const data = students
      .filter((student) => student) // Filter out null or undefined results
      .map((student) => ({
        studentID: student.studentId,
        surname: student.surname,
        othername: student.othername,
        grade: student.grade,
        classID: student.currentClassLevel.name,
      }));

    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving student data." });
  }
};

const printAnnualResult = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const result = await studentAnnualResult
    .findOne({ studentId })
    .populate(["studentId", "academicYear", "academicTerm", "classLevel"]);

  const teacherId = result.classLevel.teachers;
  const teacher = await Teacher.findById(teacherId);
  const teacherSignature = teacher.signature;
  const principal = await Teacher.findOne({ designation: "principal" });
  const principalSignature = principal.signature;

  let studentRes = { data: result };
  const stdImg = studentRes.data.studentId.image;

  try {
    const pdf = await generateAnnualPDF(
      studentRes,
      teacher,
      stdImg,
      teacherSignature,
      principalSignature
    );
    const pdfData = pdf.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${studentRes.data.studentId.studentId}.pdf"`
    );
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "An error occurred while generating the PDF",
      error: error,
    });
  }
});

const allAnnualResults = asyncHandler(async (req, res) => {
  try {
    const results = await studentAnnualResult
      .find()
      .populate(["studentId", "academicYear", "academicTerm"]);
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

const assignResultClassLevel = asyncHandler(async (req, res) => {
  try {
    const results = await StudentResult.find();

    for (const result of results) {
      const student = await Student.findById(result.studentId);
      if (student) {
        await StudentResult.findOneAndUpdate(
          { _id: result._id },
          { classLevel: student.currentClassLevel }
        );
      }
    }

    res.send("Class Level Assigned Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export {
  uploadScores,
  allResults,
  updateResult,
  deleteResult,
  deleteAllResult,
  getResultById,
  generateResultPDFCtrl,
  calResult,
  getResultByClassId,
  getMasterSheet,
  uploadAnnualResult,
  calClassPosition,
  getResIds,
  retrieveStudentClass,
  printAnnualResult,
  allAnnualResults,
  assignResultClassLevel,
};
