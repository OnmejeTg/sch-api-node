import { param, body } from "express-validator";

const deleteResultValidationRules = [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ];

  const updateResultValidationRules = [
    body("subject")
      .notEmpty()
      .withMessage("Subject is required")
      .isString()
      .withMessage("Subject must be a string"),
    body("assessmentType")
      .notEmpty()
      .withMessage("Assessment type is required")
      .isString()
      .withMessage("Assessment type must be a string"),
    body("score")
      .notEmpty()
      .withMessage("Score is required")
      .isNumeric()
      .withMessage("Score must be a number"),
  ];


  export {
    deleteResultValidationRules,
    updateResultValidationRules,
  }