import Wrapper from '../layouts/Wrapper';
import LoginMain from '../components/inner-pages/login';
import SEO from '../components/SEO';

const Login = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Login'} />
         <LoginMain />
      </Wrapper>
   );
};

export default Login;