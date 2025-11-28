import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseBrowser from './pages/student/CourseBrowser';
import CoursePlayer from './pages/student/CoursePlayer';
import CertificateView from './pages/student/CertificateView';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import ManageCourse from './pages/teacher/ManageCourse';
import Profile from './pages/teacher/Profile';
import BatchManager from './pages/teacher/BatchManager';
import AttendanceManager from './pages/teacher/AttendanceManager';
import Insights from './pages/teacher/Insights';
import TestManager from './pages/teacher/TestManager';
import NotificationCenter from './pages/NotificationCenter';

function App() {
    return (
        <ThemeProvider>
            <CssBaseline />
            <ToastProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Student routes */}
                            <Route
                                path="/student/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student/courses"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <CourseBrowser />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student/course/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <CoursePlayer />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/certificate/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <CertificateView />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Teacher routes with Layout */}
                            <Route element={<ProtectedRoute allowedRoles={['teacher']}><Layout /></ProtectedRoute>}>
                                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                                <Route path="/teacher/courses" element={<TeacherCourses />} />
                                <Route path="/teacher/create-course" element={<CreateCourse />} />
                                <Route path="/teacher/course/:id" element={<ManageCourse />} />
                                <Route path="/teacher/batches" element={<BatchManager />} />
                                <Route path="/teacher/attendance" element={<AttendanceManager />} />
                                <Route path="/teacher/insights" element={<Insights />} />
                                <Route path="/teacher/tests" element={<TestManager />} />
                                <Route path="/teacher/profile" element={<Profile />} />
                            </Route>

                            {/* Common Routes */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Notification Center Route */}
                            <Route
                                path="/notifications"
                                element={
                                    <ProtectedRoute>
                                        <NotificationCenter />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
