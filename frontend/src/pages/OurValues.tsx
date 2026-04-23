import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const OurValues = () => {
  const values = [
    {
      title: "Student-First",
      desc: "Every decision we make starts with the student experience. We are dedicated to providing the best learning outcomes.",
      icon: "/assets/img/icons/features_icon01.svg"
    },
    {
      title: "Quality Education",
      desc: "We partner with top educators to ensure high-quality, up-to-date content that meets industry standards.",
      icon: "/assets/img/icons/features_icon02.svg"
    },
    {
      title: "Lifelong Learning",
      desc: "Education doesn't stop. We foster a culture of continuous growth for students and professionals alike.",
      icon: "/assets/img/icons/features_icon03.svg"
    },
    {
      title: "Inclusion & Accessibility",
      desc: "We believe education should be accessible to everyone, everywhere, regardless of their background.",
      icon: "/assets/img/icons/features_icon04.svg"
    }
  ];

  return (
    <Wrapper>
      <SEO pageTitle={'Our Values - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbOne title={"Our Values"} sub_title={"Our Values"} />
        
        <section className="features__area section-pt-120 section-pb-90">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-6">
                <div className="section__title text-center mb-50">
                  <span className="sub-title">What We Stand For</span>
                  <h2 className="title">Our Core Values</h2>
                  <p>At Edunyte, we are driven by a set of core values that guide our mission to transform global education through technology and innovation.</p>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              {values.map((item, index) => (
                <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="features__item">
                    <div className="features__icon">
                      <img src={item.icon} className="injectable" alt="img" />
                    </div>
                    <div className="features__content">
                      <h4 className="title">{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about__area-five section-pb-120">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="about__img-five">
                  <img src="/assets/img/others/about_img.png" alt="img" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="about__content-five">
                  <div className="section__title mb-20">
                    <h2 className="title">Cultivating a Culture of Excellence</h2>
                  </div>
                  <p>Our values aren't just words on a wall; they are the foundation of everything we do. From the way we design our platform to how we support our instructors and engage with our students, we strive for excellence in every interaction.</p>
                  <p>We empower our community to lead with curiosity and integrity, ensuring that Edunyte remains a trusted name in online learning.</p>
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

export default OurValues;
