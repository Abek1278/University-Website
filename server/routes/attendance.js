const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');

router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const attendanceRecords = await Attendance.find({ student: req.params.studentId })
      .populate('subject', 'name code')
      .sort('-date');

    const subjectWiseAttendance = {};
    
    attendanceRecords.forEach(record => {
      const subjectId = record.subject._id.toString();
      if (!subjectWiseAttendance[subjectId]) {
        subjectWiseAttendance[subjectId] = {
          subject: record.subject,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0
        };
      }
      
      subjectWiseAttendance[subjectId].total++;
      if (record.status === 'present') {
        subjectWiseAttendance[subjectId].present++;
      } else if (record.status === 'absent') {
        subjectWiseAttendance[subjectId].absent++;
      } else if (record.status === 'late') {
        subjectWiseAttendance[subjectId].late++;
      }
    });

    Object.keys(subjectWiseAttendance).forEach(subjectId => {
      const data = subjectWiseAttendance[subjectId];
      data.percentage = data.total > 0 
        ? ((data.present + data.late * 0.5) / data.total * 100).toFixed(2)
        : 0;
    });

    const overallStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.status === 'late').length
    };
    
    overallStats.percentage = overallStats.total > 0
      ? ((overallStats.present + overallStats.late * 0.5) / overallStats.total * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      overallStats,
      subjectWise: Object.values(subjectWiseAttendance),
      records: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/subject/:subjectId', protect, authorize('admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const query = { subject: req.params.subjectId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .sort('-date');

    res.json({
      success: true,
      count: attendanceRecords.length,
      records: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/mark', protect, authorize('admin'), async (req, res) => {
  try {
    const { attendanceData, subject, date } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = attendanceData.map(data => ({
      updateOne: {
        filter: {
          student: data.studentId,
          subject: subject,
          date: attendanceDate
        },
        update: {
          $set: {
            status: data.status,
            markedBy: req.user.id,
            remarks: data.remarks
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOps);

    const subjectDoc = await Subject.findById(subject);
    if (subjectDoc) {
      subjectDoc.totalLectures += 1;
      await subjectDoc.save();
    }

    const updatedRecords = await Attendance.find({
      subject: subject,
      date: attendanceDate
    }).populate('student', 'name studentId');

    updatedRecords.forEach(record => {
      req.io.to(record.student._id.toString()).emit('attendance-updated', {
        subject: subject,
        date: attendanceDate,
        status: record.status
      });
    });

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      records: updatedRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/edit/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, remarks, reason } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    attendance.editHistory.push({
      previousStatus: attendance.status,
      newStatus: status,
      editedBy: req.user.id,
      reason: reason
    });

    attendance.status = status;
    attendance.remarks = remarks;
    
    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'name studentId')
      .populate('subject', 'name code');

    req.io.to(populatedAttendance.student._id.toString()).emit('attendance-updated', {
      subject: populatedAttendance.subject._id,
      date: populatedAttendance.date,
      status: populatedAttendance.status
    });

    res.json({
      success: true,
      attendance: populatedAttendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/report', protect, authorize('admin'), async (req, res) => {
  try {
    const { subject, startDate, endDate } = req.query;
    
    const query = {};
    if (subject) query.subject = subject;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('subject', 'name code')
      .sort('student date');

    const studentStats = {};
    
    attendanceRecords.forEach(record => {
      const studentId = record.student._id.toString();
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0
        };
      }
      
      studentStats[studentId].total++;
      if (record.status === 'present') {
        studentStats[studentId].present++;
      } else if (record.status === 'absent') {
        studentStats[studentId].absent++;
      } else if (record.status === 'late') {
        studentStats[studentId].late++;
      }
    });

    Object.keys(studentStats).forEach(studentId => {
      const stats = studentStats[studentId];
      stats.percentage = stats.total > 0
        ? ((stats.present + stats.late * 0.5) / stats.total * 100).toFixed(2)
        : 0;
    });

    const lowAttendanceStudents = Object.values(studentStats).filter(
      stats => parseFloat(stats.percentage) < 75
    );

    res.json({
      success: true,
      studentStats: Object.values(studentStats),
      lowAttendanceStudents,
      totalRecords: attendanceRecords.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/low-attendance', protect, authorize('admin'), async (req, res) => {
  try {
    const threshold = req.query.threshold || 75;
    
    const students = await User.find({ role: 'student' });
    const lowAttendanceStudents = [];

    for (const student of students) {
      const attendanceRecords = await Attendance.find({ student: student._id });
      
      if (attendanceRecords.length > 0) {
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const late = attendanceRecords.filter(r => r.status === 'late').length;
        const total = attendanceRecords.length;
        const percentage = ((present + late * 0.5) / total * 100).toFixed(2);
        
        if (parseFloat(percentage) < threshold) {
          lowAttendanceStudents.push({
            student: {
              id: student._id,
              name: student.name,
              studentId: student.studentId,
              email: student.email
            },
            total,
            present,
            absent: attendanceRecords.filter(r => r.status === 'absent').length,
            late,
            percentage
          });
        }
      }
    }

    res.json({
      success: true,
      count: lowAttendanceStudents.length,
      students: lowAttendanceStudents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
