import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

import LandingPage from './pages/LandingPage';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseBrowser from './pages/student/CourseBrowser';
import CoursePlayer from './pages/student/CoursePlayer';
import CertificateView from './pages/student/CertificateView';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentTests from './pages/student/StudentTests';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentPerformance from './pages/student/StudentPerformance';
import StudentTodos from './pages/student/StudentTodos';
import StudentCalendar from './pages/student/StudentCalendar';
import TestEngine from './pages/student/TestEngine';
import Support from './pages/Support';

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
import TestMonitor from './pages/teacher/TestMonitor';
import NotificationCenter from './pages/NotificationCenter';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import ContentManagement from './pages/admin/ContentManagement';
import Announcements from './pages/admin/Announcements';
import AdminSettings from './pages/admin/AdminSettings';

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
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Student routes with Layout */}
                            <Route element={<ProtectedRoute allowedRoles={['student']}><Layout /></ProtectedRoute>}>
                                <Route path="/student/dashboard" element={<StudentDashboard />} />
                                <Route path="/student/courses" element={<CourseBrowser />} />
                                <Route path="/student/course/:id" element={<CoursePlayer />} />
                                <Route path="/certificate/:id" element={<CertificateView />} />
                                <Route path="/student/assignments" element={<StudentAssignments />} />
                                <Route path="/student/tests" element={<StudentTests />} />
                                <Route path="/student/performance" element={<StudentPerformance />} />
                                <Route path="/student/announcements" element={<StudentAnnouncements />} />
                                <Route path="/student/attendance" element={<StudentAttendance />} />
                                <Route path="/student/todos" element={<StudentTodos />} />
                                <Route path="/student/calendar" element={<StudentCalendar />} />
                                <Route path="/student/test/:attemptId/engine" element={<TestEngine />} />
                                <Route path="/support" element={<Support />} />
                            </Route>

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
                                <Route path="/teacher/test/:id/monitor" element={<TestMonitor />} />
                                <Route path="/teacher/profile" element={<Profile />} />
                            </Route>

                            {/* Admin routes with Layout */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<UserManagement />} />
                                {/* Placeholders for other admin links */}
                                <Route path="/admin/courses" element={<CourseManagement />} />
                                <Route path="/admin/content" element={<ContentManagement />} />
                                <Route path="/admin/announcements" element={<Announcements />} />
                                <Route path="/admin/settings" element={<AdminSettings />} />
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

                            {/* Landing Page */}
                            <Route path="/" element={<LandingPage />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
