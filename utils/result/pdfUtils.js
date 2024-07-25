import { CONSTANTS } from "./constants.js";

function drawHeader(doc, pageWidth) {
  const { HEADER_HEIGHT } = CONSTANTS;
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

function drawStudentInfo(doc, student, teacher) {
  const { totalDaysPresent } = student;

  const { DAYS_IN_TERM } = CONSTANTS;

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${student.data.studentId.surname} ${student.data.studentId.othername}` ||
      "",
    doc.internal.pageSize.width / 2,
    43,
    {
      align: "center",
    }
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Admission ID: ${student.data.studentId.studentId || ""}`, 20, 47);
  doc.text(`Class: ${student.data.classLevel.name || ""}`, 160, 47);
  doc.text(`Session: ${student.data.academicYear.name || ""}`, 20, 54);
  doc.text(`Term: ${student.data.academicTerm.name || ""}`, 20, 59);
  doc.text(
    `Number in Class: ${String(student.data.classLevel.students.length) || ""}`,
    85,
    54
  );
  doc.text(
    `Class Teacher: ${teacher.surname || ""} ${teacher.othername || ""}`,
    85,
    59
  );
  doc.text(`Total Days in Term: ${DAYS_IN_TERM || ""}`, 160, 54);
  doc.text(`Total Days Present: ${totalDaysPresent || ""}`, 160, 59);

  doc.line(10, 63, 200, 63);
}

function drawScoreSheet(doc, result) {
  const { SCORE_SHEET_START_Y, SCORE_SHEET_HEIGHT } = CONSTANTS;

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
      assessment1,
      assessment2,
      assessment3,
      exam,
      total,
      average,
      highest,
      lowest,
      position,
      grade,
    } = subject;

    doc.text(name || "", 11, 110 + 7 * index);
    doc.text(
      assessment1 !== undefined ? assessment1.toString() : "",
      57,
      110 + 7 * index
    );
    doc.text(
      assessment2 !== undefined ? assessment2.toString() : "",
      66,
      110 + 7 * index
    );
    doc.text(
      assessment3 !== undefined ? assessment3.toString() : "",
      74,
      110 + 7 * index
    );
    doc.text(exam !== undefined ? exam.toString() : "", 83, 110 + 7 * index);
    doc.text(total !== undefined ? total.toString() : "", 92, 110 + 7 * index);
    doc.text(
      average !== undefined ? average.toFixed(1).toString() : "",
      100.8,
      110 + 7 * index
    );
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

function drawAffirmativeSkills(doc, affirmativeSkills) {
  const { AFFIRMATIVE_START_Y, AFFIRMATIVE_HEIGHT } = CONSTANTS;

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
    const skillValue = affirmativeSkills?.affirmativeSkills?.[skillKey];

    doc.text(skill, 151, 81 + 7 * index);
    doc.text(
      skillValue !== undefined ? skillValue.toString() : "",
      190,
      81 + 7 * index
    );
  });
}

function drawPsychomotorSkills(doc, psychomotorSkills) {
  const { PSYCHOMOTOR_START_Y, PSYCHOMOTOR_HEIGHT } = CONSTANTS;
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
    const skillValue = psychomotorSkills?.psychomotorSkills?.[skillKey];

    doc.text(skill, 151, 155 + 7 * index);
    doc.text(
      skillValue !== undefined ? skillValue.toString() : "",
      190,
      155 + 7 * index
    );
  });
}

function drawSummary(doc, summary) {
  const { SUMMARY_START_Y, SUMMARY_HEIGHT } = CONSTANTS;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SUMMARY", 95, SUMMARY_START_Y - 3);
  doc.rect(10, SUMMARY_START_Y, 190, SUMMARY_HEIGHT);

  doc.line(10, SUMMARY_START_Y + 10, 200, SUMMARY_START_Y + 10);

  doc.line(45, SUMMARY_START_Y, 45, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(75, SUMMARY_START_Y, 75, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(104, SUMMARY_START_Y, 104, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(136, SUMMARY_START_Y, 136, SUMMARY_START_Y + SUMMARY_HEIGHT);
  doc.line(167, SUMMARY_START_Y, 167, SUMMARY_START_Y + SUMMARY_HEIGHT);
  const marksObtainable = summary.subjects?.length *100
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Marks Obtainable", 12, 202);
  doc.text(
    marksObtainable !== undefined
      ? marksObtainable.toString()
      : "",
    23,
    213
  );
  doc.text("Marks Obtained", 46.5, 202);
  doc.text(
    summary.grandScore !== undefined ? summary.grandScore.toString() : "",
    56,
    213
  );
  doc.text("Average", 82, 202);
  doc.text(
    summary.average !== undefined ? summary.average.toString() : "",
    87,
    213
  );
  doc.text("Class Average", 107, 202);
  doc.text(summary.classAverage.toFixed(1).toString() || "", 117, 213);
  doc.text("Grade", 144, 202);
  doc.text(summary.remarks.toString() || "", 149, 213);
  doc.text("Position", 175, 202);
  doc.text(
    summary.position !== undefined ? summary.position.toString() : "",
    183,
    213
  );
}

function drawFooter(doc, pageWidth, remarks, teacherSignature, principalSignature) {
  const {
    KEY_BOX_HEIGHT,
    POWERED_BY_Y,
    KEY_LINE_HEIGHT,
    REMARKS_Y,
    NEXT_TERM_Y,
    FOOTER_HEIGHT,
  } = CONSTANTS;
  doc.setFontSize(9);
  doc.text(
    "Form Master's Remark:_________________________________________________________________",
    10,
    REMARKS_Y
  );
  doc.setFont("helvetica", "normal");
  doc.text(remarks.classTeacher || "", 49, REMARKS_Y);
  doc.addImage(
    teacherSignature,
    "JPEG",
    170,
    REMARKS_Y-13,
    20,
    20
  );
  doc.addImage(
    principalSignature,
    "JPEG",
    170,
    REMARKS_Y+3,
    20,
    20
  );
  doc.text("Sign___________________", 163, REMARKS_Y);

  doc.setFont("helvetica", "bold");
  doc.text("Principal's, Remark:_________________________________________________________________",
    10,
    REMARKS_Y + 16
  );
  doc.setFont("helvetica", "normal");
  doc.text(remarks.headTeacher || "", 49, REMARKS_Y + 16);
  doc.text("Sign___________________", 163, REMARKS_Y + 16);

  doc.setFont("helvetica", "bold");
  doc.text("Next Term Begins:_______________", 10, NEXT_TERM_Y);

  doc.setFont("helvetica", "normal");
  doc.text("05-09-2024", 41, NEXT_TERM_Y);
  doc.setFont("helvetica", "bold");
  doc.text("Next Term School Fee:________________", 140, NEXT_TERM_Y);
  doc.setFont("helvetica", "normal");
  doc.text("15,000", 178, NEXT_TERM_Y);

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

export {
  drawHeader,
  drawStudentInfo,
  drawScoreSheet,
  drawAffirmativeSkills,
  drawPsychomotorSkills,
  drawSummary,
  drawFooter,
};
