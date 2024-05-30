import Student from "../models/student.js";

const generateStudentID = async function (entrySession) {
  try {
    const count = await Student.countDocuments();
    const paddedCount = String(count + 1).padStart(3, '0'); // Pad the count with leading zeros
    const studentId = `MCSSW-${entrySession.slice(2, 4)}-${paddedCount}`;
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
