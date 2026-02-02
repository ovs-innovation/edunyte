import Wrapper from '../layouts/Wrapper';
import HomeSixMain from '../components/homes/home-six';
import SEO from '../components/SEO';

const HomeSix = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Edunyte Home Six'} />
      <HomeSixMain />
    </Wrapper>
  );
};

export default HomeSix;