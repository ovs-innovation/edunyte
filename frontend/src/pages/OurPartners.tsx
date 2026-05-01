import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';
import { Link } from 'react-router-dom';

const OurPartners = () => {
  const partners = [
    { name: "Global Tech Academy", sector: "Institutional", desc: "Providing advanced technology certifications to students worldwide.", icon: "fas fa-university" },
    { name: "SaaS Pro Connect", sector: "Industry", desc: "Bridging the gap between software expertise and emerging learners.", icon: "fas fa-laptop-code" },
    { name: "EduVentures Group", sector: "Investment", desc: "Strategic backing for next-gen educational infrastructure.", icon: "fas fa-chart-line" }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Our Global Partners - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne title={"Global Synergy"} sub_title={"Partners"} />
        
        <section className="section-pt-120 section-pb-90">
          <div className="container">
            <div className="row justify-content-center text-center mb-80">
              <div className="col-xl-8">
                <span className="sub-title mb-20 text-primary fw-bold">NETWORK ECOSYSTEM</span>
                <h2 className="title mb-30 fw-900" style={{ fontSize: '3.5rem' }}>Collaborating for <span className="text-grad">Change</span></h2>
                <p className="opacity-70 px-lg-5" style={{ fontSize: '1.2rem' }}>We partner with leading institutions and industry giants to ensure our curriculum remains at the absolute cutting edge of global demand.</p>
              </div>
            </div>

            <div className="row g-4">
              {partners.map((partner, idx) => (
                <div key={idx} className="col-lg-4">
                  <div className="glass-panel p-5 h-100 hover-scale shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
                    <div className="icon-wrap mb-30 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'var(--grad-primary)', color: 'white', fontSize: '1.5rem' }}>
                        <i className={partner.icon}></i>
                    </div>
                    <span className="fw-bold small opacity-40 text-uppercase" style={{ letterSpacing: '1px' }}>{partner.sector}</span>
                    <h3 className="my-3 fw-800">{partner.name}</h3>
                    <p className="opacity-70 m-0" style={{ lineHeight: 1.7 }}>{partner.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pb-120">
          <div className="container">
            <div className="glass-panel p-5 p-xl-6 shadow-lg overflow-hidden position-relative" style={{ borderRadius: '40px', border: '1px solid var(--glass-border)' }}>
              <div className="row align-items-center">
                <div className="col-lg-6 mb-50 mb-lg-0 text-center">
                  <div className="position-relative d-inline-block">
                    <img src="/assets/img/others/global_education_network.png" alt="Network" className="img-fluid rounded-4 shadow-lg" style={{ maxWidth: '450px' }} />
                  </div>
                </div>
                <div className="col-lg-6">
                  <h2 className="mb-30 fw-900" style={{ fontSize: '2.5rem' }}>Join the Network</h2>
                  <p className="mb-40 opacity-70" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Are you an institution or industry leader looking to shape the future of learning? Let's discuss how we can integrate your expertise into our global ecosystem.</p>
                  <Link to="/contact" className="btn-neon-primary py-3 px-5">Partner with Us</Link>
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

export default OurPartners;
