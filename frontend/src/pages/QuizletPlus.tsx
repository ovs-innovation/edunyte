import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const QuizletPlus = () => {
  const features = [
    { title: "AI Learning Assistant", desc: "Get personalized study paths driven by cutting-edge neural networks.", icon: "fas fa-robot" },
    { title: "Expert Solutions", desc: "Step-by-step guidance from verified industry experts.", icon: "fas fa-check-double" },
    { title: "Offline Access", desc: "Study anywhere, anytime, without needing an internet connection.", icon: "fas fa-cloud-download-alt" },
    { title: "Ad-Free Learning", desc: "100% focused environment with zero distractions.", icon: "fas fa-eye-slash" }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Quizlet Plus - Luxury Learning'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne title={"Premium Mastery"} sub_title={"Quizlet Plus"} />
        
        <section className="section-pt-120 section-pb-120">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="plus-hero-content">
                  <span className="sub-title mb-20 fw-bold" style={{ color: '#D4AF37', letterSpacing: '2px' }}>ELITE ACCESS</span>
                  <h2 className="title mb-30 fw-900" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>Master Your Future with <span style={{ color: '#D4AF37' }}>PLUS</span></h2>
                  <p className="mb-40 opacity-70" style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>Unlock the full power of Edunyte with premium tools designed for students who are serious about their career success. Quizlet Plus is the ultimate companion for lifelong learners.</p>
                  <div className="d-flex gap-4 flex-wrap">
                    <button className="btn-neon-primary py-3 px-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B)', border: 'none' }}>Upgrade to Plus</button>
                    <a href="#features" className="fw-bold d-flex align-items-center gap-2" style={{ textDecoration: 'none' }}>See Features <i className="fas fa-arrow-down"></i></a>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="position-relative">
                    <div className="glass-panel p-3 shadow-2xl overflow-hidden" style={{ borderRadius: '40px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <img src="/assets/img/others/premium_learning_plus.png" alt="Plus Hero" className="w-100 rounded-4" style={{ minHeight: '400px', objectFit: 'cover' }} />
                    </div>
                    <div className="position-absolute top-0 start-0 glass-panel p-4 translate-middle-x mt-5 shadow-lg" style={{ borderRadius: '20px' }}>
                        <h4 className="m-0 fw-900" style={{ color: '#D4AF37' }}>Exclusive</h4>
                        <p className="m-0 small opacity-60">Members Only</p>
                    </div>
                </div>
              </div>
            </div>

            <div id="features" className="row mt-120 g-4">
              {features.map((f, i) => (
                <div key={i} className="col-lg-3 col-md-6">
                  <div className="glass-panel p-5 h-100 hover-scale shadow-sm text-center" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
                    <div className="mb-30 mx-auto d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', color: 'white', fontSize: '1.5rem' }}>
                      <i className={f.icon}></i>
                    </div>
                    <h4 className="fw-800 mb-3" style={{ fontSize: '1.3rem' }}>{f.title}</h4>
                    <p className="mb-0 opacity-70" style={{ fontSize: '1rem' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-120 justify-content-center">
                <div className="col-xl-8">
                    <div className="glass-panel p-5 p-xl-6 text-center shadow-lg position-relative overflow-hidden" style={{ borderRadius: '40px', border: '1px solid var(--glass-border)', background: 'white' }}>
                        <h2 className="mb-30 fw-900" style={{ fontSize: '2.5rem' }}>An Investment in Yourself</h2>
                        <p className="mb-50 px-lg-5 opacity-70" style={{ fontSize: '1.1rem' }}>Choose the plan that fits your learning pace. All Plus plans include a 7-day free trial and a money-back guarantee.</p>
                        
                        <div className="row g-4 justify-content-center">
                            <div className="col-md-6">
                                <div className="p-5 rounded-4 shadow-sm h-100 d-flex flex-column" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <span className="d-block mb-3 fw-bold opacity-40">ANNUAL PLAN</span>
                                    <h3 className="fw-900 mb-2" style={{ fontSize: '3rem' }}>$7.99<small className="fw-normal opacity-50" style={{ fontSize: '1rem' }}>/mo</small></h3>
                                    <p className="mb-40 small opacity-60">Billed annually at $95.88</p>
                                    <button className="btn btn-dark w-100 py-3 mt-auto" style={{ borderRadius: '12px', fontWeight: 700 }}>Select Annual</button>
                                </div>
                            </div>
                             <div className="col-md-6">
                                <div className="p-5 rounded-4 shadow-sm h-100 d-flex flex-column" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                    <span className="d-block mb-3 fw-bold" style={{ color: '#D4AF37' }}>MONTHLY PLAN</span>
                                    <h3 className="fw-900 mb-2" style={{ fontSize: '3rem' }}>$14.99<small className="fw-normal opacity-50" style={{ fontSize: '1rem' }}>/mo</small></h3>
                                    <p className="mb-40 small opacity-60">Flexible billing, cancel anytime</p>
                                    <button className="btn w-100 py-3 mt-auto text-white" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B)', borderRadius: '12px', fontWeight: 700, border: 'none' }}>Select Monthly</button>
                                </div>
                            </div>
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

export default QuizletPlus;
