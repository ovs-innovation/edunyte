import Wrapper from '../layouts/Wrapper';
import CartMain from '../components/inner-shop/cart';
import SEO from '../components/SEO';

const Cart = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Cart'} />
         <CartMain />
      </Wrapper>
   );
};

export default Cart;