import Wrapper from '../layouts/Wrapper';
import NotFoundMain from '../components/inner-pages/error';
import SEO from '../components/SEO';

const NotFound = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte NotFound'} />
         <NotFoundMain />
      </Wrapper>
   );
};

export default NotFound;