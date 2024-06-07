import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import StudentResult from '../models/studentResult.js';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const generateResultPDF = async (studentId, res) => {
  try {
    const result = await StudentResult.findOne({ studentId })
      .populate('studentId')
      .populate('academicYear')
      .populate('academicTerm');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const student = result.studentId;
    const academicYear = result.academicYear;
    const academicTerm = result.academicTerm;

    const documentDefinition = {
      content: [
        {
          text: 'MBAKOR COMM. SEC. SCH, WANNUNE\nMotto: Innovation and Service',
          style: 'header'
        },
        {
          text: 'Opposite LGA Secretariat, Wannune, Benue State\nTEL: +2347043786532, EMAIL: mcsswannune@gmail.com',
          style: 'subheader'
        },
        {
          text: "STUDENT'S ACADEMIC REPORT CARD",
          style: 'title'
        },
        {
          style: 'studentDetails',
          columns: [
            [
              { text: `Name: ${student.fullName()}` },
              { text: `Admission Number: ${student.studentId}` },
              { text: `Term: ${academicTerm.name}` },
              { text: 'Resumption: _________' },
              { text: 'Student in Class: 53' },
              { text: 'Total Days in Term: _______' }
            ],
            [
              { text: `Gender: ${student.sex}` },
              { text: `Age: ${student.age}` },
              { text: `Session: ${academicYear.name}` },
              { text: `Class: ${student.classLevel}` },
              { text: 'Class Teacher: Dooga Esther' },
              { text: 'Total Days Present: _______' }
            ]
          ]
        },
        {
          text: 'SUBJECTS',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: [100, '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                'Subject', 'First C.A (10)', 'Second C.A (10)', 'Test (10)', 'Exam (70)', 'Total (100)',
                'Subject Avg.', 'Subject Highest', 'Subject Lowest', 'Subject Position', 'Subject Grade'
              ],
              ...result.subjects.map(subject => [
                subject.name, subject.assessment1, subject.assessment2, subject.assessment3, subject.exam,
                subject.total, '', '', '', '', subject.grade
              ])
            ]
          }
        },
        {
          text: 'PSYCHOMOTOR SKILLS',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              { text: 'Handwriting: nill' },
              { text: 'Sports: nill' },
              { text: 'Drawing & Painting: nill' }
            ],
            [
              { text: 'Verbal Fluency: nill' },
              { text: 'Handling Tools: nill' }
            ]
          ]
        },
        {
          text: 'AFFECTIVE SKILLS',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              { text: 'Punctuality: nill' },
              { text: 'Neatness: nill' },
              { text: 'Leadership Skill: nill' },
              { text: 'Attentiveness: nill' },
              { text: 'Attitude to Work: nill' }
            ],
            [
              { text: 'Politeness: nill' },
              { text: 'Honesty: nill' },
              { text: 'Cooperation: nill' },
              { text: 'Perseverance: nill' }
            ]
          ]
        },
        {
          text: 'GRADING SYSTEM',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              { text: '70-100: A' },
              { text: '50-59: C' }
            ],
            [
              { text: '60-69: B' },
              { text: '40-49: D' }
            ],
            { text: '0-39: E' }
          ]
        },
        {
          text: 'SUMMARY',
          style: 'sectionHeader'
        },
        {
          columns: [
            { text: `TOTAL SCORE: ${result.grandScore}` },
            { text: 'TOTAL OBTAINABLE SCORE: 1000' },
            { text: `AVG. SCORE: ${result.average}` },
            { text: `GRADE: ${result.remarks}` },
            { text: `POSITION: ${result.position}` }
          ]
        },
        {
          text: "CLASS TEACHER'S REMARKS: Not Impressive, Sit up!"
        },
        {
          text: 'SIGN: ___________________________',
          alignment: 'right'
        },
        {
          text: "PRINCIPAL'S REMARKS: A poor result, Sit up!"
        },
        {
          text: 'SIGN: ___________________________',
          alignment: 'right'
        },
        {
          text: 'powered by NobleQuest Innovations  || 07064436807 || tonmeje@gmail.com',
          style: 'footer'
        }
      ],
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          alignment: 'center'
        },
        subheader: {
          fontSize: 12,
          alignment: 'center'
        },
        title: {
          fontSize: 13,
          bold: true,
          alignment: 'center',
          decoration: 'underline'
        },
        studentDetails: {
          fontSize: 10,
          margin: [0, 10, 0, 10]
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        footer: {
          fontSize: 8,
          italics: true,
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      }
    };

    const pdfDoc = pdfMake.createPdf(documentDefinition);

    pdfDoc.getBuffer((buffer) => {
      res.contentType('application/pdf');
      res.send(buffer);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
}

export { generateResultPDF };



// const { jsPDF } = require("jspdf");
// const fs = require("fs");
// const axios = require("axios");
// const { Buffer } = require("buffer");

// // Constants for layout
// const MARGIN = 3;
// const LOGO_SIZE = 30;
// const PAGE_PADDING = 5;
// const TEXT_HEIGHT = 10;
// const HEADER_HEIGHT = 26;
// const LINE_SPACING = 7;
// const SCORE_SHEET_START_Y = 65;
// const SCORE_SHEET_HEIGHT = 117;
// const AFFIRMATIVE_START_Y = 65;
// const AFFIRMATIVE_HEIGHT = 73;
// const PSYCHOMOTOR_START_Y = 140;
// const PSYCHOMOTOR_HEIGHT = 4;
// const SUMMARY_START_Y = 195;
// const SUMMARY_HEIGHT = 20;
// const FOOTER_HEIGHT = 265;
// const KEY_BOX_HEIGHT = 20;
// const KEY_LINE_HEIGHT = 8;
// const REMARKS_Y = 229;
// const NEXT_TERM_Y = 260;
// const POWERED_BY_Y = 292;

// // Function to convert local image file to Base64
// function getImageBase64(filePath) {
//   const fileData = fs.readFileSync(filePath);
//   return Buffer.from(fileData).toString("base64");
// }

// // Function to convert remote image URL to Base64
// async function getImageBase64FromUrl(imageUrl) {
//   const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
//   return Buffer.from(response.data, "binary").toString("base64");
// }

// // Function to draw the header
// function drawHeader(doc, pageWidth) {
//   doc.setFontSize(14);
//   doc.setFont("helvetica", "bold");
//   doc.text("MBAKOR COMM. SEC. SCH, WANNUNE", pageWidth / 2, 10, { align: "center" });

//   doc.setFontSize(10);
//   doc.setFont("helvetica", "normal");
//   doc.text("Motto: Innovation and Service", pageWidth / 2, 16, { align: "center" });
//   doc.text("Opposite LGA Secretariat, Wannune, Benue State", pageWidth / 2, 21, { align: "center" });
//   doc.text("TEL: +2347043786532, EMAIL: mcsswannune@gmail.com", pageWidth / 2, HEADER_HEIGHT, { align: "center" });

//   doc.setFontSize(11);
//   doc.setFont("helvetica", "bold");
//   doc.text("STUDENT'S ACADEMIC REPORT CARD", pageWidth / 2, 32, { align: "center" });

//   doc.line(10, 36, 200, 36);
// }

// // Function to draw student information
// function drawStudentInfo(doc) {
//   doc.setFontSize(15);
//   doc.setFont("helvetica", "bold");
//   doc.text("Johnson Kansas", doc.internal.pageSize.width / 2, 43, { align: "center" });

//   doc.setFontSize(10);
//   doc.setFont("helvetica", "normal");
//   doc.text("Admission ID: MCSSW-23-001", 20, 47);
//   doc.text("Class: Primary 2", 160, 47);
//   doc.text("Session: 2022/2023", 20, 54);
//   doc.text("Term: First Term", 20, 59);
//   doc.text("Number in Class: 25", 85, 54);
//   doc.text("Class Teacher: Mr. Jacobson", 85, 59);
//   doc.text("Total Days in Term: 60", 160, 54);
//   doc.text("Total Days Present: 50", 160, 59);

//   doc.line(10, 63, 200, 63);
// }

// // Function to draw the score sheet
// function drawScoreSheet(doc) {
//   doc.rect(10, SCORE_SHEET_START_Y, 135, SCORE_SHEET_HEIGHT);

//   const scoreSheetX = 55;
//   const scoreSheetY = SCORE_SHEET_START_Y;

//   for (let i = 0; i <= 9; i++) {
//     doc.line(scoreSheetX + 9 * i, scoreSheetY, scoreSheetX + 9 * i, scoreSheetY + SCORE_SHEET_HEIGHT);
//   }

//   for (let i = 0; i <= 10; i++) {
//     doc.line(10, SCORE_SHEET_START_Y + 7 * i + 40, 145, SCORE_SHEET_START_Y + 7 * i + 40);
//   }

//   doc.setFont("helvetica", "bold");
//   doc.text("SUBJECTS", 20, 85);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(11);
//   doc.text('First CA (10)', 61, 99, null, 90);
//   doc.text('Second CA (10)', 69, 99, null, 90);
//   doc.text('Test (10)', 79, 99, null, 90);
//   doc.text('Exam (70)', 88, 99, null, 90);
//   doc.text('Total (100)', 97, 99, null, 90);
//   doc.text('Subject Avg.', 105, 99, null, 90);
//   doc.text('Subject Highest', 114, 99, null, 90);
//   doc.text('Subject Lowest', 123, 99, null, 90);
//   doc.text('Subject Position', 133, 99, null, 90);
//   doc.text('Subject Grade', 141, 99, null, 90);

//   doc.setFontSize(10);
//   const subjects = [
//     "English Language", "Mathematics", "Civic Education", "History", "CRS",
//     "Provoc. Studies", "Social Studies", "CCA", "Business Studies",
//     "Tiv language", "Basic Science and Tech"
//   ];

//   subjects.forEach((subject, index) => {
//     doc.text(subject, 11, 110 + 7 * index);
//   });
// }

// // Function to draw affirmative skills
// function drawAffirmativeSkills(doc) {
//   doc.rect(150, AFFIRMATIVE_START_Y, 50, AFFIRMATIVE_HEIGHT);

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("AFFIRMATIVE SKILLS", 155, 72);
//   doc.line(150, 75, 200, 75);

//   for (let i = 1; i <= 7; i++) {
//     doc.line(150, 75 + 7 * i, 200, 75 + 7 * i);
//   }

//   doc.line(185, 75, 185, 138);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(7);
//   const skills = [
//     "PUNCTUALITY", "POLITENESS", "NEATNESS", "HONESTY",
//     "LEADERSHIP SKILL", "COOPERATION", "ATTENTIVENESS",
//     "PERSEVERANCE", "ATTITUDE TO WORK"
//   ];

//   skills.forEach((skill, index) => {
//     doc.text(skill, 151, 81 + 7 * index);
//   });
// }

// // Function to draw psychomotor skills
// function drawPsychomotorSkills(doc) {
//   doc.rect(150, PSYCHOMOTOR_START_Y, 50, PSYCHOMOTOR_HEIGHT);

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text('PSYCHOMOTOR SKILLS', 154, 146);
//   doc.line(150, 150, 200, 150);

//   for (let i = 1; i <= 4; i++) {
//     doc.line(150, 150 + 6 * i, 200, 150 + 6 * i);
//   }

//   doc.line(185, 150, 185, 182);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(7);
//   const psychomotorSkills = [
//     "HANDWRITING", "VERBAL FLUENCY", "SPORTS", "HANDLING TOOLS", "DRAWING & PAINTING"
//   ];

//   psychomotorSkills.forEach((skill, index) => {
//     doc.text(skill, 151, 155 + 6 * index);
//   });
// }

// // Function to draw the summary
// function drawSummary(doc) {
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text('SUMMARY', doc.internal.pageSize.width / 2, SUMMARY_START_Y, { align: "center" });
//   doc.rect(10, SUMMARY_START_Y + 3, 190, SUMMARY_HEIGHT);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.line(10, 208, 200, 208);
//   doc.text('Total Score', 15, 206);
//   doc.line(40, 198, 40, 218);
//   doc.text("Total Obtainable Score", 43, 206);
//   doc.line(83, 198, 83, 218);
//   doc.text("Average Score", 91, 206);
//   doc.line(125, 198, 125, 218);
//   doc.text("Grade", 136, 206);
//   doc.line(160, 198, 160, 218);
//   doc.text("Position", 172, 206);
// }

// // Function to draw remarks and footer
// function drawFooter(doc, pageWidth) {
//   doc.setFontSize(8);
//   doc.text("Class Teacher's Remark:________________________________________________________________________", 10, REMARKS_Y);
//   doc.text("Sign___________________", 163, REMARKS_Y);
//   doc.text("Head Teacher's Remark:________________________________________________________________________", 10, REMARKS_Y + 16);
//   doc.text("Sign___________________", 163, REMARKS_Y + 16);

//   doc.text('Next Term Begins:______________________', 10, NEXT_TERM_Y);
//   doc.text('Next Term School Fee:__________________', 140, NEXT_TERM_Y);

//   doc.rect(65, FOOTER_HEIGHT, 70, KEY_BOX_HEIGHT);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(8);
//   doc.text('KEY', pageWidth / 2 - 10, FOOTER_HEIGHT + 3.5);
//   doc.line(65, FOOTER_HEIGHT + 4.5, 135, FOOTER_HEIGHT + 4.5);

//   for (let i = 1; i <= 4; i++) {
//     doc.line(65, FOOTER_HEIGHT + 4.5 + i * KEY_LINE_HEIGHT, 135, FOOTER_HEIGHT + 4.5 + i * KEY_LINE_HEIGHT);
//   }

//   for (let i = 1; i <= 4; i++) {
//     doc.line(65 + 13 * i, FOOTER_HEIGHT + 4.5, 65 + 13 * i, FOOTER_HEIGHT + KEY_BOX_HEIGHT);
//   }

//   doc.setFontSize(8);
//   doc.text('70-100', 67, FOOTER_HEIGHT + 10);
//   doc.text('60-69', 80, FOOTER_HEIGHT + 10);
//   doc.text('50-59', 94, FOOTER_HEIGHT + 10);
//   doc.text('40-49', 109, FOOTER_HEIGHT + 10);
//   doc.text('0-39', 125, FOOTER_HEIGHT + 10);

//   doc.text('A', 70, FOOTER_HEIGHT + 17);
//   doc.text('B', 83, FOOTER_HEIGHT + 17);
//   doc.text('C', 97, FOOTER_HEIGHT + 17);
//   doc.text('D', 112, FOOTER_HEIGHT + 17);
//   doc.text('E', 125, FOOTER_HEIGHT + 17);

//   doc.setFontSize(6);
//   doc.setFont("helvetica", "normal");
//   doc.text('powered by NobleQuest Innovations  || 07064436807 || tonmeje@gmail.com', 65, POWERED_BY_Y);
// }

// (async () => {
//   // Create a new jsPDF instance
//   const doc = new jsPDF();

//   // Get the page width and height
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   // Draw the outline
//   doc.rect(MARGIN, MARGIN, pageWidth - MARGIN * 2, pageHeight - MARGIN * 2);

//   // Read and add the local image to the PDF
//   const localImgData = getImageBase64("mcss-logo.jpg");
//   doc.addImage(localImgData, "JPEG", PAGE_PADDING, PAGE_PADDING, LOGO_SIZE, LOGO_SIZE);

//   // Read and add the remote image to the PDF
//   const remoteImgData = await getImageBase64FromUrl(
//     "https://res.cloudinary.com/tgod/image/upload/v1716675830/test/studentProfile/ouxtqdcjjynbgvewx2oj.jpg"
//   );
//   doc.addImage(remoteImgData, "JPEG", pageWidth - LOGO_SIZE - PAGE_PADDING, PAGE_PADDING, LOGO_SIZE, LOGO_SIZE);

//   // Draw sections
//   drawHeader(doc, pageWidth);
//   drawStudentInfo(doc);
//   drawScoreSheet(doc);
//   drawAffirmativeSkills(doc);
//   drawPsychomotorSkills(doc);
//   drawSummary(doc);
//   drawFooter(doc, pageWidth);

//   // Save the PDF to a file
//   doc.save("pdfs/test.pdf");
// })();

const { jsPDF } = require("jspdf");
const fs = require("fs");
const axios = require("axios");
const { Buffer } = require("buffer");

// Constants for layout
const MARGIN = 3;
const LOGO_SIZE = 30;
const PAGE_PADDING = 5;
const TEXT_HEIGHT = 10;
const HEADER_HEIGHT = 26;
const LINE_SPACING = 7;
const SCORE_SHEET_START_Y = 65;
const SCORE_SHEET_HEIGHT = 117;
const AFFIRMATIVE_START_Y = 65;
const AFFIRMATIVE_HEIGHT = 73;
const PSYCHOMOTOR_START_Y = 140;
const PSYCHOMOTOR_HEIGHT = 44;
const SUMMARY_START_Y = 195;
const SUMMARY_HEIGHT = 20;
const FOOTER_HEIGHT = 265;
const KEY_BOX_HEIGHT = 20;
const KEY_LINE_HEIGHT = 8;
const REMARKS_Y = 229;
const NEXT_TERM_Y = 260;
const POWERED_BY_Y = 292;

// Function to convert local image file to Base64
function getImageBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return Buffer.from(fileData).toString("base64");
}

