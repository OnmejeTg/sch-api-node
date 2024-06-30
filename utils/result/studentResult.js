// main.js
import { jsPDF } from "jspdf";
import { getImageBase64 } from "./imageUtils.js";
import {
  drawHeader,
  drawStudentInfo,
  drawScoreSheet,
  drawAffirmativeSkills,
  drawPsychomotorSkills,
  drawSummary,
  drawFooter,
} from "./pdfUtils.js";
import { CONSTANTS } from "./constants.js";

async function generatePDF(student, studentPhotoUrl) {
  const { PAGE_PADDING, LOGO_SIZE } = CONSTANTS;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // const studentPhotoData = await getImageBase64(
  //   "https://res.cloudinary.com/tgod/image/upload/v1716675830/test/studentProfile/ouxtqdcjjynbgvewx2oj.jpg"
  // );
  const studentPhotoData = await getImageBase64(studentPhotoUrl);

  doc.addImage(
    studentPhotoData,
    "JPEG",
    pageWidth - LOGO_SIZE - PAGE_PADDING,
    PAGE_PADDING,
    LOGO_SIZE,
    LOGO_SIZE
  );

  const logoData = await getImageBase64(
    "https://res.cloudinary.com/tgod/image/upload/v1717765917/test/h9pcydfkzalhz6lw6qhj.jpg"
  );
  doc.addImage(
    logoData,
    "jpg",
    PAGE_PADDING,
    PAGE_PADDING,
    LOGO_SIZE,
    LOGO_SIZE
  );

  // const { width: pageWidth } = doc.internal.pageSize;

  drawHeader(doc, pageWidth);
  drawStudentInfo(doc, student);
  drawScoreSheet(doc, student.data);
  drawAffirmativeSkills(doc, student.data);
  drawPsychomotorSkills(doc, student.data);
  drawSummary(doc, student.data);
  drawFooter(doc, pageWidth, result.remarks);

  return doc;
}

// Usage

// const sample = {
//   name: "John Doe",
//   admissionId: "12345",
//   class: "SS 2",
//   session: "2023/2024",
//   term: "First Term",
//   numberInClass: "1",
//   classTeacher: "Mr. Smith",
//   totalDaysInTerm: "60",
//   totalDaysPresent: "58",
//   result: {
//     subjects: [
//       {
//         name: "Mathematics",
//         firstCA: 10,
//         secondCA: 9,
//         test: 8,
//         exam: 70,
//         total: 97,
//         avg: 95,
//         highest: 97,
//         lowest: 90,
//         position: 1,
//         grade: "A",
//       },
//       // ...more subjects
//     ],
//   },
//   affirmativeSkills: {
//     punctuality: 5,
//     politeness: 4,
//     // ...more skills
//   },
//   psychomotorSkills: {
//     handwriting: 5,
//     games_sport: 4,
//     // ...more skills
//   },
//   summary: {
//     totalMarks: "590",
//     studentAvg: "95",
//     classAvg: "85",
//     position: "1",
//   },
//   teacherRemark: "Excellent performance!",
//   nextTermBegins: "15th September, 2023",
//   teacher: "Mr. Smith",
//   principal: "Dr. Johnson",
// };

const result = {
  subjects: [
    {
      name: "Mathematics",
      firstCA: 8,
      secondCA: 7,
      test: 9,
      exam: 65,
      total: 89,
      avg: 85,
      highest: 95,
      lowest: 60,
      position: 2,
      grade: "A",
    },
    {
      name: "English",
      firstCA: 9,
      secondCA: 8,
      test: 7,
      exam: 60,
      total: 84,
      avg: 80,
      highest: 90,
      lowest: 55,
      position: 3,
      grade: "A",
    },
    // Add more subjects as needed
  ],
  affirmativeSkills: {
    punctuality: 4,
    politeness: 5,
    neatness: 4,
    honesty: 5,
    leadership_skill: 3,
    cooperation: 4,
    attentiveness: 5,
    perseverance: 4,
    attitude_to_work: 5,
  },
  psychomotorSkills: {
    handwriting: 4,
    verbal_fluency: 4,
    sports: 5,
    handling_tools: 3,
    drawing: 4,
  },
  summary: {
    marksObtainable: 500,
    marksObtained: 450,
    percentage: 90,
    grade: "A",
    position: 1,
  },
  remarks: {
    classTeacher: "Good performance.",
    headTeacher: "Keep up the good work.",
  },
};


