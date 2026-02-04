import Wrapper from '../layouts/Wrapper';
import ShopMain from '../components/inner-shop/product';
import SEO from '../components/SEO';

const Shop = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Shop'} />
         <ShopMain />
      </Wrapper>
   );
};

export default Shop;