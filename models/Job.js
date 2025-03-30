const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  responsibilities: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiMatchScore: {
    type: Number,
    default: 0
  },
  aiSuggestedKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date
  }
});

// Add full-text search index
JobSchema.index({ 
  title: 'text', 
  description: 'text', 
  requirements: 'text',
  responsibilities: 'text'
});

module.exports = mongoose.model('Job', JobSchema);