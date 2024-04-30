import Student from "../../models/student.js";

const registerStudent = async (req, res) => {
  try {
    // Destructure required fields from request body
    const {
      surname,
      othernames,
      email,
      password,
      classLevels,
      dateOfBirth,
      sex,
      dateOfAdmission,
      entrySession,
      parentSurname,
      parentOthernames,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
    } = req.body;

    // Create a new instance of Student model
    const student = new Student({
      surname,
      othernames,
      entrySession,
      email,
      password,
      dateOfBirth,
      sex,
      dateOfAdmission,
      parentSurname,
      parentOthernames,
      parentOccupation,
      phone,
      address,
      healthStatus,
      religion,
    });

    // Save the student instance to the database
    const savedStudent = await student.save();

    // Respond with success message and the saved student data
    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: savedStudent,
    });
  } catch (error) {
    // Handle errors
    console.error("Error registering student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register student",
      error: error.message,
    });
  }
};

const getStudent = async (req, res) => {
  try {
    // Fetch all students from the database
    const students = await Student.find();

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

export { registerStudent, getStudent };
