import Wrapper from '../layouts/Wrapper';
import RegistrationMain from '../components/inner-pages/registration';
import SEO from '../components/SEO';

const Registration = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Registration'} />
         <RegistrationMain />
      </Wrapper>
   );
};

export default Registration;