import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, toggleWishlist as toggleWishlistApi } from "../services/wishlistService";
import { toast } from "react-toastify";

interface WishlistContextType {
   wishlist: any[];
   itemCount: number;
   toggleWishlist: (teacherId: string) => Promise<void>;
   isInWishlist: (teacherId: string) => boolean;
   loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { token, isAuthenticated } = useAuth();
   const [wishlist, setWishlist] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);

   const fetchWishlist = async () => {
      if (!token) {
         setWishlist([]);
         return;
      }
      setLoading(true);
      try {
         const data = await getWishlist(token);
         setWishlist(data.wishlist || []);
      } catch (error) {
         console.error("Failed to fetch wishlist", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (isAuthenticated) {
         fetchWishlist();
      } else {
         setWishlist([]);
      }
   }, [isAuthenticated, token]);

   const toggleWishlist = async (teacherId: string) => {
      if (!isAuthenticated || !token) {
         toast.info("Please login to add to wishlist");
         return;
      }

      try {
         const response = await toggleWishlistApi(token, teacherId);
         if (response.success) {
            if (response.isAdded) {
               toast.success("Added to wishlist");
            } else {
               toast.info("Removed from wishlist");
            }
            // Refresh logic or Optimistic update
             fetchWishlist(); 
         }
      } catch (error) {
         console.error("Failed to toggle wishlist", error);
         toast.error("Something went wrong");
      }
   };

   const isInWishlist = (teacherId: string) => {
      return wishlist.some((teacher) => teacher.userId?._id === teacherId || teacher._id === teacherId);
   };

   return (
      <WishlistContext.Provider value={{
         wishlist,
         itemCount: wishlist.length,
         toggleWishlist,
         isInWishlist,
         loading
      }}>
         {children}
      </WishlistContext.Provider>
   );
};

export const useWishlist = () => {
   const context = useContext(WishlistContext);
   if (context === undefined) {
      throw new Error("useWishlist must be used within a WishlistProvider");
   }
   return context;
};
