// import { param, body } from "express-validator";

// const updateAcademicYearValidationRules = [
//     param('id').isMongoId().withMessage('Invalid academic year ID'),
//     body('name').optional().isString().withMessage('Name must be a string'),
//     body('fromYear').optional().isInt({ min: 1900 }).withMessage('From Year must be a valid year'),
//     body('toYear').optional().isInt({ min: 1900 }).withMessage('To Year must be a valid year'),
//   ];

// export{
//     updateAcademicYearValidationRules,
// }


import{ check, validationResult }  from "express-validator";

const paymentDataValidationRules = [
  check('user').notEmpty().withMessage('User is required'),
  check('email').isEmail().withMessage('Email is not valid'),
  check('amount').notEmpty().withMessage('Amount is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

export{
    paymentDataValidationRules
}
