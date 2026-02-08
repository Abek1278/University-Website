import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bell, Plus, AlertCircle } from 'lucide-react';

const Announcements = () => {
  const { user, socket } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    priority: 'medium',
    expiresAt: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchSubjects();

    if (socket) {
      socket.on('new-announcement', (announcement) => {
        setAnnouncements(prev => [announcement, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-announcement');
      }
    };
  }, [socket]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data.announcements);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
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
      await axios.post('/api/announcements', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', subject: '', priority: 'medium', expiresAt: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-500',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-500',
      medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500',
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border-gray-500'
    };
    return colors[priority] || colors.medium;
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
            Announcements 📢
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'admin' ? 'Manage announcements' : 'Stay updated with latest news'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className={`glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all border-l-4 ${getPriorityColor(announcement.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Bell className="text-primary-600" size={24} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    {announcement.subject && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {announcement.subject.name}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mt-3 mb-4 whitespace-pre-wrap">
                  {announcement.content}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>Posted by {announcement.createdBy?.name}</span>
                  <span>•</span>
                  <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                  {announcement.expiresAt && (
                    <>
                      <span>•</span>
                      <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority.toUpperCase()}
                </span>
                {announcement.priority === 'urgent' && (
                  <AlertCircle className="text-red-600 dark:text-red-400 animate-pulse" size={24} />
                )}
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="glass dark:glass-dark rounded-2xl p-12 text-center">
            <Bell size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No announcements yet
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass dark:glass-dark rounded-2xl p-6 max-w-2xl w-full animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Announcement
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
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="6"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Subject (Optional)
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
