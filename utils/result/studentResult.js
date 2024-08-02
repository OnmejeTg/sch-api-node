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
import {
  drawAnnualHeader,
  drawAnnualStudentInfo,
  drawAnnualScoreSheet,
  drawAnnualAffirmativeSkills,
  drawAnnualPsychomotorSkills,
  drawAnnualSummary,
  drawAnnualFooter,
} from "./annualPDFUtils.js"
import { CONSTANTS } from "./constants.js";

async function generatePDF(
  student,
  teacher,
  studentPhotoUrl,
  teacherSignatureUrl,
  principalSignatureUrl
) {
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
  drawStudentInfo(doc, student, teacher);
  drawScoreSheet(doc, student.data);
  drawAffirmativeSkills(doc, student.data);
  drawPsychomotorSkills(doc, student.data);
  drawSummary(doc, student.data);
  //TODO:get result signature
  // const signatureUrl = student.data.

  const teacherSignature = await getImageBase64(teacherSignatureUrl);
  const principalSignature = await getImageBase64(principalSignatureUrl);
  const remarks = getRemarks(student.data.grandScore);

  drawFooter(
    doc,
    pageWidth,
    remarks,
    teacherSignature,
    principalSignature
  );

  return doc;
}
async function generateAnnualPDF(
  student,
  teacher,
  studentPhotoUrl,
  teacherSignatureUrl,
  principalSignatureUrl
) {
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

  drawAnnualHeader(doc, pageWidth);
  drawAnnualStudentInfo(doc, student, teacher);
  drawAnnualScoreSheet(doc, student.data);
  drawAnnualAffirmativeSkills(doc, student.data);
  drawAnnualPsychomotorSkills(doc, student.data);
  drawAnnualSummary(doc, student.data);
  //TODO:get result signature
  // const signatureUrl = student.data.

  const teacherSignature = await getImageBase64(teacherSignatureUrl);
  const principalSignature = await getImageBase64(principalSignatureUrl);
  const remarks = getRemarks(student.data.grandScore);

  drawAnnualFooter(
    doc,
    pageWidth,
    remarks,
    teacherSignature,
    principalSignature
  );

  return doc;
}



const getRemarks = (total) => {
  let remarks = {
    classTeacher: "",
    headTeacher: "",
  };

  if (total >= 900) {
    remarks.classTeacher = "Excellent performance.";
    remarks.headTeacher = "Outstanding work! Keep it up.";
  } else if (total >= 800) {
    remarks.classTeacher = "Very good performance.";
    remarks.headTeacher = "Great job! Continue the hard work.";
  } else if (total >= 700) {
    remarks.classTeacher = "Good performance.";
    remarks.headTeacher = "Well done! Aim for even higher.";
  } else if (total >= 600) {
    remarks.classTeacher = "Satisfactory performance.";
    remarks.headTeacher = "Good effort. Try to improve further.";
  } else {
    remarks.classTeacher = "Needs improvement.";
    remarks.headTeacher = "Work harder and you can achieve better results.";
  }

  return remarks;
};


export { generatePDF, generateAnnualPDF };
