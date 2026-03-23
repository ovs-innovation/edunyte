import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BrandOne from "../../common/brands/BrandOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
// import Features from "../../homes/home-one/Features"
import Newsletter from "../../homes/home-one/Newsletter"
import Feature from "../../homes/home-two/Feature"
import About from "./About"
import Testimonial from "./Testimonial"
import Blog from "../../homes/home-one/Blog"

import { useTranslation } from "react-i18next";

const AboutUs = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={t('about_page.breadcrumb.title')} sub_title={t('about_page.breadcrumb.subtitle')} />
            <Blog style={false} />
            <About />
            <BrandOne />
            <Feature style={true} />
            <Newsletter />
            <Testimonial />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default AboutUs
