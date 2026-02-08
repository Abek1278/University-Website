const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithAI, getQuickInsights } = require('../services/aiService');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Subject = require('../models/Subject');

const getStudentData = async (userId) => {
  try {
    const user = await User.findById(userId).populate('enrolledSubjects');
    
    const assignments = await Assignment.find({ isActive: true })
      .populate('subject')
      .sort({ dueDate: 1 });

    const submissions = await Submission.find({ student: userId });
    
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        submittedAt: submission?.submittedAt,
        marks: submission?.marks
      };
    });

    const attendanceRecords = await Attendance.aggregate([
      { $match: { student: user._id } },
      {
        $group: {
          _id: '$subject',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      }
    ]);

    const attendanceWithSubjects = await Promise.all(
      attendanceRecords.map(async (record) => {
        const subject = await Subject.findById(record._id);
        const percentage = ((record.present + record.late * 0.5) / record.total * 100).toFixed(2);
        return {
          subject: subject,
          total: record.total,
          present: record.present,
          absent: record.absent,
          late: record.late,
          percentage: percentage
        };
      })
    );

    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { subject: { $in: user.enrolledSubjects } },
        { subject: null }
      ]
    })
      .populate('subject')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      profile: {
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department
      },
      subjects: user.enrolledSubjects,
      assignments: assignmentsWithStatus,
      attendance: attendanceWithSubjects,
      announcements: announcements
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    throw error;
  }
};

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const studentData = await getStudentData(req.user.id);

    const aiResponse = await chatWithAI(message, studentData, conversationHistory || []);

    res.json(aiResponse);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    });
  }
});

router.get('/insights', protect, async (req, res) => {
  try {
    const studentData = await getStudentData(req.user.id);

    const insights = await getQuickInsights(studentData);

    res.json(insights);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

router.get('/student-context', protect, async (req, res) => {
  try {
    const studentData = await getStudentData(req.user.id);

    res.json({
      success: true,
      data: studentData
    });
  } catch (error) {
    console.error('Context Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student context',
      error: error.message
    });
  }
});

module.exports = router;
