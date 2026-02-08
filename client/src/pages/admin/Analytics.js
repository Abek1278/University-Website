import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, TrendingDown, Users } from 'lucide-react';

const Analytics = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/attendance/low-attendance?threshold=100');
      setStudents(res.data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchStudentAnalytics = async (studentId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/analytics/student/${studentId}`);
      setStudentAnalytics(res.data);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Analytics 📊
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed performance insights
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Students
            </h2>
            <Users size={24} className="text-primary-600" />
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {filteredStudents.map((student) => (
              <button
                key={student.student.id}
                onClick={() => fetchStudentAnalytics(student.student.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedStudent === student.student.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/50 dark:bg-dark-800/50 hover:bg-white/80 dark:hover:bg-dark-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{student.student.name}</h3>
                    <p className="text-sm opacity-75">{student.student.studentId}</p>
                  </div>
                  <div className={`flex items-center ${
                    parseFloat(student.percentage) < 75 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {parseFloat(student.percentage) < 75 && <TrendingDown size={16} className="mr-1" />}
                    <span className="font-bold">{student.percentage}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="glass dark:glass-dark rounded-2xl p-6 flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          ) : studentAnalytics ? (
            <div className="space-y-6">
              <div className="glass dark:glass-dark rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {studentAnalytics.student.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {studentAnalytics.student.studentId} • {studentAnalytics.student.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Lectures</p>
                    <h3 className="text-2xl font-bold text-gradient mt-1">
                      {studentAnalytics.analytics.attendance.total}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {studentAnalytics.analytics.attendance.present}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {studentAnalytics.analytics.attendance.absent}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
                    <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {studentAnalytics.analytics.attendance.late}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="glass dark:glass-dark rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Assignment Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <h3 className="text-2xl font-bold text-gradient mt-1">
                      {studentAnalytics.analytics.assignments.total}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {studentAnalytics.analytics.assignments.submitted}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Graded</p>
                    <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {studentAnalytics.analytics.assignments.graded}
                    </h3>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Marks</p>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {studentAnalytics.analytics.assignments.avgMarks}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="glass dark:glass-dark rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Subject-wise Performance
                </h3>
                <div className="space-y-4">
                  {studentAnalytics.analytics.subjectWise?.map((subject, index) => (
                    <div key={index} className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {subject.subject.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Attendance</p>
                          <p className="font-bold text-gradient">
                            {subject.attendance.percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Present / Total</p>
                          <p className="font-bold">
                            {subject.attendance.present} / {subject.attendance.total}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass dark:glass-dark rounded-2xl p-6 flex items-center justify-center h-96">
              <div className="text-center">
                <Users size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a student to view detailed analytics
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
