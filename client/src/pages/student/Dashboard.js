import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Calendar, FileText, BookOpen, TrendingUp, 
  CheckCircle, XCircle, Clock, Bell 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { user, socket } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAnnouncements();

    if (socket) {
      socket.on('attendance-updated', () => {
        fetchDashboardData();
      });

      socket.on('new-announcement', (announcement) => {
        setRecentAnnouncements(prev => [announcement, ...prev.slice(0, 4)]);
      });
    }

    return () => {
      if (socket) {
        socket.off('attendance-updated');
        socket.off('new-announcement');
      }
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/analytics/dashboard');
      setAnalytics(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setRecentAnnouncements(res.data.announcements.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  const attendanceData = analytics?.attendance ? [
    { name: 'Present', value: analytics.attendance.present, color: '#10b981' },
    { name: 'Absent', value: analytics.attendance.absent, color: '#ef4444' },
    { name: 'Late', value: analytics.attendance.late, color: '#f59e0b' }
  ] : [];

  const assignmentData = analytics?.assignments ? [
    { name: 'Submitted', value: analytics.assignments.submitted, color: '#10b981' },
    { name: 'Pending', value: analytics.assignments.pending, color: '#ef4444' },
    { name: 'Late', value: analytics.assignments.late, color: '#f59e0b' }
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your academic overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.attendance?.percentage || 0}%
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Calendar className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="text-green-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              {analytics?.attendance?.present || 0} / {analytics?.attendance?.total || 0} lectures
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assignments</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.assignments?.submitted || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="text-blue-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              {analytics?.assignments?.pending || 0} pending
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {user?.enrolledSubjects?.length || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              First Year Engineering
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Submissions</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.assignments?.late || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Clock className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <XCircle className="text-orange-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              Needs attention
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Attendance Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Assignment Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assignmentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {assignmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Subject-wise Attendance
          </h2>
        </div>
        <div className="space-y-4">
          {analytics?.subjectWiseAttendance?.map((subject, index) => (
            <div key={index} className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {subject.subject}
                </h3>
                <span className={`font-bold ${
                  parseFloat(subject.percentage) >= 75 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {subject.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    parseFloat(subject.percentage) >= 75 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Present: {subject.present}</span>
                <span>Absent: {subject.absent}</span>
                <span>Late: {subject.late}</span>
                <span>Total: {subject.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="mr-2" size={24} />
            Recent Announcements
          </h2>
        </div>
        <div className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {announcement.content}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      {announcement.subject && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{announcement.subject.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    announcement.priority === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    announcement.priority === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No announcements yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
