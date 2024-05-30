import { body, validationResult } from 'express-validator'

const validateStudentRegistration = [
  body('surname').notEmpty().withMessage('Surname is required'),
  body('othername').notEmpty().withMessage('Othername is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('classLevels').notEmpty().withMessage('Class Levels are required'),
  body('dateOfBirth').notEmpty().withMessage('Date of Birth is required'),
  body('sex').notEmpty().withMessage('Sex is required'),
  body('entrySession').notEmpty().withMessage('Entry Session is required'),
  body('parentSurname').notEmpty().withMessage('Parent Surname is required'),
  body('parentOthername').notEmpty().withMessage('Parent Othername is required'),
  body('parentOccupation').notEmpty().withMessage('Parent Occupation is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('healthStatus').notEmpty().withMessage('Health Status is required'),
  body('religion').notEmpty().withMessage('Religion is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

export { validateStudentRegistration };
