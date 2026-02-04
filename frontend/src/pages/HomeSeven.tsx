import Wrapper from '../layouts/Wrapper';
import HomeSevenMain from '../components/homes/home-seven';
import SEO from '../components/SEO';

const HomeSeven = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Home Seven'} />
         <HomeSevenMain />
      </Wrapper>
   );
};

export default HomeSeven;