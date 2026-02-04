import Wrapper from '../layouts/Wrapper';
import ShopDetailsMain from '../components/inner-shop/product-details';
import SEO from '../components/SEO';

const ShopDetails = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Shop Details'} />
         <ShopDetailsMain />
      </Wrapper>
   );
};

export default ShopDetails;