import { param, body } from "express-validator";

const updateAcademicYearValidationRules = [
    param('id').isMongoId().withMessage('Invalid academic year ID'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('fromYear').optional().isInt({ min: 1900 }).withMessage('From Year must be a valid year'),
    body('toYear').optional().isInt({ min: 1900 }).withMessage('To Year must be a valid year'),
  ];

export{
    updateAcademicYearValidationRules,
}