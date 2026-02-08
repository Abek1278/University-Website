import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Subjects from './pages/Subjects';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import Syllabus from './pages/Syllabus';
import Analytics from './pages/admin/Analytics';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/student" element={<PrivateRoute role="student" />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="syllabus" element={<Syllabus />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="notes" element={<Notes />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/admin" element={<PrivateRoute role="admin" />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="syllabus" element={<Syllabus />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="notes" element={<Notes />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
