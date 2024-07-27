import StudentResult from "../../models/studentResult.js";
import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import Student from "../../models/student.js";
import { Result, validationResult } from "express-validator";
import AcademicYear from "../../models/academicYear.js";
import AcademicTerm from "../../models/academicTerm.js";
import { generatePDF } from "../../utils/result/studentResult.js";
import axios from "axios";
import Teacher from "../../models/teacher.js";
import studentAnnualResult from "../../models/studentAnnualResult.js";

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
  const teacher = await Teacher.findById(teacherId);
  const teacherSignature = teacher.signature;
  const principal  =  await Teacher.findOne({'designation': 'principal'})
  const principalSignature = principal.signature;
  
  let studentRes = { data: result };
  const stdImg = studentRes.data.studentId.image;

  try {
    const pdf = await generatePDF(studentRes, teacher, stdImg, teacherSignature, principalSignature);
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
  const { classId } = req.body;
  const results = await StudentResult.find({ classLevel: classId });

  // Initialize a dictionary to hold scores by subject
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
  Object.keys(subjectScores).forEach((subjectName) => {
    const scores = subjectScores[subjectName];

    // Calculate average
    const totalScore = scores.reduce((sum, score) => sum + score.total, 0);
    const average = totalScore / scores.length;

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
  });

  // Save updated results to the database
  await Promise.all(results.map((result) => result.save()));

  res.json({
    status: "success",
    message: "Results were successfully calculated",
    count: results.length,
    data: results,
  });
});


const calClassPosition = asyncHandler(async (req, res) => {
  const { classId } = req.body;
  const results = await StudentResult.find({ classLevel: classId });

  // Extract scores
  const scores = results.map(result => ({
    studentId: result.studentId,
    grandScore: result.grandScore
  }));

  // Calculate total score and average
  const totalScore = scores.reduce((sum, score) => sum + score.grandScore, 0);
  const classAverage = totalScore / (scores.length * 10);

  // Sort scores in descending order
  scores.sort((a, b) => b.grandScore - a.grandScore);

  // Assign ranks and calculate grades
  let currentRank = 1;
  let previousScore = scores[0]?.grandScore || 0;
  const bulkOps = [];

  scores.forEach((score, index) => {
    if (index > 0 && previousScore !== score.grandScore) {
      currentRank = index + 1;
    }
    previousScore = score.grandScore;
    score.rank = currentRank;

    let remarks = '';
    if (score.grandScore >= 750) {
      remarks = "A";
    } else if (score.grandScore >= 650) {
      remarks = "B";
    } else if (score.grandScore >= 550) {
      remarks = "C";
    } else if (score.grandScore >= 400) {
      remarks = "D";
    } else {
      remarks = "F";
    }

    bulkOps.push({
      updateOne: {
        filter: { studentId: score.studentId, classLevel: classId },
        update: { $set: { position: score.rank, classAverage, remarks } }
      }
    });
  });

  // Perform bulk update
  if (bulkOps.length > 0) {
    await StudentResult.bulkWrite(bulkOps);
  }

  res.status(200).json({
    message: 'Class positions calculated successfully',
    scores: scores
  });
});



const getResultByClassId = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
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
  const { id } = req.params.id;
  const results = await StudentResult.find({
    "studentId.currentClassLevel": id,
  }).populate(["studentId"]);

  const formattedData = results.map((item) => {
    const scores = item.subjects.reduce((acc, subject) => {
      acc[`${subject.name}_1stCA`] = subject.assessment1;
      acc[`${subject.name}_2ndCA`] = subject.assessment2;
      acc[`${subject.name}_Test`] = subject.assessment3;
      acc[`${subject.name}_Exam`] = subject.exam;
      acc[`${subject.name}_Total`] = subject.total;
      return acc;
    }, {});

    return {
      studentName: `${item.studentId.surname} ${item.studentId.othername}`,
      studentID: item.studentId.studentId,
      ...scores,
      Total: item.grandScore,
      Average: item.average,
      Position: item.position,
      Remarks: item.remarks,
      Status: item.status,
    };
  });

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
      console.log("File downloaded successfully.");
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
      assessmentType !== "thridTerm"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment type should be one of the following: firstTerm, secondTerm, thridTerm",
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
  try {
    const results = await StudentResult.find().populate(['studentId','classLevel']); // Assuming studentId is a reference

    const data = results.map(result => ({
      resId: result._id,
      studentId: result.studentId._id,
      classLevel: result.studentId.currentClassLevel,
      classLevelName: result.classLevel.name
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ success: false, message: "Error fetching student results" });
  }
};



