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
