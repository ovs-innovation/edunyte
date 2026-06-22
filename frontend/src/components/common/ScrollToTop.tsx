import { useState, useEffect } from "react";
import UseSticky from "../../hooks/UseSticky";

const ScrollToTop = () => {
   const { sticky }: { sticky: boolean } = UseSticky();

   const [showScroll, setShowScroll] = useState(false);

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   useEffect(() => {
      let ticking = false;

      const handleScroll = () => {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               if (window.pageYOffset > 400) {
                  setShowScroll(true);
               } else {
                  setShowScroll(false);
               }
               ticking = false;
            });
            ticking = true;
         }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   return (
      <>
         <button onClick={scrollTop} className={`scroll__top scroll-to-target ${sticky ? "open" : ""}`} data-target="html">
            <i className="tg-flaticon-arrowhead-up"></i>
         </button>
      </>
   )
}

export default ScrollToTop;