const sample = {
  "success": true,
  "message": "Result was successfully found",
  "data": {
      "_id": "665d965403ca185be0003d4b",
      "studentId": {
          "_id": "6658ace529fe567b3aa2e7f7",
          "surname": "John",
          "othername": "Johnson",
          "image": "https://res.cloudinary.com/tgod/image/upload/v1716561104/test/swpzzvle2je29zkbyldz.png",
          "studentId": "MCSSW-22-001",
          "classLevels": [
              "66421b628ef01372ddfea829"
          ],
          "isGraduated": false,
          "isWithdrawn": false,
          "isSuspended": false,
          "sex": "male",
          "dateOfBirth": "2000-09-08T00:00:00.000Z",
          "entrySession": "2022/2023",
          "examResults": [],
          "active": true,
          "parentSurname": "Bill",
          "parentOthername": "Johnson",
          "parentOccupation": "Dev",
          "phone": "090878372672",
          "address": "Home",
          "email": "jj@email.com",
          "healthStatus": "Healthy",
          "religion": "Christainity",
          "paymentStatus": "Not Paid",
          "currentClassLevel": "66421b628ef01372ddfea829",
          "createdAt": "2024-05-30T16:44:21.192Z",
          "updatedAt": "2024-05-30T16:44:21.658Z",
          "__v": 0,
          "authUser": "6658ace529fe567b3aa2e7f9"
      },
      "subjects": [
          {
              "average": 0,
              "highest": 0,
              "lowest": 0,
              "position": 0,
              "name": "ENG",
              "assessment1": 22,
              "assessment2": 0,
              "assessment3": 0,
              "exam": 0,
              "total": 22,
              "grade": "F",
              "_id": "665d965403ca185be0003d4c"
          },
          {
              "average": 0,
              "highest": 0,
              "lowest": 0,
              "position": 0,
              "name": "MTH",
              "assessment1": 12,
              "assessment2": 0,
              "assessment3": 0,
              "exam": 0,
              "total": 12,
              "grade": "F",
              "_id": "665d965403ca185be0003d4d"
          },
          {
              "average": 0,
              "highest": 0,
              "lowest": 0,
              "position": 0,
              "name": "SCI",
              "assessment1": 7,
              "assessment2": 0,
              "assessment3": 0,
              "exam": 0,
              "total": 7,
              "grade": "F",
              "_id": "665d965403ca185be0003d4e"
          },
          {
              "average": 0,
              "highest": 0,
              "lowest": 0,
              "position": 0,
              "name": "CMP",
              "assessment1": 37,
              "assessment2": 0,
              "assessment3": 0,
              "exam": 0,
              "total": 37,
              "grade": "F",
              "_id": "665d965403ca185be0003d4f"
          },
          {
              "average": 0,
              "highest": 0,
              "lowest": 0,
              "position": 0,
              "name": "TECH",
              "assessment1": 22,
              "assessment2": 0,
              "assessment3": 0,
              "exam": 0,
              "total": 22,
              "grade": "F",
              "_id": "665d965403ca185be0003d50"
          }
      ],
      "average": 20,
      "grandScore": 100,
      "passMark": 50,
      "status": "failed",
      "remarks": "Poor",
      "position": 0,
      "classLevel": {
          "_id": "66421b628ef01372ddfea829",
          "name": "JSS1A",
          "description": "Junior Secondary",
          "createdBy": "663b47ed8c6b52b66f271d02",
          "students": [],
          "subjects": [],
          "teachers": [],
          "createdAt": "2024-05-13T13:53:38.663Z",
          "updatedAt": "2024-05-13T13:53:38.663Z",
          "__v": 0
      },
      "academicTerm": {
          "_id": "6657d6c6ddb4401185d80ca5",
          "name": "first term",
          "description": "This the first term for 2023/2024",
          "duration": "4 months",
          "isCurrent": true,
          "createdBy": "664622703e4f552f1cbb0adf",
          "academicYear": "6640769b5c3b9ae40eaaf0dd",
          "createdAt": "2024-05-30T01:30:46.856Z",
          "updatedAt": "2024-05-30T01:36:10.329Z",
          "__v": 0
      },
      "academicYear": {
          "_id": "66407c202d008cc52e0d3317",
          "name": "2024/2025",
          "fromYear": "2023-01-01T00:00:00.000Z",
          "toYear": "2024-01-01T00:00:00.000Z",
          "isCurrent": true,
          "createdBy": "663b47ed8c6b52b66f271d02",
          "students": [],
          "teachers": [],
          "createdAt": "2024-05-12T08:21:52.718Z",
          "updatedAt": "2024-06-06T21:29:42.900Z",
          "__v": 0
      },
      "isPublished": false,
      "createdAt": "2024-06-03T10:09:24.413Z",
      "updatedAt": "2024-06-03T10:09:24.413Z",
      "__v": 0
  }
}

export { generatePDF, sample, result };
