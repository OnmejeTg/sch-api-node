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

async function generatePDF(student, studentPhotoUrl, teacherSignature) {
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
  //TODO:get result signature
  // const signatureUrl = student.data.

  const signature = await getImageBase64(teacherSignature);
  drawFooter(doc, pageWidth, result.remarks, signature);

  return doc;
}


//TODO: remove this result and Add proper remarks
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




export { generatePDF };
