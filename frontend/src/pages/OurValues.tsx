import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';
import { Link } from 'react-router-dom';

const OurValues = () => {
  const valueGroups = [
    {
      title: "Ethical Innovation",
      subtitle: "Pioneering the Future",
      desc: "We don't just build technology; we build pathways for human growth. Our focus is on ethical AI and tools that empower rather than replace the human educator.",
      icon: "fas fa-brain",
      color: "#5751E1"
    },
    {
      title: "Radical Inclusion",
      subtitle: "Universal Accessibility",
      desc: "We believe talent is universal but opportunity is not. Our platform is designed to be accessible across languages, cultures, and socio-economic backgrounds.",
      icon: "fas fa-universal-access",
      color: "#00AEE5"
    },
    {
      title: "Student Sovereignty",
      subtitle: "Learner-Centric DNA",
      desc: "Every feature we build is tested against one question: Does this genuinely help the student succeed? We put the learner's journey at the heart of our architecture.",
      icon: "fas fa-crown",
      color: "#9B51E0"
    }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Our Core Values - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne
          title={"Our Core Values"}
          sub_title={"Values"}
          description={"The principles that drive every decision we make — from product design to how we support our learners and educators."}
          image="/assets/img/others/mission_vision_hero.png"
          overlayItems={['Ethical Innovation', 'Radical Inclusion', 'Student Sovereignty']}
          features={['Integrity at every step', 'Community-first mindset', 'Transparent & accountable']}
        />
        
        <section className="section-pt-120 section-pb-90 overflow-hidden">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-9 text-center mb-80">
                <span className="sub-title mb-20 text-primary fw-bold" style={{ letterSpacing: '2px' }}>GUIDING PRINCIPLES</span>
                <h2 className="title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900 }}>What Defines <span className="text-grad">Edunyte</span>?</h2>
                <p className="mt-4 px-lg-5 opacity-70" style={{ fontSize: '1.2rem' }}>Our values aren't just words. They are the operational code that drives every product decision and every interaction.</p>
              </div>
            </div>

            <div className="row g-5">
              {valueGroups.map((val, idx) => (
                <div key={idx} className="col-lg-4">
                  <div className="glass-panel p-5 h-100 hover-scale shadow-sm position-relative overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
                     <div className="position-relative z-1">
                        <div className="icon-wrap mb-30 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '70px', height: '70px', borderRadius: '16px', background: 'white', color: val.color, fontSize: '2rem' }}>
                            <i className={val.icon}></i>
                        </div>
                        <span className="fw-bold small opacity-50 text-uppercase" style={{ letterSpacing: '1px' }}>{val.subtitle}</span>
                        <h3 className="my-3 fw-900" style={{ fontSize: '1.8rem' }}>{val.title}</h3>
                        <p className="opacity-70 mb-0" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>{val.desc}</p>
                     </div>
                     <div style={{ position: 'absolute', bottom: '-20px', right: '-10px', fontSize: '8rem', fontWeight: 900, color: 'rgba(0,0,0,0.03)', zIndex: 0 }}>0{idx+1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pb-120">
            <div className="container">
                <div className="glass-panel p-5 p-xl-6 overflow-hidden position-relative shadow-lg" style={{ borderRadius: '40px', border: '1px solid var(--glass-border)' }}>
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h2 className="mb-30 fw-900" style={{ fontSize: '2.5rem' }}>Living Our Mission Daily</h2>
                            <p className="mb-40 opacity-70" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>At Edunyte, we foster an environment where integrity and curiosity are the primary currencies. We believe that by staying true to our core values, we can build a platform that truly serves the next generation of global leaders.</p>
                            <Link to="/about-us" className="btn-neon-primary py-3 px-5">Learn Our Story</Link>
                        </div>
                        <div className="col-lg-5 text-center mt-5 mt-lg-0">
                            <div className="position-relative d-inline-block">
                             <img src="/assets/img/others/about_img.png" alt="Success" className="img-fluid rounded-4 shadow-lg" style={{ maxWidth: '450px' }} />
                                <div className="glass-panel p-4 position-absolute shadow-sm" style={{ bottom: '-20px', left: '-20px', borderRadius: '20px' }}>
                                    <h4 className="m-0 fw-900">98% Trust</h4>
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

export default OurValues;
