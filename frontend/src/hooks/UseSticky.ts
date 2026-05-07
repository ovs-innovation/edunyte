import { useEffect, useState } from "react";

interface StickyState {
   sticky: boolean;
}

const UseSticky = (): StickyState => {
   const [sticky, setSticky] = useState(false);

   const stickyHeader = (): void => {
      if (window.scrollY >= 0) {
         setSticky(true);
      } else {
         setSticky(false);
      }
   };

   useEffect(() => {
      let ticking = false;
      const onScroll = () => {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               stickyHeader();
               ticking = false;
            });
            ticking = true;
         }
      };

      window.addEventListener("scroll", onScroll, { passive: true });

      return (): void => {
         window.removeEventListener("scroll", onScroll);
      };
   }, []);
   return {
      sticky,
   };
}

export default UseSticky
