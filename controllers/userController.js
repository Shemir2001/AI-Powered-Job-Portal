const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('savedJobs');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const {
    name,
    location,
    bio,
    skills,
    social,
    experience,
    education
  } = req.body;

  // Build profile object
  const profileFields = {};
  if (name) profileFields.name = name;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  
  // Build social object
  if (social) profileFields.social = social;

  // Add experience and education if provided
  if (experience) profileFields.experience = experience;
  if (education) profileFields.education = education;

  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is updating their own profile
    if (user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete previous resume if exists
    if (user.resume) {
      const prevPath = path.join(__dirname, '..', user.resume);
      if (fs.existsSync(prevPath)) {
        fs.unlinkSync(prevPath);
      }
    }

    // Update user with new resume path
    user.resume = `/uploads/resumes/${req.file.filename}`;
    await user.save();
    
    res.json({ msg: 'Resume uploaded successfully', path: user.resume });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    // Delete previous avatar if exists
    if (user.avatar) {
      const prevPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(prevPath)) {
        fs.unlinkSync(prevPath);
      }
    }

    // Update user with new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    
    res.json({ msg: 'Avatar uploaded successfully', path: user.avatar });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Save/unsave job
const toggleSavedJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const jobId = req.params.jobId;
    
    // Check if the job is already saved
    const savedIndex = user.savedJobs.indexOf(jobId);
    
    if (savedIndex === -1) {
      // Job not saved, save it
      user.savedJobs.push(jobId);
      await user.save();
      return res.json({ msg: 'Job saved successfully', saved: true });
    } else {
      // Job already saved, unsave it
      user.savedJobs.splice(savedIndex, 1);
      await user.save();
      return res.json({ msg: 'Job unsaved successfully', saved: false });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get all saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.savedJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Please provide current and new password' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save new password
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getUserById,
  updateProfile,
  uploadResume,
  uploadAvatar,
  toggleSavedJob,
  getSavedJobs,
  changePassword
};