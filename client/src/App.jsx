import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
import useSocketStore from "./store/socketStore";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import AlumniDashboard from "./pages/Dashboard/AlumniDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import FindMentor from "./pages/Mentorship/FindMentor";
import MySessions from "./pages/Mentorship/MySessions";
import EventList from "./pages/Events/EventList";
import EventDetail from "./pages/Events/EventDetail";
import CreateEvent from "./pages/Events/CreateEvent";
import Forum from "./pages/Forum/Forum";
import ThreadDetail from "./pages/Forum/ThreadDetail";
import ChatPage from "./pages/Chat/ChatPage";
import ViewProfile from "./pages/Profile/ViewProfile";
import EditProfile from "./pages/Profile/EditProfile";
import ChatBot from "./pages/AI/ChatBot";
import JobRecommendations from "./pages/AI/JobRecommendations";
import ResumeAnalyzer from "./pages/AI/ResumeAnalyzer";
import VerifyMe from "./pages/Verification/VerifyMe";
import AdminVerify from "./pages/Verification/AdminVerify";
import JobsBoard from "./pages/Jobs/JobsBoard";
import StudyGroups from "./pages/StudyGroups/StudyGroups";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import AchievementsPage from "./pages/Achievements/AchievementsPage";
import Layout from "./components/common/Layout";
import Spinner from "./components/common/Spinner";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuthStore();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "alumni") return <AlumniDashboard />;
  return <StudentDashboard />;
};

export default function App() {
  const { init, user, accessToken, loading } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (user && accessToken) connect(accessToken);
    else disconnect();
  }, [user, accessToken]);
  if (loading) return <Spinner full />;
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", fontWeight: "500", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }, success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } }, error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="mentors" element={<FindMentor />} />
          <Route path="sessions" element={<MySessions />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/create" element={<ProtectedRoute roles={["alumni","admin"]}><CreateEvent /></ProtectedRoute>} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<ThreadDetail />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:room" element={<ChatPage />} />
          <Route path="profile/:id" element={<ViewProfile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="ai-jobs" element={<JobRecommendations />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="verify" element={<VerifyMe />} />
          <Route path="admin/verify" element={<ProtectedRoute roles={["admin"]}><AdminVerify /></ProtectedRoute>} />
          <Route path="jobs" element={<JobsBoard />} />
          <Route path="study-groups" element={<StudyGroups />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {user && <ChatBot />}
    </BrowserRouter>
  );
}
