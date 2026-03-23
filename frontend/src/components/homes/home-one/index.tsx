import Banner from "./Banner"
import About from "./About"
import CourseArea from "./CourseArea"
import Newsletter from "./Newsletter"
import Instructor from "./Instructor"
import Counter from "./Counter"
import FaqArea from "./FaqArea"
import Features from "./Features"
import InstructorTwo from "./InstructorTwo"
import Blog from "./Blog"
import Categories from "./Categories"
import HeaderOne from "../../../layouts/headers/HeaderOne"
// import BrandOne from "../../common/brands/BrandOne"
import FooterOne from "../../../layouts/footers/FooterOne"

const HomeOne = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <About />
           
            
            {/* <Banner /> */}
            {/* <Categories /> */}
            {/* <BrandOne /> */}
            
            <CourseArea style={false} />
            <Instructor />
            <InstructorTwo style={false} />
            <Newsletter />
            
            <Counter />
            {/* <FaqArea /> */}
            {/* <Features /> */}
            
            <Blog style={false} />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default HomeOne
