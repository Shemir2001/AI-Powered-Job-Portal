const { analyzeResume, generateCoverLetter, optimizeJobSearch } = require('../utils/geminiAi');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

// Analyze resume for a specific job
const analyzeResumeForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Get user resume
    const user = await User.findById(req.user.id);
    if (!user.resume) {
      return res.status(400).json({ msg: 'Please upload your resume first' });
    }
    
    // In a real application, you would extract text from the resume file
    // For this demo, we'll use skills and experience as resume text
    const resumeText = `
      Skills: ${user.skills.join(', ')}
      Experience: ${user.experience.map(exp => 
        `${exp.title} at ${exp.company} (${exp.description})`
      ).join('\n')}
      Education: ${user.education.map(edu => 
        `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`
      ).join('\n')}
    `;
    
    // Get job description
    const jobDescription = `
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Responsibilities: ${job.responsibilities}
    `;
    
    // Call AI to analyze resume
    const analysis = await analyzeResume(resumeText, jobDescription);
    
    res.json({ analysis });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Generate cover letter for a job
const generateJobCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Get user details
    const user = await User.findById(req.user.id);
    
    // In a real application, you would extract text from the resume file
    // For this demo, we'll use skills and experience as resume text
    const resumeText = `
      Skills: ${user.skills.join(', ')}
      Experience: ${user.experience.map(exp => 
        `${exp.title} at ${exp.company} (${exp.description})`
      ).join('\n')}
      Education: ${user.education.map(edu => 
        `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`
      ).join('\n')}
    `;
    
    // Get job description
    const jobDescription = `
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Responsibilities: ${job.responsibilities}
    `;
    
    // Call AI to generate cover letter
    const coverLetter = await generateCoverLetter(resumeText, jobDescription, user.name);
    
    res.json({ coverLetter });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Analyze applications with AI (for employers)
const analyzeApplicationsWithAI = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job details
    const job = await Job.findById(jobId)
      .populate('company');
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Check if user is authorized
    if (job.company.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Get all applications for this job
    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email skills experience education');
    
    // In a real implementation, you would analyze each application
    // For demo purposes, we'll just return basic mock analysis
    const analysisResults = applications.map(app => {
      // Calculate a mock AI score (1-100)
      const aiScore = Math.floor(Math.random() * 40) + 60;
      
      // Mock recommendation based on score
      let recommendation;
      if (aiScore >= 85) {
        recommendation = 'Strong candidate - Highly Recommended';
      } else if (aiScore >= 70) {
        recommendation = 'Good candidate - Recommended';
      } else {
        recommendation = 'Average candidate - Consider';
      }
      
      return {
        applicationId: app._id,
        applicantName: app.applicant.name,
        aiScore,
        recommendation,
        matchingSkills: app.applicant.skills.filter(skill => 
          job.skills.includes(skill)
        ),
        missingSkills: job.skills.filter(skill => 
          !app.applicant.skills.includes(skill)
        )
      };
    });
    
    // Sort by AI score (highest first)
    analysisResults.sort((a, b) => b.aiScore - a.aiScore);
    
    res.json(analysisResults);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get job search recommendations for user
const getJobSearchRecommendations = async (req, res) => {
  try {
    // Get user profile
    const user = await User.findById(req.user.id);
    
    // Construct user profile for AI
    const userProfile = {
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      bio: user.bio
    };
    
    // Get job preferences from request
    const { industries, jobTypes, locations, minSalary } = req.body;
    
    const jobPreferences = {
      industries: industries || [],
      jobTypes: jobTypes || [],
      locations: locations || [],
      minSalary: minSalary || 0
    };
    
    // Call AI to optimize job search
    const recommendations = await optimizeJobSearch(userProfile, jobPreferences);
    
    res.json({ recommendations });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  analyzeResumeForJob,
  generateJobCoverLetter,
  analyzeApplicationsWithAI,
  getJobSearchRecommendations
};
