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
            <SEO pageTitle={'Become an Instructor - Edunyte'} />
            <HeaderOne />
            <main className="main-area fix glow-bg">
                <BreadcrumbOne 
                    title={"Empower the Future"} 
                    sub_title={"Teach"} 
                    image="/assets/img/others/professional_teacher.png"
                />

                <section className="section-pt-120 section-pb-120">
                    <div className="container">
                        <div className="row align-items-center g-5">
                            <div className="col-lg-6">
                                <div className="teacher-hero-content pe-xl-5">
                                    <span className="sub-title mb-20 text-primary fw-bold">EXPERT NETWORK</span>
                                    <h2 className="title mb-30 fw-900" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>Turn Your Expertise into <span className="text-grad">Legacy</span></h2>
                                    <p className="mb-40 opacity-70" style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
                                        Join a global faculty of experts who are redefining education. At Edunyte, we provide you with the tools, the global audience, and the support to turn your knowledge into a thriving online career.
                                    </p>
                                    <Link to="/registration" className="btn-neon-primary py-3 px-5">Start Teaching Today</Link>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="position-relative">
                                    <div className="glass-panel p-3 shadow-lg" style={{ borderRadius: '40px' }}>
                                        <img src="/assets/img/others/professional_teacher.png" alt="Teach" className="w-100 rounded-4" style={{ minHeight: '400px', objectFit: 'cover' }} />
                                    </div>
                                    <div className="position-absolute top-0 end-0 glass-panel p-4 mt-4 me-4 shadow-sm">
                                        <h4 className="m-0 fw-900 text-primary">$5M+</h4>
                                        <p className="m-0 small opacity-60">Paid to Experts</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-120 g-4">
                            {[
                                { title: "Plan Curriculum", desc: "Collaborate with our AI-driven insights to identify high-demand topics.", icon: "fas fa-lightbulb" },
                                { title: "Global Reach", desc: "Access our global guides for high-quality video and interactive content creation.", icon: "fas fa-globe-americas" },
                                { title: "Monetize Skill", desc: "Build a sustainable income stream while making a real difference.", icon: "fas fa-hand-holding-usd" }
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

export default BecomeTeacher;
