import axios from "axios";

const API_URL = "/api/student-profiles/wishlist"; 

export const getWishlist = async (token: string) => {
   const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
   });
   return response.data;
};

export const toggleWishlist = async (token: string, teacherId: string) => {
   const response = await axios.post(API_URL, { teacherId }, {
      headers: { Authorization: `Bearer ${token}` }
   });
   return response.data;
};
