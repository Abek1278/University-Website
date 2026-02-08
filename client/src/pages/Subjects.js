import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, Users } from 'lucide-react';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 4,
    semester: 1
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data.subjects);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/subjects', formData);
      setShowModal(false);
      setFormData({ name: '', code: '', description: '', credits: 4, semester: 1 });
      fetchSubjects();
    } catch (error) {
      console.error('Failed to create subject:', error);
      alert(error.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`/api/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error('Failed to delete subject:', error);
      }
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
            Subjects 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            First Year Engineering Curriculum
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Add Subject</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <BookOpen className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-white/20 dark:hover:bg-dark-700 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="p-2 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {subject.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {subject.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold">
                  {subject.code}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {subject.credits} Credits
                </span>
              </div>
            </div>

            {subject.totalLectures > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Lectures</span>
                  <span className="font-bold text-gradient">{subject.totalLectures}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass dark:glass-dark rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Subject
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
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
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                    min="1"
                    max="6"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Semester
                  </label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                    min="1"
                    max="8"
                    required
                  />
                </div>
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
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
