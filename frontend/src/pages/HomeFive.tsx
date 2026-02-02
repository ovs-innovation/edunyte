import Wrapper from '../layouts/Wrapper';
import HomeFiveMain from '../components/homes/home-five';
import SEO from '../components/SEO';

const HomeFive = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Edunyte Home Five'} />
      <HomeFiveMain />
    </Wrapper>
  );
};

export default HomeFive;