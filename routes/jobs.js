const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateJobPost, validateApplication, validate } = require('../utils/validators');
const {
  createJob,
  generateAIJobDescription,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getUserApplications,
  getEmployerJobs,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/jobController');

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (employers only)
router.post('/', auth, validateJobPost, validate, createJob);

// @route   POST api/jobs/generate-description
// @desc    Generate job description with AI
// @access  Private (employers only)
router.post('/generate-description', auth, generateAIJobDescription);

// @route   GET api/jobs
// @desc    Get all jobs with filtering
// @access  Public
router.get('/', getJobs);

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', getJobById);

// @route   PUT api/jobs/:id
// @desc    Update job
// @access  Private (job poster only)
router.put('/:id', auth, updateJob);

// @route   DELETE api/jobs/:id
// @desc    Delete job
// @access  Private (job poster only)
router.delete('/:id', auth, deleteJob);

// @route   POST api/jobs/apply
// @desc    Apply for a job
// @access  Private (jobseekers only)
router.post('/apply', auth, validateApplication, validate, applyForJob);

// @route   GET api/jobs/applications/me
// @desc    Get user's job applications
// @access  Private
router.get('/applications/me', auth, getUserApplications);

// @route   GET api/jobs/employer
// @desc    Get jobs posted by employer
// @access  Private (employers only)
router.get('/employer', auth, getEmployerJobs);

// @route   GET api/jobs/:jobId/applications
// @desc    Get applications for a job
// @access  Private (job poster only)
router.get('/:jobId/applications', auth, getJobApplications);

// @route   PUT api/jobs/applications/:applicationId
// @desc    Update application status
// @access  Private (employers only)
router.put('/applications/:applicationId', auth, updateApplicationStatus);

module.exports = router;
