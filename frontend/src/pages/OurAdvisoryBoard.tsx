import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const OurAdvisoryBoard = () => {
  const advisors = [
    { name: "Dr. Elena Sterling", role: "AI & Neural Learning", bio: "Former Dean of Tech Studies with 20+ years in adaptive learning systems.", img: "1" },
    { name: "Marcus Thorne", role: "Global Strategy", bio: "Venture partner focusing on global educational infrastructure and access.", img: "2" },
    { name: "Sarah Chen", role: "Product Innovation", bio: "Leading expert in UI/UX for large-scale collaborative platforms.", img: "3" }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Our Advisory Board - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne 
          title={"Strategic Vision"} 
          sub_title={"Advisory Board"} 
          image="/assets/img/others/choose_img.jpg"
        />
        
        <section className="section-pt-120 section-pb-90">
          <div className="container">
            <div className="row justify-content-center text-center mb-80">
              <div className="col-xl-8">
                <span className="sub-title mb-20 text-primary fw-bold">THE GUIDING MINDS</span>
                <h2 className="title mb-30 fw-900" style={{ fontSize: '3.5rem' }}>Shape the <span className="text-grad">Horizon</span></h2>
                <p className="opacity-70 px-lg-5" style={{ fontSize: '1.2rem' }}>Our board comprises world-class leaders in technology, pedagogy, and strategy, ensuring Edunyte remains the gold standard for digital education.</p>
              </div>
            </div>

            <div className="row g-4">
              {advisors.map((advisor, idx) => (
                <div key={idx} className="col-lg-4">
                  <div className="glass-panel p-5 h-100 hover-scale shadow-sm text-center" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
                    <div className="avatar-wrap mb-30 mx-auto" style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--neon-purple)', padding: '5px' }}>
                        <img src={`/assets/img/banner/banner_author0${advisor.img}.png`} alt={advisor.name} className="w-100 h-100 rounded-circle" style={{ objectFit: 'cover' }} />
                    </div>
                    <h3 className="fw-900 mb-2">{advisor.name}</h3>
                    <span className="fw-bold text-primary small text-uppercase mb-3 d-block" style={{ letterSpacing: '1px' }}>{advisor.role}</span>
                    <p className="opacity-70 m-0" style={{ lineHeight: 1.7 }}>{advisor.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pb-120">
          <div className="container">
            <div className="glass-panel p-5 shadow-lg position-relative overflow-hidden" style={{ borderRadius: '40px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
               <div className="row align-items-center">
                  <div className="col-lg-7">
                     <h2 className="fw-900 mb-30" style={{ fontSize: '2.2rem' }}>Upholding Educational Integrity</h2>
                     <p className="opacity-70 mb-40" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>Our advisors meet quarterly to review our pedagogical approaches, technological ethical standards, and community impact. Their diverse expertise keeps us agile and aligned with our core mission of universal accessibility.</p>
                     <div className="d-flex gap-4">
                        <div className="d-flex align-items-center gap-3">
                           <i className="fas fa-check-circle text-primary"></i>
                           <span className="fw-bold">Pedagogical Review</span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                           <i className="fas fa-check-circle text-primary"></i>
                           <span className="fw-bold">AI Ethics Oversight</span>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-5 text-center mt-5 mt-lg-0">
                     <img src="/assets/img/banner/h3_hero_img.png" alt="" className="img-fluid rounded-4 shadow-sm" style={{ opacity: 0.9 }} />
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

export default OurAdvisoryBoard;
