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
            <main className="main-area fix glow-bg">
                <BreadcrumbOne 
                    title={"Your Success Story"} 
                    sub_title={"Join as Student"} 
                    image="/assets/img/others/student_success_celebration.png"
                />

                <section className="section-pt-120 section-pb-120">
                    <div className="container">
                        <div className="row align-items-center g-5">
                            <div className="col-lg-6 order-0 order-lg-1">
                                <div className="student-hero-content ps-xl-5">
                                    <span className="sub-title mb-20 text-primary fw-bold">FUTURE LEADER</span>
                                    <h2 className="title mb-30 fw-900" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>Unlock Your <span className="text-grad">True Potential</span></h2>
                                    <p className="mb-40 opacity-70" style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
                                        Experience learning that adapts to you. Connect with elite mentors, access world-class resources, and join a community that celebrates your growth. Your journey to mastery starts here.
                                    </p>
                                    <Link to="/registration" className="btn-neon-primary py-3 px-5">Join the Community</Link>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="position-relative">
                                    <div className="glass-panel p-3 shadow-lg" style={{ borderRadius: '40px' }}>
                                        <img src="/assets/img/banner/h2_banner_img.png" alt="Student Success" className="w-100 rounded-4" style={{ minHeight: '400px', objectFit: 'cover' }} />
                                    </div>
                                    <div className="position-absolute bottom-0 end-0 glass-panel p-4 mb-4 me-4 shadow-sm">
                                        <h4 className="m-0 fw-900 text-primary">150+</h4>
                                        <p className="m-0 small opacity-60">Success Stories</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-120 g-4">
                            {[
                                { title: "Find Your Mentor", desc: "Select from thousands of verified experts tailored to your goals.", icon: "fas fa-search-location" },
                                { title: "Flexible Learning", desc: "Schedule 1-on-1 sessions that fit perfectly into your life.", icon: "fas fa-calendar-alt" },
                                { title: "Track Progress", desc: "Monitor your growth with AI-driven analytics and reports.", icon: "fas fa-chart-pie" }
                            ].map((s, i) => (
                                <div key={i} className="col-lg-4">
                                    <div className="glass-panel p-5 h-100 hover-scale shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
                                        <div className="icon-wrap mb-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white' }}>
                                            <i className={s.icon}></i>
                                        </div>
                                        <h4 className="fw-800 mb-3">{s.title}</h4>
                                        <p className="mb-0 opacity-70" style={{ fontSize: '1rem' }}>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Newsletter />
            </main>
            <FooterOne style={false} style_2={false} />
            <style>{`
                .text-grad {
                    background: var(--grad-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </Wrapper>
    );
};

export default BecomeStudent;
