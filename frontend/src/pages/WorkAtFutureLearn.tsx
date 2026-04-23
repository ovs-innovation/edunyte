import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const WorkAtFutureLearn = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Work At Future Learn - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbOne title={"Work At Future Learn"} sub_title={"Work At Future Learn"} />
        
        <section className="section-pt-120 section-pb-120">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="about__img-five">
                  <img src="/assets/img/others/choose_img.jpg" alt="img" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="about__content-five">
                  <div className="section__title mb-20">
                    <span className="sub-title">Join Our Team</span>
                    <h2 className="title">Shape the Future of Online Learning</h2>
                  </div>
                  <p>At Edunyte, we're on a mission to make education accessible to everyone. We're looking for passionate, innovative individuals who want to make a real impact on how the world learns.</p>
                  <ul className="about__info-list list-wrap mt-20">
                    <li className="about__info-list-item">
                      <i className="flaticon-angle-right"></i>
                      <p className="content">Remote-first culture with global opportunities.</p>
                    </li>
                    <li className="about__info-list-item">
                      <i className="flaticon-angle-right"></i>
                      <p className="content">Continuous learning and professional development.</p>
                    </li>
                    <li className="about__info-list-item">
                      <i className="flaticon-angle-right"></i>
                      <p className="content">Inclusive and diverse work environment.</p>
                    </li>
                  </ul>
                  <a href="#" className="btn mt-30">View Open Positions</a>
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

export default WorkAtFutureLearn;
