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

async function generatePDF(student) {
  const { PAGE_PADDING, LOGO_SIZE } = CONSTANTS;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  const studentPhotoData = await getImageBase64(
    "https://res.cloudinary.com/tgod/image/upload/v1716675830/test/studentProfile/ouxtqdcjjynbgvewx2oj.jpg"
  );

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
    "JPEG",
    PAGE_PADDING,
    PAGE_PADDING,
    LOGO_SIZE,
    LOGO_SIZE
  );

  // const { width: pageWidth } = doc.internal.pageSize;

  drawHeader(doc, pageWidth);
  drawStudentInfo(doc, student);
  drawScoreSheet(doc, student.result);
  drawAffirmativeSkills(doc, student.affirmativeSkills);
  drawPsychomotorSkills(doc, student.psychomotorSkills);
  drawSummary(doc, student.summary);
  drawFooter(doc, pageWidth, result.remarks);

  return doc;
}

// Usage

const sample = {
  name: "John Doe",
  admissionId: "12345",
  class: "SS 2",
  session: "2023/2024",
  term: "First Term",
  numberInClass: "1",
  classTeacher: "Mr. Smith",
  totalDaysInTerm: "60",
  totalDaysPresent: "58",
  result: {
    subjects: [
      {
        name: "Mathematics",
        firstCA: 10,
        secondCA: 9,
        test: 8,
        exam: 70,
        total: 97,
        avg: 95,
        highest: 97,
        lowest: 90,
        position: 1,
        grade: "A",
      },
      // ...more subjects
    ],
  },
  affirmativeSkills: {
    punctuality: 5,
    politeness: 4,
    // ...more skills
  },
  psychomotorSkills: {
    handwriting: 5,
    games_sport: 4,
    // ...more skills
  },
  summary: {
    totalMarks: "590",
    studentAvg: "95",
    classAvg: "85",
    position: "1",
  },
  teacherRemark: "Excellent performance!",
  nextTermBegins: "15th September, 2023",
  teacher: "Mr. Smith",
  principal: "Dr. Johnson",
};

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

export { generatePDF, sample, result };
