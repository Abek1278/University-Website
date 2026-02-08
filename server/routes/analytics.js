const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = req.user.id;

      const attendanceRecords = await Attendance.find({ student: studentId });
      const totalLectures = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
      const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
      const attendancePercentage = totalLectures > 0 
        ? ((presentCount + lateCount * 0.5) / totalLectures * 100).toFixed(2)
        : 0;

      const assignments = await Assignment.find({ isActive: true });
      const submissions = await Submission.find({ student: studentId });
      const submittedCount = submissions.length;
      const pendingCount = assignments.length - submittedCount;
      const lateSubmissions = submissions.filter(s => s.status === 'late').length;

      const subjectWiseAttendance = {};
      attendanceRecords.forEach(record => {
        const subjectId = record.subject.toString();
        if (!subjectWiseAttendance[subjectId]) {
          subjectWiseAttendance[subjectId] = { total: 0, present: 0, absent: 0, late: 0 };
        }
        subjectWiseAttendance[subjectId].total++;
        subjectWiseAttendance[subjectId][record.status]++;
      });

      const subjectStats = await Promise.all(
        Object.keys(subjectWiseAttendance).map(async (subjectId) => {
          const subject = await Subject.findById(subjectId);
          const stats = subjectWiseAttendance[subjectId];
          return {
            subject: subject ? subject.name : 'Unknown',
            ...stats,
            percentage: ((stats.present + stats.late * 0.5) / stats.total * 100).toFixed(2)
          };
        })
      );

      res.json({
        success: true,
        data: {
          attendance: {
            total: totalLectures,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            percentage: attendancePercentage
          },
          assignments: {
            total: assignments.length,
            submitted: submittedCount,
            pending: pendingCount,
            late: lateSubmissions
          },
          subjectWiseAttendance: subjectStats
        }
      });
    } else if (req.user.role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalSubjects = await Subject.countDocuments({ isActive: true });
      const totalAssignments = await Assignment.countDocuments({ isActive: true });
      const totalSubmissions = await Submission.countDocuments();

      const students = await User.find({ role: 'student' });
      let lowAttendanceCount = 0;

      for (const student of students) {
        const attendanceRecords = await Attendance.find({ student: student._id });
        if (attendanceRecords.length > 0) {
          const present = attendanceRecords.filter(r => r.status === 'present').length;
          const late = attendanceRecords.filter(r => r.status === 'late').length;
          const percentage = ((present + late * 0.5) / attendanceRecords.length * 100);
          if (percentage < 75) lowAttendanceCount++;
        }
      }

      const recentSubmissions = await Submission.find()
        .populate('student', 'name studentId')
        .populate('assignment', 'title')
        .sort('-submittedAt')
        .limit(10);

      const assignmentStats = await Assignment.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'assignment',
            as: 'submissions'
          }
        },
        {
          $project: {
            title: 1,
            totalSubmissions: { $size: '$submissions' },
            pendingSubmissions: { $subtract: [totalStudents, { $size: '$submissions' }] }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalStudents,
            totalSubjects,
            totalAssignments,
            totalSubmissions,
            lowAttendanceStudents: lowAttendanceCount
          },
          recentSubmissions,
          assignmentStats
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/student/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id).populate('enrolledSubjects');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const attendanceRecords = await Attendance.find({ student: req.params.id })
      .populate('subject', 'name code');
    
    const submissions = await Submission.find({ student: req.params.id })
      .populate('assignment', 'title totalMarks dueDate');

    const subjectWiseData = {};
    
    attendanceRecords.forEach(record => {
      const subjectId = record.subject._id.toString();
      if (!subjectWiseData[subjectId]) {
        subjectWiseData[subjectId] = {
          subject: record.subject,
          attendance: { total: 0, present: 0, absent: 0, late: 0 },
          assignments: { total: 0, submitted: 0, pending: 0, avgMarks: 0 }
        };
      }
      subjectWiseData[subjectId].attendance.total++;
      subjectWiseData[subjectId].attendance[record.status]++;
    });

    for (const subjectId in subjectWiseData) {
      const stats = subjectWiseData[subjectId].attendance;
      stats.percentage = ((stats.present + stats.late * 0.5) / stats.total * 100).toFixed(2);
    }

    const totalMarks = submissions.reduce((sum, sub) => sum + (sub.marks || 0), 0);
    const gradedSubmissions = submissions.filter(s => s.marks !== undefined && s.marks !== null);
    const avgMarks = gradedSubmissions.length > 0 ? (totalMarks / gradedSubmissions.length).toFixed(2) : 0;

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department
      },
      analytics: {
        attendance: {
          total: attendanceRecords.length,
          present: attendanceRecords.filter(r => r.status === 'present').length,
          absent: attendanceRecords.filter(r => r.status === 'absent').length,
          late: attendanceRecords.filter(r => r.status === 'late').length
        },
        assignments: {
          total: await Assignment.countDocuments({ isActive: true }),
          submitted: submissions.length,
          graded: gradedSubmissions.length,
          avgMarks
        },
        subjectWise: Object.values(subjectWiseData)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
