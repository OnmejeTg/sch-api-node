import PDFDocument from "pdfkit";
import StudentResult from "../models/studentResult.js";

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

    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe the document to a buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.contentType('application/pdf');
      res.send(pdfData);
    });

    // Add content to the PDF
    doc
      .fontSize(14)
      .text('MBAKOR COMM. SEC. SCH, WANNUNE\nMotto: Innovation and Service', { align: 'center' })
      .moveDown(0.5)
      .fontSize(12)
      .text('Opposite LGA Secretariat, Wannune, Benue State\nTEL: +2347043786532, EMAIL: mcsswannune@gmail.com', { align: 'center' })
      .moveDown(1)
      .fontSize(13)
      .text("STUDENT'S ACADEMIC REPORT CARD", { align: 'center', underline: true })
      .moveDown(1);

    // Student details
    doc
      .fontSize(10)
      .text(`Name: ${student.name}`, { continued: true })
      .text(`Gender: ${student.gender}`, { align: 'right' })
      .text(`Admission Number: ${student.admissionNumber}`, { continued: true })
      .text(`Age: ${student.age}`, { align: 'right' })
      .text(`Term: ${academicTerm.name}`, { continued: true })
      .text(`Session: ${academicYear.name}`, { align: 'right' })
      .text('Resumption: _________', { continued: true })
      .text(`Class: ${student.classLevel}`, { align: 'right' })
      .text('Student in Class: 53', { continued: true })
      .text('Class Teacher: Dooga Esther', { align: 'right' })
      .text('Total Days in Term: _______', { continued: true })
      .text('Total Days Present: _______', { align: 'right' })
      .moveDown(1);

    // Subject scores
    doc
      .fontSize(12)
      .text('SUBJECTS')
      .moveDown(0.5)
      .fontSize(10);

    const tableTop = doc.y;
    const subjectTableHeaders = [
      'Subject', 'First C.A (10)', 'Second C.A (10)', 'Test (10)', 'Exam (70)', 'Total (100)',
      'Subject Avg.', 'Subject Highest', 'Subject Lowest', 'Subject Position', 'Subject Grade'
    ];

    subjectTableHeaders.forEach((header, i) => {
      doc.text(header, { continued: i !== subjectTableHeaders.length - 1 });
    });

    doc.moveDown(0.5);

    result.subjects.forEach(subject => {
      const subjectRow = [
        subject.name, subject.assessment1, subject.assessment2, subject.assessment3, subject.exam,
        subject.total, '', '', '', '', subject.grade
      ];

      subjectRow.forEach((item, i) => {
        doc.text(item, { continued: i !== subjectRow.length - 1 });
      });

      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // Psychomotor skills
    doc
      .fontSize(12)
      .text('PSYCHOMOTOR SKILLS')
      .moveDown(0.5)
      .fontSize(10)
      .text('Handwriting: nill', { continued: true })
      .text('Verbal Fluency: nill', { align: 'right' })
      .text('Sports: nill', { continued: true })
      .text('Handling Tools: nill', { align: 'right' })
      .text('Drawing & Painting: nill')
      .moveDown(1);

    // Affective skills
    doc
      .fontSize(12)
      .text('AFFECTIVE SKILLS')
      .moveDown(0.5)
      .fontSize(10)
      .text('Punctuality: nill', { continued: true })
      .text('Politeness: nill', { align: 'right' })
      .text('Neatness: nill', { continued: true })
      .text('Honesty: nill', { align: 'right' })
      .text('Leadership Skill: nill', { continued: true })
      .text('Cooperation: nill', { align: 'right' })
      .text('Attentiveness: nill', { continued: true })
      .text('Perseverance: nill', { align: 'right' })
      .text('Attitude to Work: nill')
      .moveDown(1);

    // Grading system
    doc
      .fontSize(12)
      .text('GRADING SYSTEM')
      .moveDown(0.5)
      .fontSize(10)
      .text('70-100: A', { continued: true })
      .text('60-69: B', { align: 'right' })
      .text('50-59: C', { continued: true })
      .text('40-49: D', { align: 'right' })
      .text('0-39: E')
      .moveDown(1);

    // Summary
    doc
      .fontSize(12)
      .text('SUMMARY')
      .moveDown(0.5)
      .fontSize(10)
      .text(`TOTAL SCORE: ${result.grandScore}`, { continued: true })
      .text('TOTAL OBTAINABLE SCORE: 1000', { align: 'right' })
      .text(`AVG. SCORE: ${result.average}`, { continued: true })
      .text(`GRADE: ${result.remarks}`, { align: 'right' })
      .text(`POSITION: ${result.position}`)
      .moveDown(1);

    // Remarks
    doc
      .text("CLASS TEACHER'S REMARKS: Not Impressive, Sit up!")
      .text('SIGN: ___________________________', { align: 'right' })
      .moveDown(0.5)
      .text("PRINCIPAL'S REMARKS: A poor result, Sit up!")
      .text('SIGN: ___________________________', { align: 'right' })
      .moveDown(1);

    // Footer
    doc
      .fontSize(8)
      .text('powered by NobleQuest Innovations  || 07064436807 || tonmeje@gmail.com', { align: 'center', italics: true });

    // Finalize the PDF and end the stream
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
}
export { generateResultPDF };
