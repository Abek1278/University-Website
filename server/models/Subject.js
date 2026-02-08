const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide subject code'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 4
  },
  semester: {
    type: Number,
    default: 1
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalLectures: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