// Function to convert remote image URL to Base64
async function getImageBase64FromUrl(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary").toString("base64");
}

// Function to draw the header
function drawHeader(doc, pageWidth) {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MBAKOR COMM. SEC. SCH, WANNUNE", pageWidth / 2, 10, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Motto: Innovation and Service", pageWidth / 2, 16, {
    align: "center",
  });
  doc.text(
    "Opposite LGA Secretariat, Wannune, Benue State",
    pageWidth / 2,
    21,
    { align: "center" }
  );
  doc.text(
    "TEL: +2347043786532, EMAIL: mcsswannune@gmail.com",
    pageWidth / 2,
    HEADER_HEIGHT,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT'S ACADEMIC REPORT CARD", pageWidth / 2, 32, {
    align: "center",
  });

  doc.line(10, 36, 200, 36);
}

// Function to draw student information
function drawStudentInfo(doc, student) {
  const {
    name,
    admissionId,
    class: studentClass,
    session,
    term,
    numberInClass,
    classTeacher,
    totalDaysInTerm,
    totalDaysPresent,
  } = student;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(name || "", doc.internal.pageSize.width / 2, 43, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Admission ID: ${admissionId || ""}`, 20, 47);
  doc.text(`Class: ${studentClass || ""}`, 160, 47);
  doc.text(`Session: ${session || ""}`, 20, 54);
  doc.text(`Term: ${term || ""}`, 20, 59);
  doc.text(`Number in Class: ${numberInClass || ""}`, 85, 54);
  doc.text(`Class Teacher: ${classTeacher || ""}`, 85, 59);
  doc.text(`Total Days in Term: ${totalDaysInTerm || ""}`, 160, 54);
  doc.text(`Total Days Present: ${totalDaysPresent || ""}`, 160, 59);

  doc.line(10, 63, 200, 63);
}

// Function to draw the score sheet
function drawScoreSheet(doc, result) {
  doc.rect(10, SCORE_SHEET_START_Y, 135, SCORE_SHEET_HEIGHT);

  const scoreSheetX = 55;
  const scoreSheetY = SCORE_SHEET_START_Y;

  for (let i = 0; i <= 9; i++) {
    doc.line(
      scoreSheetX + 9 * i,
      scoreSheetY,
      scoreSheetX + 9 * i,
      scoreSheetY + SCORE_SHEET_HEIGHT
    );
  }

  for (let i = 0; i <= 10; i++) {
    doc.line(
      10,
      SCORE_SHEET_START_Y + 7 * i + 40,
      145,
      SCORE_SHEET_START_Y + 7 * i + 40
    );
  }

  doc.setFont("helvetica", "bold");
  doc.text("SUBJECTS", 20, 85);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("First CA (10)", 61, 99, null, 90);
  doc.text("Second CA (10)", 69, 99, null, 90);
  doc.text("Test (10)", 79, 99, null, 90);
  doc.text("Exam (70)", 88, 99, null, 90);
  doc.text("Total (100)", 97, 99, null, 90);
  doc.text("Subject Avg.", 105, 99, null, 90);
  doc.text("Subject Highest", 114, 99, null, 90);
  doc.text("Subject Lowest", 123, 99, null, 90);
  doc.text("Subject Position", 133, 99, null, 90);
  doc.text("Subject Grade", 141, 99, null, 90);

  doc.setFontSize(10);
  result.subjects.forEach((subject, index) => {
    const {
      name,
      firstCA,
      secondCA,
      test,
      exam,
      total,
      avg,
      highest,
      lowest,
      position,
      grade,
    } = subject;

    doc.text(name || "", 11, 110 + 7 * index);
    doc.text(
      firstCA !== undefined ? firstCA.toString() : "",
      57,
      110 + 7 * index
    );
    doc.text(
      secondCA !== undefined ? secondCA.toString() : "",
      66,
      110 + 7 * index
    );
    doc.text(test !== undefined ? test.toString() : "", 74, 110 + 7 * index);
    doc.text(exam !== undefined ? exam.toString() : "", 83, 110 + 7 * index);
    doc.text(total !== undefined ? total.toString() : "", 92, 110 + 7 * index);
    doc.text(avg !== undefined ? avg.toString() : "", 100.8, 110 + 7 * index);
    doc.text(
      highest !== undefined ? highest.toString() : "",
      110.5,
      110 + 7 * index
    );
    doc.text(
      lowest !== undefined ? lowest.toString() : "",
      120,
      110 + 7 * index
    );
    doc.text(
      position !== undefined ? position.toString() : "",
      129,
      110 + 7 * index
    );
    doc.text(grade || "", 138, 110 + 7 * index);
  });
}

// Function to draw affirmative skills
function drawAffirmativeSkills(doc, affirmativeSkills) {
  doc.rect(150, AFFIRMATIVE_START_Y, 50, AFFIRMATIVE_HEIGHT);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AFFIRMATIVE SKILLS", 155, 72);
  doc.line(150, 75, 200, 75);

  for (let i = 1; i <= 8; i++) {
    doc.line(150, 75 + 7 * i, 200, 75 + 7 * i);
  }

  doc.line(185, 75, 185, 138);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const skills = [
    "PUNCTUALITY",
    "POLITENESS",
    "NEATNESS",
    "HONESTY",
    "LEADERSHIP SKILL",
    "COOPERATION",
    "ATTENTIVENESS",
    "PERSEVERANCE",
    "ATTITUDE TO WORK",
  ];

  skills.forEach((skill, index) => {
    const skillKey = skill.toLowerCase().replace(/ /g, "_");
    const skillValue = affirmativeSkills[skillKey];

    doc.text(skill, 151, 81 + 7 * index);
    doc.text(
      skillValue !== undefined ? skillValue.toString() : "",
      190,
      81 + 7 * index
    );
  });
}

// Function to draw psychomotor skills
function drawPsychomotorSkills(doc, psychomotorSkills) {
  doc.rect(150, PSYCHOMOTOR_START_Y, 50, PSYCHOMOTOR_HEIGHT);

 doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PSYCHOMOTOR SKILLS", 155, 147);
  doc.line(150, 150, 200, 150);

  for (let i = 1; i <= 4; i++) {
    doc.line(150, 150 + 7 * i, 200, 150 + 7 * i);
  }

  doc.line(185, 150, 185, 184);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const skills = [
    "HANDWRITING",
    "VERBAL FLUENCY",
    "SPORTS",
    "HANDLING TOOLS",
    "DRAWING",
  ];

  skills.forEach((skill, index) => {
    const skillKey = skill.toLowerCase().replace(" ", "_");
    const skillValue = psychomotorSkills[skillKey];

    doc.text(skill, 151, 155 + 7 * index);
    doc.text(
      skillValue !== undefined ? skillValue.toString() : "",
      190,
      155 + 7 * index
    );
  });
}

// Function to draw summary
function drawSummary(doc, summary) {
  doc.rect(10, SUMMARY_START_Y, 190, SUMMARY_HEIGHT);

  doc.line(45, SUMMARY_START_Y, 45, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(75, SUMMARY_START_Y, 75, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(104, SUMMARY_START_Y, 104, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(136, SUMMARY_START_Y, 136, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(167, SUMMARY_START_Y, 167, SUMMARY_START_Y + SUMMARY_HEIGHT);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Marks Obtainable", 12, 202);
  doc.text(
    summary.marksObtainable !== undefined
      ? summary.marksObtainable.toString()
      : "",
    23,
    213
  );
  doc.text("Marks Obtained", 46.5, 202);
  doc.text(
    summary.marksObtained !== undefined ? summary.marksObtained.toString() : "",
    56,
    213
  );
  doc.text("Average", 82, 202);
  doc.text(
    summary.percentage !== undefined ? summary.percentage.toString() : "",
    87,
    213
  );
  doc.text("Class Average", 107, 202);
  doc.text(summary.grade || "", 117, 213);
  doc.text("Grade", 144, 202);
  doc.text(summary.grade || "", 149, 213);
  doc.text("Position", 175, 202);
  doc.text(
    summary.position !== undefined ? summary.position.toString() : "",
    183,
    213
  );
}

// Function to draw footer
function drawFooter(doc, pageWidth, remarks) {
  doc.setFontSize(8);
  doc.text(
    "Class Teacher's Remark:________________________________________________________________________",
    10,
    REMARKS_Y
  );
  doc.text(remarks.classTeacher || "", 12, REMARKS_Y + 8);
  doc.text("Sign___________________", 163, REMARKS_Y);
  doc.text(
    "Head Teacher's Remark:________________________________________________________________________",
    10,
    REMARKS_Y + 16
  );
  doc.text(remarks.headTeacher || "", 12, REMARKS_Y + 24);
  doc.text("Sign___________________", 163, REMARKS_Y + 16);

  doc.text("Next Term Begins:______________________", 10, NEXT_TERM_Y);
  doc.text("Next Term School Fee:__________________", 140, NEXT_TERM_Y);

  doc.rect(65, FOOTER_HEIGHT, 70, KEY_BOX_HEIGHT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("KEY", pageWidth / 2 - 10, FOOTER_HEIGHT + 3.5);
  doc.line(65, FOOTER_HEIGHT + 4.5, 135, FOOTER_HEIGHT + 4.5);

  for (let i = 1; i <= 4; i++) {
    doc.line(
      65,
      FOOTER_HEIGHT + 4.5 + i * KEY_LINE_HEIGHT,
      135,
      FOOTER_HEIGHT + 4.5 + i * KEY_LINE_HEIGHT
    );
  }

  for (let i = 1; i <= 4; i++) {
    doc.line(
      65 + 13 * i,
      FOOTER_HEIGHT + 4.5,
      65 + 13 * i,
      FOOTER_HEIGHT + KEY_BOX_HEIGHT
    );
  }

  doc.setFontSize(8);
  doc.text("70-100", 67, FOOTER_HEIGHT + 10);
  doc.text("60-69", 80, FOOTER_HEIGHT + 10);
  doc.text("50-59", 94, FOOTER_HEIGHT + 10);
  doc.text("40-49", 109, FOOTER_HEIGHT + 10);
  doc.text("0-39", 125, FOOTER_HEIGHT + 10);

  doc.text("A", 70, FOOTER_HEIGHT + 17);
  doc.text("B", 83, FOOTER_HEIGHT + 17);
  doc.text("C", 97, FOOTER_HEIGHT + 17);
  doc.text("D", 112, FOOTER_HEIGHT + 17);
  doc.text("E", 125, FOOTER_HEIGHT + 17);

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(
    "powered by NobleQuest Innovations  || 07064436807 || tonmeje@gmail.com",
    65,
    POWERED_BY_Y
  );
}

// Main function to generate the report card
async function generateReportCard(student, result) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.rect(MARGIN, MARGIN, pageWidth - MARGIN * 2, pageHeight - MARGIN * 2);

  const localImgData = getImageBase64("mcss-logo.jpg");
  doc.addImage(
    localImgData,
    "JPEG",
    PAGE_PADDING,
    PAGE_PADDING,
    LOGO_SIZE,
    LOGO_SIZE
  );

  const remoteImgData = await getImageBase64FromUrl(student.profileImageUrl);
  doc.addImage(
    remoteImgData,
    "JPEG",
    pageWidth - LOGO_SIZE - PAGE_PADDING,
    PAGE_PADDING,
    LOGO_SIZE,
    LOGO_SIZE
  );

  drawHeader(doc, pageWidth);
  drawStudentInfo(doc, student);
  drawScoreSheet(doc, result);
  drawAffirmativeSkills(doc, result.affirmativeSkills);
  drawPsychomotorSkills(doc, result.psychomotorSkills);
  drawSummary(doc, result.summary);
  drawFooter(doc, pageWidth, result.remarks);

  doc.save("pdfs/test.pdf");
}

// Example usage
const student = {
  name: "John Doe",
  admissionId: "12345",
  class: "SS 1",
  session: "2023/2024",
  term: "First Term",
  numberInClass: 25,
  classTeacher: "Mr. Smith",
  totalDaysInTerm: 100,
  totalDaysPresent: 95,
  profileImageUrl:
    "https://res.cloudinary.com/tgod/image/upload/v1716675830/test/studentProfile/ouxtqdcjjynbgvewx2oj.jpg",
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

generateReportCard(student, result);

