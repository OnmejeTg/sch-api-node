import Student from "../models/student.js";
import { promises as fs } from "fs";
import path from "path";

import ClassLevel from "../models/classModel.js";

import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const counterFilePath = path.join(__dirname, "counter.txt");

const readCounter = async () => {
  try {
    const data = await fs.readFile(counterFilePath, "utf8");
    return parseInt(data, 10);
  } catch (error) {
    console.error("Error reading counter file:", error);
    throw new Error("Failed to read counter file");
  }
};

const getLastStudentId = async (entrySession) => {
  try {
    // Fetch the last student in the given entry session
    const lastStudent = await Student.findOne({ entrySession })
      .sort({ studentId: -1 })
      .exec();

    if (lastStudent) {
      // Extract the last student ID and increment it
      const lastNumber = lastStudent.studentId.match(/\d+$/)[0];
      const incrementedNumber = incrementLastNumber(lastNumber);

      // Generate the new student ID
      const newStudentId = lastStudent.studentId.replace(
        /\d+$/,
        incrementedNumber
      );
      return newStudentId;
    } else {
      // If no last student found, return the initial student ID
      return `MCSSW-${entrySession.slice(2, 4)}-001`;
    }
  } catch (error) {
    console.error("Error fetching last student ID:", error);
    throw new Error("Failed to fetch last student ID");
  }
};

const writeCounter = async (value) => {
  try {
    await fs.writeFile(counterFilePath, String(value), "utf8");
  } catch (error) {
    console.error("Error writing counter file:", error);
    throw new Error("Failed to write counter file");
  }
};

const generateStudentID = async function (entrySession) {
  try {
    // Read the current counter value
    let start = await readCounter();

    // Generate the student ID
    const paddedCount = String(start).padStart(3, "0"); // Pad the count with leading zeros
    const studentId = `MCSSW-${entrySession.slice(2, 4)}-${paddedCount}`;

    // Increment the counter value
    start += 1;

    // Write the new counter value back to the file
    await writeCounter(start);

    return studentId;
  } catch (error) {
    console.error("Error generating student ID:", error);
    throw new Error("Failed to generate student ID");
  }
};

function incrementLastNumber(str) {
  return str.replace(/(\d+)(?!.*\d)/, (match) => {
    const incremented = parseInt(match, 10) + 5; // Increment the last number
    return incremented; // Replace with the incremented value
  });
}

const isValidUserData = (userData) => {
  return userData && userData.surname && userData.othername && userData.email;
};

async function processResults(results) {
  // Fetch class level names for all items
  const classLevelNames = await Promise.all(
    results.map(async (item) => {
      const classLevel = await ClassLevel.findById(item.classLevel);
      // console.log('class level', classLevel)
      // console.log('class level names',classLevelNames)
      return classLevel.name;
    })
  );

  // Format the data
  const formattedData = results.map((item, index) => {
    const scores = item.subjects.reduce((acc, subject) => {
      acc[`${subject.name}_1stCA`] = subject.assessment1;
      acc[`${subject.name}_2ndCA`] = subject.assessment2;
      acc[`${subject.name}_Test`] = subject.assessment3;
      acc[`${subject.name}_Exam`] = subject.exam;
      acc[`${subject.name}_Total`] = subject.total;
      return acc;
    }, {});

    console.log(classLevelNames[index]);

    return {
      studentName: `${item.studentId.surname} ${item.studentId.othername}`,
      studentID: item.studentId.studentId,
      ...scores,
      Total: item.grandScore,
      Average: item.average,
      Position: item.position,
      Remarks: item.remarks,
      Status: item.status,
      Class: classLevelNames[index],
    };
  });

  return formattedData;
}

export {
  generateStudentID,
  isValidUserData,
  processResults,
  incrementLastNumber,
  getLastStudentId,
};
