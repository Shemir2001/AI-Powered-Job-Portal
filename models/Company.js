const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  logo: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  founded: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  aiGeneratedAnalysis: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);