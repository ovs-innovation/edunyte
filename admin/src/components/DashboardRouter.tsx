import { useRole } from '@/contexts/RoleContext';
import ControlDashboardPage from '@/pages/ControlDashboardPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const DashboardRouter = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If role is not set yet, wait
    if (!currentRole) return;
    
    // Only redirect if we're on root path and role doesn't match
    if (location.pathname === '/') {
      if (currentRole === 'teacher') {
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [currentRole, navigate, location.pathname]);

  // Show appropriate dashboard based on role
  if (currentRole === 'teacher') {
    return <TeacherDashboardPage />;
  }
  
  // Default to admin dashboard
  return <ControlDashboardPage />;
};

export default DashboardRouter;

