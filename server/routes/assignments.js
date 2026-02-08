const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'name code')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const assignmentObj = assignment.toObject();
        
        if (req.user.role === 'student') {
          const submission = await Submission.findOne({
            assignment: assignment._id,
            student: req.user.id
          });
          assignmentObj.submissionStatus = submission ? submission.status : 'pending';
          assignmentObj.hasSubmitted = !!submission;
        }
        
        return assignmentObj;
      })
    );

    res.json({
      success: true,
      count: assignmentsWithStatus.length,
      assignments: assignmentsWithStatus
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
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const assignmentObj = assignment.toObject();

    if (req.user.role === 'student') {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user.id
      });
      assignmentObj.submission = submission;
    }

    res.json({
      success: true,
      assignment: assignmentObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/', protect, authorize('admin'), upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, subject, dueDate, totalMarks } = req.body;

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path
    })) : [];

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      dueDate,
      totalMarks,
      attachments,
      createdBy: req.user.id
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('subject', 'name code')
      .populate('createdBy', 'name');

    req.io.emit('new-assignment', populatedAssignment);

    res.status(201).json({
      success: true,
      assignment: populatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/:id/submit', protect, authorize('student'), upload.array('files', 5), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path
    })) : [];

    const isLate = new Date() > new Date(assignment.dueDate);

    const existingSubmission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user.id
    });

    let submission;

    if (existingSubmission) {
      existingSubmission.files = files;
      existingSubmission.comments = req.body.comments;
      existingSubmission.status = isLate ? 'late' : 'submitted';
      existingSubmission.submittedAt = Date.now();
      submission = await existingSubmission.save();
    } else {
      submission = await Submission.create({
        assignment: req.params.id,
        student: req.user.id,
        files,
        comments: req.body.comments,
        status: isLate ? 'late' : 'submitted'
      });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name studentId')
      .populate('assignment', 'title');

    req.io.emit('new-submission', populatedSubmission);

    res.status(201).json({
      success: true,
      submission: populatedSubmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id/submissions', protect, authorize('admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name studentId email')
      .sort('-submittedAt');

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/submissions/:id/grade', protect, authorize('admin'), async (req, res) => {
  try {
    const { marks, feedback, status } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        marks,
        feedback,
        status: status || 'graded',
        gradedAt: Date.now(),
        gradedBy: req.user.id
      },
      { new: true }
    ).populate('student', 'name studentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    req.io.to(submission.student._id.toString()).emit('assignment-graded', submission);

    res.json({
      success: true,
      submission
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
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
