import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import Newsletter from '../components/homes/home-one/Newsletter';

const QuizletPlus = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Quizlet Plus - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix">
        <BreadcrumbOne title={"Quizlet Plus"} sub_title={"Quizlet Plus"} />
        
        <section className="section-pt-120 section-pb-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="section__title text-center mb-60">
                   <h2 className="title">Unlock Your Full Potential with Quizlet Plus</h2>
                   <p>Elevate your learning experience with advanced study tools, ad-free learning, and offline access.</p>
                </div>
              </div>
            </div>

            <div className="row g-4">
               <div className="col-lg-4 col-md-6">
                  <div className="features__item">
                     <div className="features__content">
                        <h4 className="title">Expert Solutions</h4>
                        <p>Get step-by-step guidance through tough problems with verified solutions from experts.</p>
                     </div>
                  </div>
               </div>
               <div className="col-lg-4 col-md-6">
                  <div className="features__item">
                     <div className="features__content">
                        <h4 className="title">No Distractions</h4>
                        <p>Focus 100% on your studies with a completely ad-free experience across all devices.</p>
                     </div>
                  </div>
               </div>
               <div className="col-lg-4 col-md-6">
                  <div className="features__item">
                     <div className="features__content">
                        <h4 className="title">Offline Learning</h4>
                        <p>Download your study sets and learn anywhere, even without an internet connection.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="row mt-50 justify-content-center">
               <div className="col-lg-6 text-center">
                  <div className="pricing__item">
                     <div className="pricing__content">
                        <h3 className="title">Premium Plan</h3>
                        <p>Full access to all advanced features</p>
                        <a href="#" className="btn">Get Started Now</a>
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
