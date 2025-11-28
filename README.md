# 🎓 LMS Platform for Tuition Centers

A comprehensive Learning Management System designed specifically for tuition centers and individual tutors in India. This platform enables teachers to upload video lectures, create quizzes, track student progress, and issue certificates - similar to platforms like Byju's and Unacademy but tailored for small-scale tuition businesses.

## ✨ Features

### For Teachers 👨‍🏫
- **Course Management**: Create and manage courses with modules and lectures
- **Video Uploads**: Upload video lectures via Cloudinary integration
- **Quiz Creation**: Build MCQ-based quizzes with automatic grading
- **Student Analytics**: Track student progress, quiz scores, and engagement
- **Certificate Generation**: Automatic certificate issuance upon course completion
- **Batch Management**: Organize students by class (6-12) and subject

### For Students 👨‍🎓
- **Course Browsing**: Browse and enroll in published courses
- **Video Learning**: Watch lectures with progress tracking
- **Quiz Taking**: Attempt quizzes and get instant results
- **Progress Dashboard**: View completion status and performance
- **Certificates**: Earn and download certificates
- **Course Recommendations**: Get personalized course suggestions

### For Admins 👑
- **Platform Management**: Oversee all courses and users
- **Analytics**: View platform-wide statistics
- **Content Moderation**: Approve/reject courses

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - Video and image hosting
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend (Coming Soon)
- **React** + **Vite** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - API calls
- **React Player** - Video playback

## 📁 Project Structure

```
lms/
├── backend/
│   ├── config/          # Configuration files (DB, Cloudinary, Multer)
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation middleware
│   ├── utils/           # Helper functions
│   ├── uploads/         # Temporary file storage
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/            # React application (to be built)
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for video uploads)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd lms
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lms_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Cloudinary (Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=100000000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the backend server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Teacher)
- `PUT /api/courses/:id` - Update course (Teacher)
- `DELETE /api/courses/:id` - Delete course (Teacher)
- `POST /api/courses/:id/modules` - Add module (Teacher)
- `POST /api/courses/:courseId/modules/:moduleId/lectures` - Add lecture (Teacher)
- `POST /api/courses/upload/video` - Upload video (Teacher)
- `POST /api/courses/upload/thumbnail` - Upload thumbnail (Teacher)

### Quizzes
- `POST /api/quizzes` - Create quiz (Teacher)
- `GET /api/quizzes/course/:courseId` - Get course quizzes
- `GET /api/quizzes/:id` - Get quiz (without answers)
- `POST /api/quizzes/:id/submit` - Submit quiz attempt (Student)
- `GET /api/quizzes/:id/attempts` - Get student attempts
- `GET /api/quizzes/:id/analytics` - Get quiz analytics (Teacher)

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course (Student)
- `GET /api/enrollments/my-courses` - Get enrolled courses (Student)
- `POST /api/enrollments/progress` - Update video progress (Student)
- `GET /api/enrollments/:courseId/progress` - Get course progress (Student)

### Certificates
- `GET /api/certificates/my-certificates` - Get student certificates
- `GET /api/certificates/verify/:certificateId` - Verify certificate (Public)
- `GET /api/certificates/:id` - Get certificate details

## 🎯 Key Features Explained

### 1. Video Streaming with Cloudinary
- Teachers upload videos which are stored in Cloudinary
- Videos are streamed efficiently with adaptive bitrate
- Progress tracking saves watch position

### 2. Automatic Quiz Grading
- MCQ-based quizzes with instant results
- Detailed analytics for teachers
- Multiple attempt tracking

### 3. Progress Tracking
- Real-time video watch time monitoring
- Lecture completion tracking
- Overall course progress calculation

### 4. Certificate Generation
- Automatic certificate issuance at 100% completion
- Unique certificate ID for verification
- Public verification endpoint

### 5. Role-Based Access Control
- **Student**: Enroll, learn, take quizzes
- **Teacher**: Create courses, manage content, view analytics
- **Admin**: Platform-wide management

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based route protection
- Input validation
- Secure file uploads

## 📊 Database Models

- **User**: Student, Teacher, Admin profiles
- **Course**: Course structure with modules and lectures
- **Quiz**: MCQ quizzes with questions
- **QuizAttempt**: Student quiz submissions
- **Enrollment**: Student-course relationships
- **Progress**: Video watch progress
- **Certificate**: Course completion certificates

## 🎨 Frontend (Coming Soon)
The React frontend will include:
- Modern, responsive UI with Material-UI
- Teacher dashboard for course management
- Student dashboard for learning
- Video player with progress tracking
- Quiz interface
- Certificate display and download
- Analytics charts

## 📝 TODO
- [ ] Build React frontend
- [ ] Implement PDF certificate generation
- [ ] Add payment gateway (Razorpay)
- [ ] Email notifications
- [ ] Parent dashboard
- [ ] Mobile app (React Native)
- [ ] Live doubt-solving chat
- [ ] Course ratings and reviews

## 🤝 Contributing
This is a portfolio project. Feel free to fork and customize for your needs!

## 📄 License
MIT

## 👨‍💻 Author
**Your Name**
- Portfolio: [your-portfolio.com]
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]

---

**Built with ❤️ for Indian tuition centers**
