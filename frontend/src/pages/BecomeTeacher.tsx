import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

import { Link } from 'react-router-dom';

const BecomeTeacher = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Become a Teacher - Edunyte'} />
            <HeaderOne />
            <main className="main-area fix">
                <BreadcrumbOne title={"Become a Teacher"} sub_title={"Become a Teacher"} />

                <section className="section-pt-120 section-pb-120">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="about__img-five">
                                    <img src="/assets/img/others/fact_img.png" alt="img" />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about__content-five">
                                    <div className="section__title mb-20">
                                        <span className="sub-title">Join Our Faculty</span>
                                        <h2 className="title">Teach the World Online</h2>
                                    </div>
                                    <p>Share your knowledge with millions of students worldwide. Edunyte provides the tools and platform for you to teach what you love and build an online teaching career.</p>

                                    <div className="features__list mt-30">
                                        <div className="features__list-item mb-20">
                                            <div className="icon"><i className="fas fa-check"></i></div>
                                            <div className="content">
                                                <h4 className="title">Plan Your Curriculum</h4>
                                                <p>Start with your passion and knowledge. Then choose a promising topic with the help of our tools.</p>
                                            </div>
                                        </div>
                                        <div className="features__list-item mb-20">
                                            <div className="icon"><i className="fas fa-check"></i></div>
                                            <div className="content">
                                                <h4 className="title">Record Your Video</h4>
                                                <p>Use our detailed guides and support team to create high-quality video lessons.</p>
                                            </div>
                                        </div>
                                        <div className="features__list-item mb-20">
                                            <div className="icon"><i className="fas fa-check"></i></div>
                                            <div className="content">
                                                <h4 className="title">Launch Your Course</h4>
                                                <p>Gather your first ratings and reviews by promoting your course through your social media and ours.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to="/instructor/registration" className="btn mt-20">Get Started Today</Link>
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

export default BecomeTeacher;
