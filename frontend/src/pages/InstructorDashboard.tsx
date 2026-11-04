import { useEffect } from 'react';
import Wrapper from '../layouts/Wrapper';
import InstructorDashboardMain from '../dashboard/instructor-dashboard/dashboard-home';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

const InstructorDashboard = () => {
   const { user, token } = useAuth();

   useEffect(() => {
      if (user?.role === 'teacher' && token) {
         const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:8080';
         window.location.href = `${adminUrl}/teacher-dashboard?token=${encodeURIComponent(token)}`;
      }
   }, [user, token]);

   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Instructor Dashboard'} />
         <InstructorDashboardMain />
      </Wrapper>
   );
};

export default InstructorDashboard;
