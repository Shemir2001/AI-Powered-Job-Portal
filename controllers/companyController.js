const Company = require('../models/Company');
const fs = require('fs');
const path = require('path');

// Create a new company
const createCompany = async (req, res) => {
  try {
    const {
      name,
      website,
      description,
      industry,
      location,
      size,
      founded,
      contactEmail,
      socialMedia
    } = req.body;

    // Check if company with same name already exists
    const existingCompany = await Company.findOne({ name, owner: req.user.id });
    if (existingCompany) {
      return res.status(400).json({ msg: 'You already have a company with this name' });
    }

    // Create new company
    const newCompany = new Company({
      name,
      website,
      description,
      industry,
      location,
      size,
      founded,
      owner: req.user.id,
      contactEmail,
      socialMedia
    });

    const company = await newCompany.save();
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Upload company logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    // Check if user is the owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete previous logo if exists
    if (company.logo) {
      const prevPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(prevPath)) {
        fs.unlinkSync(prevPath);
      }
    }
    
    // Update company with new logo path
    company.logo = `/uploads/logos/${req.file.filename}`;
    await company.save();
    
    res.json({ msg: 'Logo uploaded successfully', path: company.logo });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    const { search, industry, size, sort, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (industry) {
      filter.industry = industry;
    }
    
    if (size) {
      filter.size = size;
    }
    
    // Sort options
    const sortOptions = {};
    if (sort === 'name_asc') {
      sortOptions.name = 1;
    } else if (sort === 'name_desc') {
      sortOptions.name = -1;
    } else if (sort === 'newest') {
      sortOptions.createdAt = -1;
    } else {
      // Default sort by name
      sortOptions.name = 1;
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get companies with pagination
    const companies = await Company.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Company.countDocuments(filter);
    
    res.json({
      companies,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name');
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json(company);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get user's companies
const getUserCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ owner: req.user.id });
    res.json(companies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    // Check if user is the owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedCompany);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    // Check if user is the owner
    if (company.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete company logo if exists
    if (company.logo) {
      const logoPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    // Delete company
    await company.remove();
    
    res.json({ msg: 'Company removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createCompany,
  uploadLogo,
  getCompanies,
  getCompanyById,
  getUserCompanies,
  updateCompany,
  deleteCompany
};