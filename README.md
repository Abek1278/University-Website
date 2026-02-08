# Academic Classroom Platform

A modern, cloud-based academic classroom management system designed for first-year engineering students.

## Features

### Student Features
- 📚 View subjects and class streams
- 📝 Submit assignments
- 📊 Track attendance percentage
- 📥 Download notes and materials
- 📢 View announcements
- 👤 Personal dashboard with analytics

### Admin Features
- 🎓 Create and manage subjects
- 📋 Upload assignments and notes
- ✅ Mark and edit daily attendance
- 📈 View comprehensive student analytics
- 📊 Download attendance reports
- 🔍 Monitor assignment completion status

### Technical Features
- 🔐 Secure JWT authentication
- 🔄 Real-time updates with Socket.io
- 🎨 Modern glassmorphism UI design
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- ⚡ Fast and scalable architecture

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.io for real-time updates
- JWT for authentication
- Multer for file uploads

### Frontend
- React 18
- TailwindCSS
- Framer Motion for animations
- Recharts for analytics
- Lucide React for icons

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd windsurf-project
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your MongoDB URI and other configurations.

5. Start the development server
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

## Default Subjects

The platform comes pre-configured with first-year engineering subjects:
- Applied Mathematics – I
- Applied Physics – I
- Applied Chemistry – I
- Engineering Mechanics
- Basic Electrical & Electronics Engineering
- C Programming
- Python Programming
- Engineering Workshop

## User Roles

### Student
- Register with student credentials
- Access student dashboard
- View and interact with course materials

### Admin
- Login with Admin User ID
- Full control over platform operations
- Access to analytics and reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login (student/admin)
- `GET /api/auth/me` - Get current user

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Admin)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)
- `GET /api/assignments/:id/submissions` - Get submissions (Admin)

### Attendance
- `GET /api/attendance/student/:id` - Get student attendance
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `PUT /api/attendance/edit` - Edit attendance (Admin)
- `GET /api/attendance/report` - Generate report (Admin)

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin)

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Upload notes (Admin)
- `GET /api/notes/download/:id` - Download note

## Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue in the repository.
