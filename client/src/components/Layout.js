import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, FileText, Calendar, Bell, FileDown, 
  User, LogOut, Menu, X, Sun, Moon, BarChart3, Sparkles 
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentMenuItems = [
    { name: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { name: 'AI Assistant', icon: Sparkles, path: '/student/ai-assistant' },
    { name: 'Subjects', icon: BookOpen, path: '/student/subjects' },
    { name: 'Syllabus', icon: BookOpen, path: '/student/syllabus' },
    { name: 'Assignments', icon: FileText, path: '/student/assignments' },
    { name: 'Attendance', icon: Calendar, path: '/student/attendance' },
    { name: 'Announcements', icon: Bell, path: '/student/announcements' },
    { name: 'Notes', icon: FileDown, path: '/student/notes' },
    { name: 'Profile', icon: User, path: '/student/profile' },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'AI Assistant', icon: Sparkles, path: '/admin/ai-assistant' },
    { name: 'Subjects', icon: BookOpen, path: '/admin/subjects' },
    { name: 'Syllabus', icon: BookOpen, path: '/admin/syllabus' },
    { name: 'Assignments', icon: FileText, path: '/admin/assignments' },
    { name: 'Attendance', icon: Calendar, path: '/admin/attendance' },
    { name: 'Announcements', icon: Bell, path: '/admin/announcements' },
    { name: 'Notes', icon: FileDown, path: '/admin/notes' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Profile', icon: User, path: '/admin/profile' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50 glass dark:glass-dark border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-dark-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gradient">Academic Platform</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-dark-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?background=random'}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm font-medium">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-16 left-0 bottom-0 w-64 glass dark:glass-dark border-r border-gray-200 dark:border-dark-700 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="mb-6">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {user?.studentId || user?.adminId}
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'hover:bg-white/20 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 pt-16 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
