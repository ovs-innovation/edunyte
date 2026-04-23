import HeaderOne from "../../../layouts/headers/HeaderOne"
import FooterOne from "../../../layouts/footers/FooterOne"
import Hero from "./Hero"
import Stats from "./Stats"
import HowItWorks from "./HowItWorks"
import Categories from "./Categories"
import Tutors from "./Tutors"
import Newsletter from "./Newsletter"
import Blog from "./Blog"

const HomeOne = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <Hero />
            <Stats />
            <HowItWorks />
            <Categories />
            <Tutors />
            <Newsletter />
            <Blog style={false} />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default HomeOne
