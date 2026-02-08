import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, CheckCircle, XCircle, Clock, Download, Users } from 'lucide-react';

const Attendance = () => {
  const { user, socket } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentAttendance();
    } else {
      fetchSubjects();
      fetchStudents();
    }

    if (socket) {
      socket.on('attendance-updated', () => {
        if (user?.role === 'student') {
          fetchStudentAttendance();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance-updated');
      }
    };
  }, [user, socket]);

  const fetchStudentAttendance = async () => {
    try {
      const res = await axios.get(`/api/attendance/student/${user.id}`);
      setAttendanceData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data.subjects);
      if (res.data.subjects.length > 0) {
        setSelectedSubject(res.data.subjects[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/auth/students');
      
      if (res.data.success && res.data.students) {
        const allStudents = res.data.students.map(student => ({
          id: student._id,
          name: student.name,
          studentId: student.studentId,
          email: student.email,
          department: student.department,
          status: 'absent'
        }));
        setStudents(allStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        status: student.status,
        remarks: ''
      }));

      await axios.post('/api/attendance/mark', {
        attendanceData,
        subject: selectedSubject,
        date: selectedDate
      });

      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const updateStudentStatus = (studentId, status) => {
    setStudents(students.map(student =>
      student.id === studentId ? { ...student, status } : student
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Attendance 📅
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your attendance record
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Lectures</span>
              <Calendar className="text-primary-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-gradient">
              {attendanceData?.overallStats?.total || 0}
            </h3>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
              {attendanceData?.overallStats?.present || 0}
            </h3>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
              <XCircle className="text-red-600" size={20} />
            </div>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
              {attendanceData?.overallStats?.absent || 0}
            </h3>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Percentage</span>
              <Clock className="text-orange-600" size={20} />
            </div>
            <h3 className={`text-3xl font-bold ${
              parseFloat(attendanceData?.overallStats?.percentage || 0) >= 75
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {attendanceData?.overallStats?.percentage || 0}%
            </h3>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Subject-wise Attendance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendanceData?.subjectWise?.map((subject, index) => {
              const percentage = parseFloat(subject.percentage);
              const isGood = percentage >= 75;
              const circumference = 2 * Math.PI * 45;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;
              
              return (
                <div 
                  key={index} 
                  className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                >
                  {/* Subject Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {subject.subject.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subject.subject.code || 'Subject Code'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isGood
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {isGood ? '✓ Safe' : '⚠ Low'}
                    </div>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200 dark:text-dark-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className={`transition-all duration-1000 ${
                            isGood ? 'text-green-500' : 'text-red-500'
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <span className={`text-3xl font-bold ${
                          isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">Attendance</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {subject.total}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Total Classes
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {subject.present}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Present
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {subject.absent}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Absent
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {subject.late}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Late
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          isGood
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                    {!isGood && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 text-center font-medium">
                        Need {Math.ceil((75 * subject.total - subject.present * 100) / 25)} more classes to reach 75%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Recent Records
          </h2>
          <div className="space-y-2">
            {attendanceData?.records?.slice(0, 10).map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-dark-800/50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {record.subject.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'present'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : record.status === 'absent'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mark Attendance 📋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Daily attendance management
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Subject and Date Selection */}
      <div className="glass dark:glass-dark rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
            >
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="glass dark:glass-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Students ({students.length})
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Present: {students.filter(s => s.status === 'present').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Absent: {students.filter(s => s.status === 'absent').length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {students.map((student) => (
            <div
              key={student.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                student.status === 'present'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.studentId}
                  </p>
                </div>
                <button
                  onClick={() => updateStudentStatus(
                    student.id, 
                    student.status === 'present' ? 'absent' : 'present'
                  )}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    student.status === 'present'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {student.status === 'present' ? (
                    <CheckCircle size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                </button>
              </div>
              
              <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                student.status === 'present'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              }`}>
                {student.status === 'present' ? '✓ Present' : '✗ Absent'}
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No students found. Please ensure students are registered in the system.
            </p>
          </div>
        )}

        {students.length > 0 && (
          <button
            onClick={handleMarkAttendance}
            className="w-full py-4 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all text-lg"
          >
            Save Attendance for {subjects.find(s => s._id === selectedSubject)?.name || 'Selected Subject'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Attendance;
