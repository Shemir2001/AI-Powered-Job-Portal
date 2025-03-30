const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generateJobDescription = async (jobInfo) => {
  try {
    const prompt = `Generate a detailed job description for a ${jobInfo.title} position at ${jobInfo.companyName}.
    Industry: ${jobInfo.industry}
    Job Type: ${jobInfo.jobType}
    Experience Level: ${jobInfo.experience}
    Location: ${jobInfo.location}
    
    Include the following sections:
    1. About the company
    2. Job overview
    3. Key responsibilities
    4. Requirements and qualifications
    5. Benefits and perks
    
    Make it professional, engaging, and around 400-500 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating job description:', error);
    throw new Error('Failed to generate job description with AI');
  }
};

const analyzeResume = async (resumeText, jobDescription) => {
  try {
    const prompt = `Analyze the match between this candidate's resume and the job description. 
    
    RESUME:
    ${resumeText}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Provide the following:
    1. Match score (0-100)
    2. Key skills that match
    3. Skills or experiences that are missing
    4. Suggestions for improving the resume for this position
    5. Overall recommendation (Highly Recommended, Recommended, Potentially Suitable, Not Recommended)`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

const generateCoverLetter = async (resumeText, jobDescription, userName) => {
  try {
    const prompt = `Write a professional cover letter for ${userName} applying for this job:
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    CANDIDATE RESUME INFO:
    ${resumeText}
    
    The cover letter should:
    1. Be professionally formatted with today's date
    2. Address the hiring manager appropriately
    3. Highlight 3-4 key relevant experiences/skills from the resume
    4. Explain why the candidate is a good fit for this specific position
    5. Include a call to action in the closing paragraph
    6. Use professional closing and signature
    
    Keep it concise (300-400 words) and compelling.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter with AI');
  }
};

const optimizeJobSearch = async (userProfile, jobPreferences) => {
  try {
    const prompt = `Based on this job seeker's profile and preferences, suggest optimal job search strategies:
    
    USER PROFILE:
    ${JSON.stringify(userProfile)}
    
    JOB PREFERENCES:
    ${JSON.stringify(jobPreferences)}
    
    Please provide:
    1. 5-7 recommended job titles to search for
    2. 8-10 keywords to include in their job search
    3. 3-4 industries that match their background
    4. Suggestions for skills they should highlight
    5. Recommendations for skills they might want to develop`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error optimizing job search:', error);
    throw new Error('Failed to optimize job search with AI');
  }
};

module.exports = {
  generateJobDescription,
  analyzeResume,
  generateCoverLetter,
  optimizeJobSearch
};
