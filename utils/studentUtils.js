import Student from "../models/student.js";
import { promises as fs } from 'fs';
import path from 'path';


import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const counterFilePath = path.join(__dirname, 'counter.txt');

const readCounter = async () => {
  try {
    const data = await fs.readFile(counterFilePath, 'utf8');
    return parseInt(data, 10);
  } catch (error) {
    console.error("Error reading counter file:", error);
    throw new Error("Failed to read counter file");
  }
};

const writeCounter = async (value) => {
  try {
    await fs.writeFile(counterFilePath, String(value), 'utf8');
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
    const paddedCount = String(start).padStart(3, '0'); // Pad the count with leading zeros
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




const isValidUserData = (userData) => {
  return userData && userData.surname && userData.othername && userData.email;
};

export { generateStudentID, isValidUserData };
