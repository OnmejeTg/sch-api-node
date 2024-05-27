import StudentResult from "../../models/studentResult.js";
import asyncHandler from "express-async-handler";
import xlsx from "xlsx";
import Student from "../../models/student.js";

const uploadScores = asyncHandler(async (req, res) => {
    try {
      const { assessmentType } = req.body;
      console.log(assessmentType);
  
      if (
        assessmentType !== "assessment1" &&
        assessmentType !== "assessment2" &&
        assessmentType !== "assessment3" &&
        assessmentType !== "exam"
      ) {
        return res.status(400).json({
          success: false,
          message: "Assessment type should be one of the following: assessment1, assessment2, assessment3, or exam",
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
          admissionId: studentData.StudentID,
        });
        console.log(student);
  
        if (!student) {
          console.log(`Student ${studentData.StudentID} does not exist, skipping.`);
          failureCount++;
          failedRecords.push(studentData.StudentID);
          continue;
        }
  
        // Check if the student result already exists for the current term and year
        let studentResult = await StudentResult.findOne({
          studentId: student._id,
          academicTerm: "academicTermObjectId", // Replace with actual ObjectId
          academicYear: "academicYearObjectId", // Replace with actual ObjectId
        });
  
        if (studentResult) {
          // Update existing student result
          for (const [key, value] of Object.entries(studentData)) {
            if (key !== "StudentID") {
              const subject = studentResult.subjects.find(sub => sub.name === key);
              if (subject) {
                subject[assessmentType] = value;
              } else {
                studentResult.subjects.push({ name: key, [assessmentType]: value });
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
            classLevel: "classLevelObjectId", // Replace with actual ObjectId
            academicTerm: "academicTermObjectId", // Replace with actual ObjectId
            academicYear: "academicYearObjectId", // Replace with actual ObjectId
          });
        }
  
        // Save the instance to the database
        try {
          await studentResult.save();
          console.log(`Student result for ${studentData.StudentID} ${studentResult ? 'updated' : 'created'} successfully`);
          successCount++;
        } catch (saveError) {
          console.error(`Error saving student result for ${studentData.StudentID}:`, saveError);
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
      res.status(500).json({ message: "An error occurred while processing the upload" });
    }
  });

export { uploadScores };
