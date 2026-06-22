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
         <main className="main-area fix glow-bg">
            <BreadcrumbOne
               title={t('about_page.breadcrumb.title', 'Where Learning Meets Excellence')}
               sub_title={t('about_page.breadcrumb.subtitle', 'About Us')}
               description={t('about_page.hero.description', 'Edunyte is a global movement dedicated to bridging the gap between world-class expertise and ambitious learners.')}
               image="/assets/img/others/inner_about_img.png"
               overlayItems={['Expert-Verified Tutors', 'Global Learning Community', 'Personalized Paths']}
               features={['Trusted by 50+ students', 'Live 1-on-1 sessions', 'Multi-language support']}
            />
            <About />
            <Newsletter />
            <Testimonial />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default AboutUs
