import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Plus, Upload, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

const Assignments = () => {
  const { user, socket } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    totalMarks: 100
  });
  const [files, setFiles] = useState([]);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();

    if (socket) {
      socket.on('new-assignment', (assignment) => {
        setAssignments(prev => [assignment, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-assignment');
      }
    };
  }, [socket]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/assignments');
      setAssignments(res.data.assignments);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      files.forEach(file => {
        data.append('files', file);
      });

      await axios.post('/api/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setFormData({ title: '', description: '', subject: '', dueDate: '', totalMarks: 100 });
      setFiles([]);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('comments', comments);
      submissionFiles.forEach(file => {
        data.append('files', file);
      });

      await axios.post(`/api/assignments/${selectedAssignment._id}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionFiles([]);
      setComments('');
      fetchAssignments();
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  const getStatusBadge = (assignment) => {
    if (user?.role === 'admin') return null;

    const status = assignment.submissionStatus || 'pending';
    const colors = {
      submitted: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      late: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      graded: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    };

    const icons = {
      submitted: CheckCircle,
      pending: XCircle,
      late: Clock,
      graded: CheckCircle
    };

    const Icon = icons[status];

    return (
      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        <Icon size={14} />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
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
            Assignments 📝
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'admin' ? 'Manage assignments' : 'View and submit assignments'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <FileText className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assignment.subject?.name}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mt-3 mb-4">
                  {assignment.description}
                </p>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Marks: {assignment.totalMarks}
                  </span>
                  {assignment.attachments?.length > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {assignment.attachments.length} file(s) attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(assignment)}
                {user?.role === 'student' && !assignment.hasSubmitted && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowSubmitModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 gradient-success text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Upload size={16} />
                    <span>Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass dark:glass-dark rounded-2xl p-6 max-w-2xl w-full my-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Assignment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass dark:glass-dark rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Submit Assignment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedAssignment.title}
            </p>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files))}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 gradient-success text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
