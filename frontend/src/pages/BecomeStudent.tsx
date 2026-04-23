import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';
import { Link } from 'react-router-dom';

const BecomeStudent = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Become a Student - Edunyte'} />
            <HeaderOne />
            <main className="main-area fix">
                <BreadcrumbOne title={"Become a Student"} sub_title={"Become a Student"} />
                
                <section className="section-pt-120 section-pb-120">
                   <div className="container">
                      <div className="row align-items-center">
                         <div className="col-lg-6 order-0 order-lg-2">
                             <div className="about__img-five">
                               <img src="/assets/img/others/about_img.png" alt="img" />
                             </div>
                         </div>
                         <div className="col-lg-6">
                            <div className="about__content-five">
                               <div className="section__title mb-20">
                                  <span className="sub-title">Future of Learning</span>
                                  <h2 className="title">Unlock Your Potential with Edunyte</h2>
                               </div>
                               <p>Join thousands of learners around the world who are advancing their careers and mastering new skills with Edunyte. Our platform offers high-quality courses designed to help you succeed.</p>
                               
                               <div className="features__list mt-30">
                                  <div className="features__list-item mb-20">
                                     <div className="icon"><i className="fas fa-check"></i></div>
                                     <div className="content">
                                        <h4 className="title">Access 10,000+ Courses</h4>
                                        <p>Learn anything from coding and marketing to photography and personal development.</p>
                                     </div>
                                  </div>
                                  <div className="features__list-item mb-20">
                                     <div className="icon"><i className="fas fa-check"></i></div>
                                     <div className="content">
                                        <h4 className="title">Learn at Your Own Pace</h4>
                                        <p>Enjoy lifetime access to courses on our website and mobile app.</p>
                                     </div>
                                  </div>
                                  <div className="features__list-item mb-20">
                                     <div className="icon"><i className="fas fa-check"></i></div>
                                     <div className="content">
                                        <h4 className="title">Earn Certificates</h4>
                                        <p>Get recognized for your hard work with certificates of completion for every course.</p>
                                     </div>
                                  </div>
                               </div>

                               <Link to="/student/registration" className="btn mt-20">Get Started Today</Link>
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

export default BecomeStudent;