const studentID = [
  "MCSSW-19-177", "MCSSW-19-180", "MCSSW-19-187", "MCSSW-19-188", "MCSSW-19-189", 
  "MCSSW-19-190", "MCSSW-19-191", "MCSSW-19-192", "MCSSW-19-193", "MCSSW-19-194", 
  "MCSSW-19-195", "MCSSW-19-199", "MCSSW-19-200", "MCSSW-20-142", "MCSSW-20-145", 
  "MCSSW-20-146", "MCSSW-20-148", "MCSSW-20-150", "MCSSW-20-152", "MCSSW-20-153", 
  "MCSSW-20-157", "MCSSW-20-158", "MCSSW-20-163", "MCSSW-20-169", "MCSSW-20-176", 
  "MCSSW-20-178", "MCSSW-20-184", "MCSSW-20-196", "MCSSW-20-198", "MCSSW-21-093", 
  "MCSSW-21-094", "MCSSW-21-095", "MCSSW-21-096", "MCSSW-21-097", "MCSSW-21-098", 
  "MCSSW-21-099", "MCSSW-21-100", "MCSSW-21-101", "MCSSW-21-102", "MCSSW-21-103", 
  "MCSSW-21-104", "MCSSW-21-105", "MCSSW-21-106", "MCSSW-21-107", "MCSSW-21-108", 
  "MCSSW-21-109", "MCSSW-21-110", "MCSSW-21-111", "MCSSW-21-112", "MCSSW-21-113", 
  "MCSSW-21-114", "MCSSW-21-116", "MCSSW-21-117", "MCSSW-21-118", "MCSSW-21-119", 
  "MCSSW-21-120", "MCSSW-21-122", "MCSSW-21-123", "MCSSW-21-124", "MCSSW-21-125", 
  "MCSSW-21-126", "MCSSW-21-127", "MCSSW-21-128", "MCSSW-21-129", "MCSSW-21-135", 
  "MCSSW-21-136", "MCSSW-21-137", "MCSSW-21-139", "MCSSW-21-149", "MCSSW-21-151", 
  "MCSSW-21-159", "MCSSW-21-162", "MCSSW-21-170", "MCSSW-21-175", "MCSSW-21-182", 
  "MCSSW-22-051", "MCSSW-22-053", "MCSSW-22-054", "MCSSW-22-055", "MCSSW-22-056", 
  "MCSSW-22-057", "MCSSW-22-059", "MCSSW-22-061", "MCSSW-22-062", "MCSSW-22-064", 
  "MCSSW-22-065", "MCSSW-22-066", "MCSSW-22-069", "MCSSW-22-072", "MCSSW-22-073", 
  "MCSSW-22-074", "MCSSW-22-075", "MCSSW-22-077", "MCSSW-22-078", "MCSSW-22-080", 
  "MCSSW-22-081", "MCSSW-22-082", "MCSSW-22-083", "MCSSW-22-084", "MCSSW-22-085", 
  "MCSSW-22-086", "MCSSW-22-087", "MCSSW-22-115", "MCSSW-22-121", "MCSSW-22-141", 
  "MCSSW-22-147", "MCSSW-22-155", "MCSSW-22-156", "MCSSW-22-165", "MCSSW-22-167", 
  "MCSSW-22-172", "MCSSW-22-179", "MCSSW-22-181", "MCSSW-22-183", "MCSSW-22-186", 
  "MCSSW-22-197", "MCSSW-23-001", "MCSSW-23-002", "MCSSW-23-003", "MCSSW-23-004", 
  "MCSSW-23-005", "MCSSW-23-006", "MCSSW-23-007", "MCSSW-23-008", "MCSSW-23-009", 
  "MCSSW-23-010", "MCSSW-23-011", "MCSSW-23-012", "MCSSW-23-013", "MCSSW-23-014", 
  "MCSSW-23-015", "MCSSW-23-016", "MCSSW-23-017", "MCSSW-23-018", "MCSSW-23-019", 
  "MCSSW-23-020", "MCSSW-23-021", "MCSSW-23-022", "MCSSW-23-023", "MCSSW-23-024", 
  "MCSSW-23-025", "MCSSW-23-026", "MCSSW-23-027", "MCSSW-23-028", "MCSSW-23-029", 
  "MCSSW-23-030", "MCSSW-23-031", "MCSSW-23-032", "MCSSW-23-033", "MCSSW-23-034", 
  "MCSSW-23-035", "MCSSW-23-036", "MCSSW-23-037", "MCSSW-23-038", "MCSSW-23-039", 
  "MCSSW-23-040", "MCSSW-23-041", "MCSSW-23-042", "MCSSW-23-043", "MCSSW-23-044", 
  "MCSSW-23-045", "MCSSW-23-046", "MCSSW-23-047", "MCSSW-23-048", "MCSSW-23-049", 
  "MCSSW-23-050", "MCSSW-23-052", "MCSSW-23-058", "MCSSW-23-060", "MCSSW-23-063", 
  "MCSSW-23-067", "MCSSW-23-068", "MCSSW-23-070", "MCSSW-23-071", "MCSSW-23-076", 
  "MCSSW-23-079", "MCSSW-23-088", "MCSSW-23-089", "MCSSW-23-090", "MCSSW-23-091", 
  "MCSSW-23-092", "MCSSW-23-130", "MCSSW-23-131", "MCSSW-23-132", "MCSSW-23-133", 
  "MCSSW-23-134", "MCSSW-23-138", "MCSSW-23-140", "MCSSW-23-143", "MCSSW-23-144", 
  "MCSSW-23-154", "MCSSW-23-160", "MCSSW-23-161", "MCSSW-23-164", "MCSSW-23-166", 
  "MCSSW-23-168", "MCSSW-23-171", "MCSSW-23-173", "MCSSW-23-174", "MCSSW-23-185", 
  "MCSSW-23-201", "MCSSW-23-202", "MCSSW-23-203", "MCSSW-23-204", "MCSSW-23-205", 
  "MCSSW-23-206", "MCSSW-23-207", "MCSSW-23-208", "MCSSW-23-209", "MCSSW-23-210", 
  "MCSSW-23-211", "MCSSW-23-212", "MCSSW-23-213", "MCSSW-23-214", "MCSSW-23-215", 
  "MCSSW-23-216", "MCSSW-23-217", "MCSSW-23-218", "MCSSW-23-219", "MCSSW-23-220", 
  "MCSSW-23-221", "MCSSW-23-222", "MCSSW-23-223", "MCSSW-23-224", "MCSSW-23-226", 
  "MCSSW-23-227", "MCSSW-23-228", "MCSSW-23-229", "MCSSW-23-230", "MCSSW-23-231", 
  "MCSSW-23-232", "MCSSW-23-233", "MCSSW-23-235", "MCSSW-23-236", "MCSSW-23-237", 
  "MCSSW-23-238", "MCSSW-23-239", "MCSSW-23-240", "MCSSW-23-241", "MCSSW-23-242", 
  "MCSSW-23-243", "MCSSW-23-244", "MCSSW-23-245", "MCSSW-23-246", "MCSSW-23-247", 
  "MCSSW-23-248", "MCSSW-23-249", "MCSSW-23-250", "MCSSW-23-251", "MCSSW-23-252", 
  "MCSSW-23-254", "MCSSW-23-256", "MCSSW-23-257", "MCSSW-23-258", "MCSSW-23-259", 
  "MCSSW-23-261", "MCSSW-23-262", "MCSSW-23-263", "MCSSW-23-264", "MCSSW-23-265", 
  "MCSSW-23-266", "MCSSW-23-267", "MCSSW-23-268", "MCSSW-23-271", "MCSSW-23-274", 
  "MCSSW-23-275", "MCSSW-23-276", "MCSSW-23-277", "MCSSW-23-278", "MCSSW-23-279", 
  "MCSSW-23-280", "MCSSW-23-281", "MCSSW-23-282", "MCSSW-23-283"
]


const retrieveStudentClass = async (req, res) => {
  try {
    const studentPromises = studentID.map(id => 
      Student.findOne({ studentId: id }).populate('currentClassLevel')
    );
    
    const students = await Promise.all(studentPromises);
    
    const data = students
      .filter(student => student) // Filter out null or undefined results
      .map(student => ({
        studentID: student.studentId,
        surname: student.surname,
        othername: student.othername,
        grade: student.grade,
        classID: student.currentClassLevel.name,
      }));
      
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving student data.' });
  }
};


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
  retrieveStudentClass
};
