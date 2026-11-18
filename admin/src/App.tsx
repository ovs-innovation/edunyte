import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { RoleProvider } from "@/contexts/RoleContext";
import { ThemeColorProvider } from "@/contexts/ThemeColorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages to reduce initial bundle from 10MB to <300KB
const DashboardRouter = lazy(() => import("./components/DashboardRouter"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const TeacherDashboardPage = lazy(() => import("./pages/TeacherDashboardPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const TeachersPage = lazy(() => import("./pages/TeachersPage"));
const StudentsPage = lazy(() => import("./pages/StudentsPage"));
const RolesPage = lazy(() => import("./pages/RolesPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TeacherProfilePage = lazy(() => import("./pages/TeacherProfilePage"));
const SupportTicketsPage = lazy(() => import("./pages/SupportTicketsPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const ReviewModerationPage = lazy(() => import("./pages/ReviewModerationPage"));
const CourseManagementPage = lazy(() => import("./pages/CourseManagementPage"));
const CategoryManagementPage = lazy(() => import("./pages/CategoryManagementPage"));
const TeacherApprovalPage = lazy(() => import("./pages/TeacherApprovalPage"));
const TeacherJoinCoursePage = lazy(() => import("./pages/TeacherJoinCoursePage"));
const TeacherMyCoursesPage = lazy(() => import("./pages/TeacherMyCoursesPage"));
const TeacherAvailabilityPage = lazy(() => import("./pages/TeacherAvailabilityPage"));
const TeacherBookingsPage = lazy(() => import("./pages/TeacherBookingsPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex h-screen h-[100dvh] w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeColorProvider>
          <RoleProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
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
                      path="/payments"
                      element={
                        <ProtectedRoute>
                          <PaymentsPage />
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
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </RoleProvider>
        </ThemeColorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
