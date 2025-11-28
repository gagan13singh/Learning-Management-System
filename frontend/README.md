# 🎓 LMS Platform - Frontend

A modern, responsive React frontend for the Learning Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Backend API running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Player** - Video playback (for future use)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   └── CourseCard.jsx      # Reusable course card
│   │   └── ProtectedRoute.jsx      # Route guard
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication state
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── Register.jsx        # Registration page
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx # Student home
│   │   │   └── CourseBrowser.jsx    # Browse courses
│   │   └── teacher/
│   │       └── TeacherDashboard.jsx # Teacher home
│   ├── utils/
│   │   └── api.js                  # Axios instance
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   ├── theme.js                    # MUI theme config
│   └── index.css                   # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Features Implemented

### ✅ Authentication
- Beautiful login/register pages with gradient backgrounds
- JWT token management
- Role-based access control (Student/Teacher/Admin)
- Protected routes

### ✅ Student Features
- Dashboard with enrollment stats
- Browse and search courses
- Filter by category and class
- Enroll in courses
- View enrolled courses with progress

### ✅ Teacher Features
- Dashboard with course statistics
- Create, edit, delete courses
- Publish/unpublish courses
- View enrolled students

### ✅ UI/UX
- Modern, vibrant design with gradients
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Material-UI components
- Custom theme with Inter font

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`.

All API calls are made through the `api.js` utility which:
- Automatically adds JWT tokens to requests
- Handles authentication errors
- Redirects to login on 401 errors

## 🎯 Next Steps

To complete the frontend, you can add:

1. **Course Player** - Video player with progress tracking
2. **Quiz Interface** - Take quizzes and view results
3. **Certificate Page** - View and download certificates
4. **Course Creation** - Form to create new courses
5. **Analytics Dashboard** - Charts for teacher analytics
6. **Profile Page** - Edit user profile

## 🧪 Testing

1. Start the backend server
2. Start the frontend dev server
3. Register as a student or teacher
4. Test the dashboards and course browsing

## 📝 Notes

- Make sure MongoDB is running
- Backend must be running on port 5000
- Frontend runs on port 5173 by default
- Vite proxy forwards `/api` requests to backend

---

**Built with ❤️ using React + Material-UI**
