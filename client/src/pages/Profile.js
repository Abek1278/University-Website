import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, Edit2, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
      alert('Profile updated successfully!');
    } else {
      alert(result.message || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile 👤
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass dark:glass-dark rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?background=random'}
                alt={user?.name}
                className="w-32 h-32 rounded-full mx-auto border-4 border-primary-500"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-dark-800"></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {user?.email}
            </p>
            <span className="inline-block px-4 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold">
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.department}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Admin ID' : 'Student ID'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.studentId || user?.adminId}
                  </span>
                </div>
                {user?.role === 'student' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Enrolled Subjects</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.enrolledSubjects?.length || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Account Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Avatar URL
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="text-gray-400" size={20} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Full Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">
                    {user?.name}
                  </p>
                </div>

                <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail className="text-gray-400" size={20} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email Address</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">
                    {user?.email}
                  </p>
                </div>

                <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Key className="text-gray-400" size={20} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.role === 'admin' ? 'Admin ID' : 'Student ID'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">
                    {user?.studentId || user?.adminId}
                  </p>
                </div>

                <div className="p-4 bg-white/50 dark:bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="text-gray-400" size={20} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          {user?.role === 'student' && user?.enrolledSubjects && (
            <div className="glass dark:glass-dark rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Enrolled Subjects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.enrolledSubjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="p-3 bg-white/50 dark:bg-dark-800/50 rounded-lg"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {subject.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.code}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
