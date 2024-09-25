import { faker } from "@faker-js/faker";
import Student from "../models/student.js";
import User from "../models/user.js"; // Assuming you are also creating users for each student
import { generateStudentID } from "../utils/studentUtils.js";

// Function to seed the database
export const generateFakeStudents = async (numStudents, classLevels) => {
  try {
    const students = [];

    for (let i = 0; i < numStudents; i++) {
      const classLevel =
        classLevels[Math.floor(Math.random() * classLevels.length)];
      // Generate random parent info
      const parentSurname = faker.person.lastName();
      const parentOthername = faker.person.firstName();
      const userId = await generateStudentID("2024/2025");
      const surname = faker.person.lastName();
      const othername = faker.person.firstName();

      // Create a User for each student (if needed)
      const user = await User.create({
        username: userId,
        surname: surname,
        othername: othername,
        password: "password",
        userType: "student",
      });

      // Generate a random student
      const student = new Student({
        authUser: user._id, // Reference to the created User
        surname: surname,
        othername: othername,
        studentId: userId, // Custom logic for student ID
        classLevels: [classLevel._id], // Add existing class level IDs if needed
        currentClassLevel: classLevel._id, // This would be set from classLevels if populated
        isGraduated: faker.datatype.boolean(),
        isWithdrawn: faker.datatype.boolean(),
        isSuspended: faker.datatype.boolean(),
        academicYear: null, // Reference to an existing AcademicYear if needed
        program: null, // Reference to an existing Program if needed
        sex: faker.person.gender(), // Male/Female or use faker.random.arrayElement(["Male", "Female"])
        dateOfBirth: faker.date.past(18, new Date("2005-01-01")), // Random date of birth for students
        entrySession: "2024/2025",
        examResults: [], // Add existing exam result IDs if needed
        active: faker.datatype.boolean(),
        parentSurname: parentSurname,
        parentOthername: parentOthername,
        parentOccupation: faker.person.jobTitle(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        healthStatus: faker.helpers.arrayElement([
          "Healthy",
          "Needs attention",
        ]),
        religion: faker.helpers.arrayElement([
          "Christianity",
          "Islam",
          "Others",
        ]),
        paymentStatus: faker.helpers.arrayElement(["Paid", "Not Paid"]),
        currentPayment: null, // Reference to existing payment term if needed
      });

      students.push(student);
    }

    return students;
  } catch (error) {
    console.error("Error seeding students:", error);
  }
};
