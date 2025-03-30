const express = require('express');
const router = express.Router();
const { validateRegistration, validateLogin, validate } = require('../utils/validators');
const { registerUser, loginUser, getAuthUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegistration, validate, registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', validateLogin, validate, loginUser);

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, getAuthUser);

module.exports = router;