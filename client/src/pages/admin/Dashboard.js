import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Users, BookOpen, FileText, AlertTriangle, 
  TrendingUp, CheckCircle, Clock, Activity 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard 🎓
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your academic platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.overview?.totalStudents || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="text-blue-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              Active students
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.overview?.totalSubjects || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="text-purple-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              Active courses
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assignments</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.overview?.totalAssignments || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FileText className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="text-green-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              {analytics?.overview?.totalSubmissions || 0} submissions
            </span>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Attendance</p>
              <h3 className="text-3xl font-bold text-gradient mt-2">
                {analytics?.overview?.lowAttendanceStudents || 0}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertTriangle className="text-red-500 mr-1" size={16} />
            <span className="text-gray-600 dark:text-gray-400">
              Below 75% threshold
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Assignment Completion Stats
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.assignmentStats || []}>
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSubmissions" fill="#10b981" name="Submitted" />
              <Bar dataKey="pendingSubmissions" fill="#ef4444" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Recent Submissions
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {analytics?.recentSubmissions?.map((submission) => (
              <div
                key={submission._id}
                className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {submission.student?.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {submission.assignment?.title}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    submission.status === 'submitted' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    submission.status === 'late' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
