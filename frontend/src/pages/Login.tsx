import Wrapper from '../layouts/Wrapper';
import LoginMain from '../components/inner-pages/login';
import SEO from '../components/SEO';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ role }: { role?: string }) => {
   const { logout, isAuthenticated } = useAuth();

   useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('logout') === 'true' || searchParams.get('action') === 'logout') {
         if (isAuthenticated) {
            logout();
         } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
         }
         const cleanUrl = window.location.pathname;
         window.history.replaceState({}, '', cleanUrl);
      }
   }, [logout, isAuthenticated]);

   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Login'} />
         <LoginMain role={role} />
      </Wrapper>
   );
};

export default Login;
