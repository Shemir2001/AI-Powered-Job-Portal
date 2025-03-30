const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateJobDescription } = require('../utils/geminiAi');

// Create a new job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      type,
      salary,
      experience,
      skills,
      deadline
    } = req.body;

    // Check if company exists and belongs to user
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    if (companyDoc.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to post jobs for this company' });
    }

    // Create new job
    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements,
      responsibilities,
      type,
      salary,
      experience,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
      postedBy: req.user.id,
      deadline: deadline || undefined
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
const generateAIJobDescription = async (req, res) => {
    try {
      const { title, companyName, industry, jobType, experience, location } = req.body;
      
      // Validate required fields
      if (!title || !companyName || !industry || !jobType || !experience || !location) {
        return res.status(400).json({ msg: 'Please provide all required fields' });
      }
      
      const description = await generateJobDescription({
        title,
        companyName,
        industry,
        jobType,
        experience,
        location
      });
      
      res.json({ description });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  // Get all jobs with filtering and pagination
  const getJobs = async (req, res) => {
    try {
      const {
        search,
        location,
        type,
        experience,
        company,
        salary_min,
        salary_max,
        skills,
        sort,
        page = 1,
        limit = 10
      } = req.query;
      
      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$text = { $search: search };
      }
      
      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (experience) {
        filter.experience = experience;
      }
      
      if (company) {
        filter.company = company;
      }
      
      // Salary filter
      if (salary_min || salary_max) {
        filter.salary = {};
        if (salary_min) filter.salary.$gte = Number(salary_min);
        if (salary_max) filter.salary.$lte = Number(salary_max);
      }
      
      // Skills filter
      if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        filter.skills = { $in: skillsArray };
      }
      
      // Only show active jobs by default
      filter.status = filter.status || 'active';
      
      // Sorting
      const sortOptions = {};
      if (sort === 'newest') {
        sortOptions.createdAt = -1;
      } else if (sort === 'oldest') {
        sortOptions.createdAt = 1;
      } else if (sort === 'salary_high') {
        sortOptions['salary.max'] = -1;
      } else if (sort === 'salary_low') {
        sortOptions['salary.min'] = 1;
      } else if (sort === 'relevance' && search) {
        sortOptions.score = { $meta: 'textScore' };
      } else {
        // Default sort by newest
        sortOptions.createdAt = -1;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get jobs with pagination
      const jobs = await Job.find(filter)
        .populate('company', 'name logo')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));
      
      // Get total count for pagination
      const total = await Job.countDocuments(filter);
      
      res.json({
        jobs,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  // Get job by ID
  const getJobById = async (req, res) => {
    try {
      const job = await Job.findById(req.params.id)
        .populate('company', 'name logo website location industry size')
        .populate('postedBy', 'name');
      
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }
      
      res.json(job);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Job not found' });
      }
      res.status(500).send('Server Error');
    }
  };
  
  // Update job
  const updateJob = async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }
      
      // Check if user is authorized to update the job
      if (job.postedBy.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Process skills if provided as string
      if (req.body.skills && typeof req.body.skills === 'string') {
        req.body.skills = req.body.skills.split(',').map(skill => skill.trim());
      }
      
      // Update job
      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).populate('company', 'name logo website location industry size');
      
      res.json(updatedJob);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Job not found' });
      }
      res.status(500).send('Server Error');
    }
  };
  
  // Delete job
  const deleteJob = async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }
      
      // Check if user is authorized to delete the job
      if (job.postedBy.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Delete all applications for this job
      await Application.deleteMany({ job: req.params.id });
      
      // Delete job
      await job.remove();
      
      res.json({ msg: 'Job removed' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Job not found' });
      }
      res.status(500).send('Server Error');
    }
  };
  
  // Apply for a job
  const applyForJob = async (req, res) => {
    try {
      const { job, coverLetter } = req.body;
      
      // Check if job exists
      const jobData = await Job.findById(job);
      if (!jobData) {
        return res.status(404).json({ msg: 'Job not found' });
      }
      
      // Check if deadline has passed
      if (jobData.deadline && new Date(jobData.deadline) < new Date()) {
        return res.status(400).json({ msg: 'Application deadline has passed' });
      }
      
      // Check if user has already applied
      const existingApplication = await Application.findOne({
        job,
        applicant: req.user.id
      });
      
      if (existingApplication) {
        return res.status(400).json({ msg: 'You have already applied for this job' });
      }
      
      // Check if user has a resume
      const user = await User.findById(req.user.id);
      if (!user.resume) {
        return res.status(400).json({ msg: 'Please upload your resume before applying' });
      }
      
      // Create new application
      const newApplication = new Application({
        job,
        applicant: req.user.id,
        company: jobData.company,
        coverLetter,
        resume: user.resume
      });
      
      const application = await newApplication.save();
      
      res.json(application);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  // Get user's job applications
  const getUserApplications = async (req, res) => {
    try {
      const applications = await Application.find({ applicant: req.user.id })
        .populate('job', 'title company status')
        .populate('company', 'name logo')
        .sort({ appliedAt: -1 });
      
      res.json(applications);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  // Get jobs posted by employer
  const getEmployerJobs = async (req, res) => {
    try {
      // Get companies owned by employer
      const companies = await Company.find({ owner: req.user.id });
      const companyIds = companies.map(company => company._id);
      
      // Get jobs by these companies
      const jobs = await Job.find({ company: { $in: companyIds } })
        .populate('company', 'name logo')
        .sort({ createdAt: -1 });
      
      res.json(jobs);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  // Get applications for a job
  const getJobApplications = async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);
      
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }
      
      // Check if user is authorized to view applications
      const company = await Company.findById(job.company);
      if (company.owner.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Get applications
      const applications = await Application.find({ job: req.params.jobId })
        .populate('applicant', 'name email avatar')
        .sort({ appliedAt: -1 });
      
      res.json(applications);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Job not found' });
      }
      res.status(500).send('Server Error');
    }
  };
  
  // Update application status
  const updateApplicationStatus = async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
      }
      
      const application = await Application.findById(req.params.applicationId);
      
      if (!application) {
        return res.status(404).json({ msg: 'Application not found' });
      }
      
      // Check if user is authorized to update status
      const job = await Job.findById(application.job);
      const company = await Company.findById(job.company);
      
      if (company.owner.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Update status
      application.status = status;
      application.lastUpdated = Date.now();
      
      await application.save();
      
      res.json(application);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Application not found' });
      }
      res.status(500).send('Server Error');
    }
  };
  
  module.exports = {
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
  };
  