import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import BrandOne from '../components/common/brands/BrandOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const OurPartners = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Our Partners - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbOne title={"Our Partners"} sub_title={"Our Partners"} />
        
        <section className="section-pt-120 section-pb-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8">
                <div className="section__title text-center mb-50">
                  <span className="sub-title">Global Network</span>
                  <h2 className="title">Our Strategic Partners</h2>
                  <p>We collaborate with leading universities, tech giants, and educational organizations worldwide to bring you the best learning experiences and industry-recognized certifications.</p>
                </div>
              </div>
            </div>
            
            <div className="row">
               <div className="col-12">
                  <BrandOne style={true} />
               </div>
            </div>

            <div className="row mt-80">
              <div className="col-lg-6">
                <div className="features__item">
                  <div className="features__content">
                    <h4 className="title">Academic Partners</h4>
                    <p>Top universities providing academic rigors and credited courses through our platform.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="features__item">
                  <div className="features__content">
                    <h4 className="title">Industry Partners</h4>
                    <p>Leading companies ensuring our curriculum aligns with real-world job requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>
      <FooterOne style={false} style_2={false} />
    </Wrapper>
  );
};

export default OurPartners;
