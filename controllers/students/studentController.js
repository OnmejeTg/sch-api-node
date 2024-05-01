import Student from "../../models/student.js";

//LOGIN
const login = async (req, res) => {
  // Step 1: Data Validation
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Both username and password are required.",
    });
  }

  try {
    // Step 2: Find the student in the database
    const student = await Student.findOne({ admissionId: username });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Step 3: Verify password
    const isPasswordValid = await student.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Step 4: Respond with successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        id: student._id,
        username: student.fullName(),
        // Include other necessary student information here
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login.",
    });
  }
};

//LOGOUT
const logout = async (req, res) => {
  console.log("logout");
};

//Create
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

//Get all students
const getStudents = async (req, res) => {
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

export { registerStudent, getStudents, login, logout };
