import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const OurAdvisoryBoard = () => {
  const advisors = [
    {
      name: "Dr. Sarah Johnson",
      title: "Educational Consultant",
      desc: "Over 20 years of experience in higher education strategy and curriculum development.",
      img: "/assets/img/instructor/instructor01.png"
    },
    {
      name: "Michael Chen",
      title: "Tech Innovation Lead",
      desc: "Expert in AI and machine learning integration within educational platforms.",
      img: "/assets/img/instructor/instructor02.png"
    },
    {
      name: "Prof. Robert Smith",
      title: "Academic Dean",
      desc: "Specializes in online learning methodologies and student engagement metrics.",
      img: "/assets/img/instructor/instructor03.png"
    },
    {
      name: "Emily Davis",
      title: "Industry Liaison",
      desc: "Connecting academic excellence with industry requirements for better career outcomes.",
      img: "/assets/img/instructor/instructor04.png"
    }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Our Advisory Board - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbOne title={"Our Advisory Board"} sub_title={"Our Advisory Board"} />
        
        <section className="instructor__area section-pt-120 section-pb-90">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-6">
                <div className="section__title text-center mb-50">
                  <span className="sub-title">Expert Guidance</span>
                  <h2 className="title">Meet Our Advisors</h2>
                  <p>Our advisory board is composed of distinguished leaders from academia and industry who provide strategic direction to ensure Edunyte delivers world-class education.</p>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              {advisors.map((item, index) => (
                <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="instructor__item">
                    <div className="instructor__thumb">
                      <img src={item.img} alt="img" />
                    </div>
                    <div className="instructor__content">
                      <h2 className="title">{item.name}</h2>
                      <span className="designation">{item.title}</span>
                      <p className="mt-2">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
      </main>
      <FooterOne style={false} style_2={false} />
    </Wrapper>
  );
};

export default OurAdvisoryBoard;
