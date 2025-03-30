const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  analyzeResumeForJob,
  generateJobCoverLetter,
  analyzeApplicationsWithAI,
  getJobSearchRecommendations
} = require('../controllers/aiController');

// @route   GET api/ai/jobs/:jobId/resume-analysis
// @desc    Analyze resume for a specific job
// @access  Private
router.get('/jobs/:jobId/resume-analysis', auth, analyzeResumeForJob);

// @route   GET api/ai/jobs/:jobId/cover-letter
// @desc    Generate cover letter for a job
// @access  Private
router.get('/jobs/:jobId/cover-letter', auth, generateJobCoverLetter);

// @route   GET api/ai/jobs/:jobId/applications-analysis
// @desc    Analyze applications with AI (for employers)
// @access  Private (employers only)
router.get('/jobs/:jobId/applications-analysis', auth, analyzeApplicationsWithAI);

// @route   POST api/ai/job-search-recommendations
// @desc    Get job search recommendations for user
// @access  Private
router.post('/job-search-recommendations', auth, getJobSearchRecommendations);

module.exports = router;