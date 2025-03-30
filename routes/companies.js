// Completing routes/companies.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createCompany,
  uploadLogo,
  getCompanies,
  getCompanyById,
  getUserCompanies,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');

// @route   POST api/companies
// @desc    Create a company
// @access  Private (employers only)
router.post('/', auth, createCompany);

// @route   POST api/companies/:id/logo
// @desc    Upload company logo
// @access  Private (company owner only)
router.post('/:id/logo', auth, upload.single('logo'), uploadLogo);

// @route   GET api/companies
// @desc    Get all companies with filtering
// @access  Public
router.get('/', getCompanies);

// @route   GET api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get('/:id', getCompanyById);

// @route   GET api/companies/user/me
// @desc    Get user's companies
// @access  Private
router.get('/user/me', auth, getUserCompanies);

// @route   PUT api/companies/:id
// @desc    Update company
// @access  Private (company owner only)
router.put('/:id', auth, updateCompany);

// @route   DELETE api/companies/:id
// @desc    Delete company
// @access  Private (company owner only)
router.delete('/:id', auth, deleteCompany);

module.exports = router;