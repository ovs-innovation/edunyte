import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { RoleProvider } from "@/contexts/RoleContext";
import { ThemeColorProvider } from "@/contexts/ThemeColorContext";
import ControlDashboardPage from "./pages/ControlDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import UsersPage from "./pages/UsersPage";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import RolesPage from "./pages/RolesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import LoginPage from "./pages/LoginPage";
import SupportTicketsPage from "./pages/SupportTicketsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ReviewModerationPage from "./pages/ReviewModerationPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import TeacherApprovalPage from "./pages/TeacherApprovalPage";
import TeacherJoinCoursePage from "./pages/TeacherJoinCoursePage";
import TeacherMyCoursesPage from "./pages/TeacherMyCoursesPage";
import TeacherAvailabilityPage from "./pages/TeacherAvailabilityPage";
import TeacherBookingsPage from "./pages/TeacherBookingsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRouter from "./components/DashboardRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ThemeColorProvider>
        <RoleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher-dashboard"
                  element={
                    <ProtectedRoute>
                      <TeacherDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teachers"
                  element={
                    <ProtectedRoute>
                      <TeachersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <StudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute>
                      <RolesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support-tickets"
                  element={
                    <ProtectedRoute>
                      <SupportTicketsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <AnnouncementsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <ProtectedRoute>
                      <ReviewModerationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher-profile"
                  element={
                    <ProtectedRoute>
                      <TeacherProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <CourseManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoryManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher-approvals"
                  element={
                    <ProtectedRoute>
                      <TeacherApprovalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/join-course"
                  element={
                    <ProtectedRoute>
                      <TeacherJoinCoursePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/my-courses"
                  element={
                    <ProtectedRoute>
                      <TeacherMyCoursesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/availability"
                  element={
                    <ProtectedRoute>
                      <TeacherAvailabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/bookings"
                  element={
                    <ProtectedRoute>
                      <TeacherBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RoleProvider>
      </ThemeColorProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
