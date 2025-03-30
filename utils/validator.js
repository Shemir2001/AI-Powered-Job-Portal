const { check, validationResult } = require('express-validator');

const validateRegistration = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role is required').isIn(['jobseeker', 'employer', 'admin'])
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

const validateJobPost = [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('requirements', 'Requirements are required').not().isEmpty(),
  check('responsibilities', 'Responsibilities are required').not().isEmpty(),
  check('type', 'Job type is required').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']),
  check('experience', 'Experience level is required').isIn(['Entry Level', 'Mid Level', 'Senior Level', 'Executive']),
  check('skills', 'Skills are required').isArray().not().isEmpty()
];

const validateCompany = [
  check('name', 'Company name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('industry', 'Industry is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('size', 'Company size is required').isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  check('contactEmail', 'Contact email is required').isEmail()
];

const validateApplication = [
  check('job', 'Job ID is required').not().isEmpty(),
  check('company', 'Company ID is required').not().isEmpty()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateJobPost,
  validateCompany,
  validateApplication,
  validate
};