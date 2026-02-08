const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).populate('faculty', 'name email');
    
    res.json({
      success: true,
      count: subjects.length,
      subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('faculty', 'name email');
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, credits, semester } = req.body;

    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      credits,
      semester,
      faculty: req.user.id
    });

    const students = await User.find({ role: 'student' });
    await Promise.all(
      students.map(student => {
        student.enrolledSubjects.push(subject._id);
        return student.save();
      })
    );

    res.status(201).json({
      success: true,
      subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
