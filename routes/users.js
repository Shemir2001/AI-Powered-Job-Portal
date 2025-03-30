const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUserById,
  updateProfile,
  uploadResume,
  uploadAvatar,
  toggleSavedJob,
  getSavedJobs,
  changePassword
} = require('../controllers/userController');

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, getUserById);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   POST api/users/resume
// @desc    Upload resume
// @access  Private
router.post('/resume', auth, upload.single('resume'), uploadResume);

// @route   POST api/users/avatar
// @desc    Upload avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

// @route   PUT api/users/jobs/:jobId
// @desc    Save/unsave job
// @access  Private
router.put('/jobs/:jobId', auth, toggleSavedJob);

// @route   GET api/users/jobs/saved
// @desc    Get all saved jobs
// @access  Private
router.get('/jobs/saved', auth, getSavedJobs);

// @route   PUT api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, changePassword);

module.exports = router;
