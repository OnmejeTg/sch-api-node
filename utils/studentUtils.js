import Student from "../models/student.js";
import { promises as fs } from 'fs';
import path from 'path';

import ClassLevel from "../models/classModel.js";

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




async function processResults(results) {
  // Fetch class level names for all items
  const classLevelNames = await Promise.all(results.map(async (item) => {
    const classLevel = await ClassLevel.findById(item.classLevel);
    // console.log('class level', classLevel)
    // console.log('class level names',classLevelNames)
    return classLevel.name;
  }));

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

    console.log(classLevelNames[index])

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



export { generateStudentID, isValidUserData , processResults };
