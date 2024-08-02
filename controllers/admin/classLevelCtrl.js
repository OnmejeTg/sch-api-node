import asyncHandler from "express-async-handler";
import ClassLevel from "../../models/classModel.js"; // Assuming the path to your model
import Student from "../../models/student.js";
import mongoose from "mongoose";

// Create a new Class Level
const createClassLevel = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if class level already exists
  const existingClassLevel = await ClassLevel.findOne({ name });
  if (existingClassLevel) {
    res.status(400);
    throw new Error("Class level already exists");
  }

  // Create new class level
  const newClassLevel = new ClassLevel({
    name,
    description,
    createdBy: req.user.id, // Assuming req.user.id is available
  });
  await newClassLevel.save();

  res.status(201).json({
    status: "success",
    message: "Class level created successfully",
    data: newClassLevel,
  });
});

// Get all Class Levels
const getClassLevels = asyncHandler(async (req, res) => {
  const classLevels = await ClassLevel.find();
  //   const classLevels = await ClassLevel.find().populate(
  //     "students subjects teachers"
  //   );
  res.status(200).json({
    status: "success",
    data: classLevels,
  });
});

// Update a Class Level
const updateClassLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, students, subjects, teachers } = req.body;

  let classLevel = await ClassLevel.findById(id);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  classLevel.name = name || classLevel.name;
  classLevel.description = description || classLevel.description;
  classLevel.students = students || classLevel.students;
  classLevel.subjects = subjects || classLevel.subjects;
  classLevel.teachers = teachers || classLevel.teachers;

  await classLevel.save();

  res.status(200).json({
    status: "success",
    message: "Class level updated successfully",
    data: classLevel,
  });
});

// Delete a Class Level
const deleteClassLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classLevel = await ClassLevel.findByIdAndDelete(id);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  res.status(200).json({
    status: "success",
    message: "Class level deleted successfully",
    data: classLevel,
  });
});

// Get a single Class Level by ID
const getClassLevelById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  //   const classLevel = await ClassLevel.findById(id).populate(
  //     "students subjects teachers"
  //   );
  const classLevel = await ClassLevel.findById(id);
  console.log(classLevel.numOfStudents);
  if (!classLevel) {
    res.status(404);
    throw new Error("Class level not found");
  }

  res.status(200).json({
    status: "success",
    data: classLevel,
  });
});

