import Wrapper from '../layouts/Wrapper';
import RegistrationMain from '../components/inner-pages/registration';
import SEO from '../components/SEO';

const Registration = ({ role }: { role?: string }) => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Registration'} />
         <RegistrationMain role={role} />
      </Wrapper>
   );
};

export default Registration;