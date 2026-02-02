import Wrapper from '../layouts/Wrapper';
import HomeTwoMain from '../components/homes/home-two';
import SEO from '../components/SEO';

const HomeTwo = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Edunyte Home Two'} />
      <HomeTwoMain />
    </Wrapper>
  );
};

export default HomeTwo;