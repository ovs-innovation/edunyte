import Wrapper from '../layouts/Wrapper';
import LoginMain from '../components/inner-pages/login';
import SEO from '../components/SEO';

const Login = ({ role }: { role?: string }) => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Login'} />
         <LoginMain role={role} />
      </Wrapper>
   );
};

export default Login;