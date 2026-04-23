import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const BecomePartner = () => {
    return (
        <Wrapper>
            {/* <SEO pageTitle={'Become a Partner - Edunyte'} />
            <HeaderOne /> */}
            <main className="main-area fix">
                {/* <BreadcrumbOne title={"Become a Partner"} sub_title={"Become a Partner"} /> */}
                
                <section className="section-pt-120 section-pb-120">
                   <div className="container">
                      <div className="row justify-content-center">
                         <div className="col-xl-8">
                            <div className="section__title text-center mb-50">
                               <span className="sub-title">B2B Partnerships</span>
                               <h2 className="title">Partner with Edunyte</h2>
                               <p>Elevate your organization's learning and development. We partner with companies, universities, and governments to deliver custom learning solutions at scale.</p>
                            </div>
                         </div>
                      </div>

                      <div className="row g-4 justify-content-center">
                         <div className="col-lg-4 col-md-6">
                            <div className="features__item text-center">
                               <div className="features__content">
                                  <h4 className="title">Corporate Training</h4>
                                  <p>Upskill your workforce with our comprehensive library of industry-leading courses.</p>
                               </div>
                            </div>
                         </div>
                         <div className="col-lg-4 col-md-6">
                            <div className="features__item text-center">
                               <div className="features__content">
                                  <h4 className="title">University Programs</h4>
                                  <p>Integrate our digital content into your curriculum to provide students with practical skills.</p>
                               </div>
                            </div>
                         </div>
                         <div className="col-lg-4 col-md-6">
                            <div className="features__item text-center">
                               <div className="features__content">
                                  <h4 className="title">Content Partnership</h4>
                                  <p>Join our ecosystem as a content creator and reach a global audience of eager learners.</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="row mt-50 mb-30 justify-content-center">
                         <div className="col-lg-8 text-center">
                            <div className="contact__form-wrap">
                               <h3 className="title mb-30">Get in Touch for Partnership</h3>
                               <p>Fill out the form below and our partnership team will contact you shortly.</p>
                               <a href="/contact" className="btn">Contact Us Now</a>
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

export default BecomePartner;
