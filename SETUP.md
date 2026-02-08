# Quick Setup Guide

## 🚀 Getting Started

Follow these steps to get the Academic Classroom Platform running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Clone or Navigate to Project

```bash
cd "c:/Users/Abhis/OneDrive/Desktop/ltce hub/CascadeProjects/windsurf-project"
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
copy .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/academic-classroom
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ADMIN_SECRET_KEY=ADMIN_2024_SECURE_KEY
```

### 5. Start MongoDB

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas (cloud) and update the `MONGODB_URI` in `.env`

### 6. Seed the Database

Initialize the database with default subjects:

```bash
node server/seed.js
```

You should see:
```
✅ MongoDB Connected
✅ Default subjects created successfully!
📚 Created 8 subjects
✅ Database seeding completed
```

### 7. Start the Application

**Option A: Run Both Frontend & Backend Together**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 8. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🎓 First Time Setup

### Create Admin Account

1. Go to http://localhost:3000/register
2. Fill in the registration form:
   - **Name:** Your Name
   - **Email:** admin@example.com
   - **Role:** Admin
   - **Admin Secret Key:** `ADMIN_2024_SECURE_KEY` (from your .env file)
   - **Password:** Your secure password
3. Click "Create Account"

### Create Student Account

1. Go to http://localhost:3000/register
2. Fill in the registration form:
   - **Name:** Student Name
   - **Email:** student@example.com
   - **Role:** Student
   - **Student ID:** (Optional, auto-generated if left empty)
   - **Password:** Your secure password
3. Click "Create Account"

## 📚 Default Subjects

The platform comes pre-configured with these first-year engineering subjects:

1. Applied Mathematics – I (MATH101)
2. Applied Physics – I (PHY101)
3. Applied Chemistry – I (CHEM101)
4. Engineering Mechanics (MECH101)
5. Basic Electrical & Electronics Engineering (EEE101)
6. C Programming (CS101)
7. Python Programming (CS102)
8. Engineering Workshop (WORK101)

## 🎨 Features Overview

### Student Features
- ✅ View dashboard with attendance and assignment stats
- ✅ Track subject-wise attendance percentage
- ✅ Submit assignments with file uploads
- ✅ Download notes and study materials
- ✅ View announcements
- ✅ Real-time attendance updates

### Admin Features
- ✅ Comprehensive analytics dashboard
- ✅ Create and manage subjects
- ✅ Create assignments with attachments
- ✅ Mark daily attendance for all students
- ✅ Upload notes and study materials
- ✅ Post announcements with priority levels
- ✅ View student performance analytics
- ✅ Download attendance reports
- ✅ Real-time updates to students

## 🎯 Quick Test Workflow

1. **Login as Admin**
   - Email: admin@example.com
   - Password: (your password)

2. **Create an Assignment**
   - Go to Assignments → Create Assignment
   - Fill in details and submit

3. **Mark Attendance**
   - Go to Attendance
   - Select subject and date
   - Mark students as Present/Absent/Late
   - Click "Mark Attendance"

4. **Upload Notes**
   - Go to Notes → Upload Notes
   - Select subject and upload files

5. **Post Announcement**
   - Go to Announcements → New Announcement
   - Set priority and post

6. **Login as Student**
   - Email: student@example.com
   - Password: (your password)

7. **View Dashboard**
   - See attendance percentage
   - View pending assignments
   - Check announcements

8. **Submit Assignment**
   - Go to Assignments
   - Click "Submit" on an assignment
   - Upload files and submit

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running. Start it with `mongod` command.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in `.env` file or kill the process using that port.

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install` in the root directory and `npm install` in the client directory.

### CORS Error
**Solution:** Ensure `CLIENT_URL` in `.env` matches your frontend URL (default: http://localhost:3000)

### Real-time Updates Not Working
**Solution:** 
- Check if Socket.io is properly connected
- Verify CORS settings
- Check browser console for WebSocket errors

## 📱 Mobile Testing

The platform is fully responsive. Test on mobile by:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `CLIENT_URL` in `.env` to your IP
3. Access from mobile: `http://YOUR_IP:3000`

## 🎨 Theme Toggle

The platform supports both light and dark modes:
- Click the sun/moon icon in the top-right corner to toggle themes
- Theme preference is saved in browser localStorage

## 📊 Sample Data

To test with sample data:
1. Create multiple student accounts
2. Login as admin and mark attendance for different dates
3. Create assignments and have students submit them
4. Upload notes for different subjects
5. Post announcements with different priority levels

## 🚀 Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Subject Endpoints
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)

### Assignment Endpoints
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Admin)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)
- `GET /api/assignments/:id/submissions` - Get submissions (Admin)

### Attendance Endpoints
- `GET /api/attendance/student/:id` - Get student attendance
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `PUT /api/attendance/edit/:id` - Edit attendance (Admin)
- `GET /api/attendance/report` - Get attendance report (Admin)

### Announcement Endpoints
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin)

### Notes Endpoints
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Upload notes (Admin)
- `GET /api/notes/download/:id` - Download note

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/student/:id` - Get student analytics (Admin)

## 🆘 Support

If you encounter any issues:
1. Check the console logs (browser and terminal)
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check that all dependencies are installed
5. Review the error messages carefully

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Backend server running on http://localhost:5000
- ✅ Frontend running on http://localhost:3000
- ✅ MongoDB connected
- ✅ Socket.io ready for real-time updates
- ✅ All features accessible

Happy coding! 🚀