const getStudentsByClassLevel = asyncHandler(async (req, res) => {
  try {
    const classLevel = req.params.id;
    const students = await Student.find({ currentClassLevel: classLevel });
    console.log('student found:', students.length);

    if (!students || students.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No students found for the given class level",
      });
    }

    res.status(200).json({
      status: "success",
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

const addStudentToClass = asyncHandler(async (req, res) => {
  try {
    const classLevelId = req.params.id;

    // Validate classLevelId (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(classLevelId)) {
      return res.status(400).json({ message: 'Invalid class level ID' });
    }

    // Efficiently fetch students and class level in a single query
    const [students, classLevel] = await Promise.all([
      Student.find({ currentClassLevel: classLevelId }), // Filter students by class level
      ClassLevel.findById(classLevelId)
    ]);

    if (!classLevel) {
      return res.status(404).json({ message: 'Class level not found' });
    }

    // Efficient bulk update using updateMany with upsert option
    const studentIds = students.map(student => student._id);
    const update = {
      $addToSet: { students: { $each: studentIds } },
      $set: { numOfStudents: studentIds.length }
    };

    const updatedClassLevel = await ClassLevel.findByIdAndUpdate(
      classLevelId,
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Students added successfully', updatedClassLevel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const studentIDs = [
  "MCSSW-19-187",
  "MCSSW-19-188",
  "MCSSW-19-189",
  "MCSSW-19-190",
  "MCSSW-19-191",
  "MCSSW-19-192",
  "MCSSW-19-193",
  "MCSSW-19-194",
  "MCSSW-19-195",
  "MCSSW-19-199",
  "MCSSW-19-200",
  "MCSSW-20-196",
  "MCSSW-20-198",
  "MCSSW-22-197"
];


const assignClass = asyncHandler(async (req, res) => {
  

  if (!Array.isArray(studentIDs)) {
    return res.status(400).json({ message: 'Invalid studentID format' });
  }

  try {
    const updatePromises = studentIDs.map((item) => {
      return Student.findOneAndUpdate({ studentId: item }, { currentClassLevel: req.params.id }, { new: true });
      
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Students assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const codes = [
  "MCSSW-23-005", "MCSSW-23-006", "MCSSW-23-007", "MCSSW-23-008", "MCSSW-23-009", "MCSSW-23-010", 
  "MCSSW-23-011", "MCSSW-23-001", "MCSSW-23-002", "MCSSW-23-004", "MCSSW-23-013", "MCSSW-23-014", 
  "MCSSW-23-015", "MCSSW-23-016", "MCSSW-23-017", "MCSSW-23-018", "MCSSW-23-019", "MCSSW-23-020", 
  "MCSSW-23-021", "MCSSW-23-022", "MCSSW-23-023", "MCSSW-23-024", "MCSSW-23-025", "MCSSW-23-026", 
  "MCSSW-23-027", "MCSSW-23-028", "MCSSW-23-029", "MCSSW-23-030", "MCSSW-23-031", "MCSSW-23-032", 
  "MCSSW-23-033", "MCSSW-23-034", "MCSSW-23-035", "MCSSW-23-036", "MCSSW-23-037", "MCSSW-23-038", 
  "MCSSW-23-039", "MCSSW-23-040", "MCSSW-23-041", "MCSSW-23-042", "MCSSW-23-043", "MCSSW-23-044", 
  "MCSSW-23-045", "MCSSW-23-046", "MCSSW-23-047", "MCSSW-23-048", "MCSSW-23-049", "MCSSW-23-050", 
  "MCSSW-23-231", "MCSSW-22-238", "MCSSW-23-216", "MCSSW-23-012", "MCSSW-23-003", "MCSSW-23-201", 
  "MCSSW-23-202", "MCSSW-23-203", "MCSSW-23-204", "MCSSW-23-205", "MCSSW-23-206", "MCSSW-23-207", 
  "MCSSW-23-208", "MCSSW-23-209", "MCSSW-23-210", "MCSSW-23-211", "MCSSW-23-212", "MCSSW-23-214", 
  "MCSSW-23-215", "MCSSW-23-217", "MCSSW-23-218", "MCSSW-23-219", "MCSSW-23-220", "MCSSW-23-221", 
  "MCSSW-23-222", "MCSSW-23-223", "MCSSW-23-224", "MCSSW-23-233", "MCSSW-23-239", "MCSSW-23-319", 
  "MCSSW-23-320", "MCSSW-23-321", "MCSSW-23-322", "MCSSW-23-323", "MCSSW-23-324", "MCSSW-22-051", 
  "MCSSW-23-052", "MCSSW-22-053", "MCSSW-22-054", "MCSSW-22-055", "MCSSW-22-056", "MCSSW-22-057", 
  "MCSSW-23-058", "MCSSW-22-059", "MCSSW-23-060", "MCSSW-22-061", "MCSSW-22-062", "MCSSW-23-063", 
  "MCSSW-22-064", "MCSSW-22-065", "MCSSW-22-066", "MCSSW-23-068", "MCSSW-22-069", "MCSSW-23-070", 
  "MCSSW-23-071", "MCSSW-22-072", "MCSSW-22-073", "MCSSW-22-074", "MCSSW-22-075", "MCSSW-23-076", 
  "MCSSW-22-077", "MCSSW-22-078", "MCSSW-23-079", "MCSSW-22-080", "MCSSW-22-081", "MCSSW-22-082", 
  "MCSSW-22-083", "MCSSW-22-084", "MCSSW-22-085", "MCSSW-22-086", "MCSSW-22-087", "MCSSW-23-088", 
  "MCSSW-23-089", "MCSSW-23-090", "MCSSW-23-091", "MCSSW-23-092", "MCSSW-23-226", "MCSSW-23-333", 
  "MCSSW-23-334", "MCSSW-23-335", "MCSSW-23-336", "MCSSW-23-132", "MCSSW-23-133", "MCSSW-23-134", 
  "MCSSW-21-135", "MCSSW-21-136", "MCSSW-21-137", "MCSSW-23-138", "MCSSW-21-139", "MCSSW-23-140", 
  "MCSSW-23-213", "MCSSW-23-229", "MCSSW-23-325", "MCSSW-22-141", "MCSSW-20-142", "MCSSW-23-143", 
  "MCSSW-23-144", "MCSSW-20-145", "MCSSW-20-146", "MCSSW-22-147", "MCSSW-20-148", "MCSSW-21-149", 
  "MCSSW-20-150", "MCSSW-21-151", "MCSSW-20-152", "MCSSW-20-153", "MCSSW-23-154", "MCSSW-22-155", 
  "MCSSW-22-156", "MCSSW-20-157", "MCSSW-20-158", "MCSSW-21-159", "MCSSW-23-160", "MCSSW-23-161", 
  "MCSSW-21-162", "MCSSW-23-241", "MCSSW-23-326", "MCSSW-23-327", "MCSSW-20-163", "MCSSW-23-164", 
  "MCSSW-22-165", "MCSSW-23-166", "MCSSW-22-167", "MCSSW-23-168", "MCSSW-20-169", "MCSSW-23-328", 
  "MCSSW-23-329", "MCSSW-23-330"
];

const getStudentClass = asyncHandler(async (req, res) => {
  const classLevel = await Promise.all(codes.map(async (id) => {
    const student = await Student.findOne({ studentId: id }).populate(['currentClassLevel']);
    if (student && student.currentClassLevel && student.currentClassLevel.name) {
      return {
        studentId: id,
        className: student.currentClassLevel.name
      };
    }
    return null; // To filter out later
  }));

  return res.json(classLevel.filter(entry => entry !== null));
});



export {
  createClassLevel,
  getClassLevels,
  updateClassLevel,
  deleteClassLevel,
  getClassLevelById,
  getStudentsByClassLevel,
  addStudentToClass,
  assignClass,
  getStudentClass
};
