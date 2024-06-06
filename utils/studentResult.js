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
