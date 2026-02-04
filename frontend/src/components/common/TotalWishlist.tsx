import { useWishlist } from "../../contexts/WishlistContext";

const TotalWishlist = () => {
   const { itemCount } = useWishlist();

   return (
      <>
         <span className="wishlist-count">{itemCount}</span>
      </>
   );
}

export default TotalWishlist;
