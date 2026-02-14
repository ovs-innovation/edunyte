import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";



// Removed static steps_data definition as it is now inside the component using translations


const InstructorDetailsArea = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const steps_data = [
    {
      id: 1,
      step: "1",
      title: t('become_instructor_page.steps.1.title'),
      description: t('become_instructor_page.steps.1.desc')
    },
    {
      id: 2,
      step: "2",
      title: t('become_instructor_page.steps.2.title'),
      description: t('become_instructor_page.steps.2.desc')
    },
    {
      id: 3,
      step: "3",
      title: t('become_instructor_page.steps.3.title'),
      description: t('become_instructor_page.steps.3.desc')
    },
  ];

  const faq_data = [
    {
      id: 1,
      question: t('become_instructor_page.faq.items.1.question'),
      answer: t('become_instructor_page.faq.items.1.answer')
    },
    {
      id: 2,
      question: t('become_instructor_page.faq.items.2.question'),
      answer: t('become_instructor_page.faq.items.2.answer')
    },
    {
      id: 3,
      question: t('become_instructor_page.faq.items.3.question'),
      answer: t('become_instructor_page.faq.items.3.answer')
    },
    {
      id: 4,
      question: t('become_instructor_page.faq.items.4.question'),
      answer: t('become_instructor_page.faq.items.4.answer')
    },
    {
      id: 5,
      question: t('become_instructor_page.faq.items.5.question'),
      answer: t('become_instructor_page.faq.items.5.answer')
    },
    {
      id: 6,
      question: t('become_instructor_page.faq.items.6.question'),
      answer: t('become_instructor_page.faq.items.6.answer')
    },
    {
      id: 7,
      question: t('become_instructor_page.faq.items.7.question'),
      answer: t('become_instructor_page.faq.items.7.answer')
    },
    {
      id: 8,
      question: t('become_instructor_page.faq.items.8.question'),
      answer: t('become_instructor_page.faq.items.8.answer')
    }
  ];

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section className="instructor__recruitment-area section-pt-120 section-pb-90">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Content Section */}
          <div className="col-xl-9 col-lg-8">
            <div className="instructor__recruitment-content">
              <h1 className="instructor__recruitment-title">
                {t('become_instructor_page.hero.title')}
              </h1>

              {/* Steps Section */}
              <div className="instructor__steps-wrap">
                {steps_data.map((step) => (
                  <div
                    key={step.id}
                    className="instructor__step-item"
                    onClick={() => setActiveStep(step.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`step-number ${activeStep === step.id ? 'active' : ''}`}>
                      {step.step}
                    </div>
                    <div className="step-content">
                      <h4 className="step-title">{step.title}</h4>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="instructor__cta-btn">
                <Link to="/registration/tutor" className="btn btn-primary">
                  {t('become_instructor_page.hero.cta')}
                </Link>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="col-xl-3 col-lg-4">
            <div className="instructor__recruitment-image">
              <img
                src="/assets/img/instructor/instructor_details_thumb.png"
                alt="Happy instructor teaching online"
                className="img-fluid"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="row mt-60">
          <div className="col-lg-4 col-md-6">
            <div className="instructor__feature-card">
              <h3 className="feature-title">{t('become_instructor_page.features.1.title')}</h3>
              <p className="feature-description">
                {t('become_instructor_page.features.1.desc')}
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="instructor__feature-card">
              <h3 className="feature-title">{t('become_instructor_page.features.2.title')}</h3>
              <p className="feature-description">
                {t('become_instructor_page.features.2.desc')}
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="instructor__feature-card">
              <h3 className="feature-title">{t('become_instructor_page.features.3.title')}</h3>
              <p className="feature-description">
                {t('become_instructor_page.features.3.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Teach Globally Section */}
        <div className="row mt-80 align-items-center">
          <div className="col-lg-6">
            <div className="instructor__global-content">
              <h2 className="global-title">{t('become_instructor_page.global.title')}
              </h2>
              <p className="global-description">
                {t('become_instructor_page.global.desc_p1')}
                {t('become_instructor_page.global.desc_p2')}
              </p>



              <ul className="global-features-list">
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span> {t('become_instructor_page.global.list.1')}</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span> {t('become_instructor_page.global.list.2')}</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>{t('become_instructor_page.global.list.3')}</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>{t('become_instructor_page.global.list.4')}</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>{t('become_instructor_page.global.list.5')}</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>{t('become_instructor_page.global.list.6')}
                  </span>
                </li>
              </ul>

              <div className="global-cta">
                <Link to="/registration/tutor" className="btn btn-primary">
                  {t('become_instructor_page.global.cta')}
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="instructor__global-images">
              <img
                src="/assets/img/instructor/instructor1.png"
                alt="Tutors teaching students"
                className="img-fluid"
              />
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="row mt-80 align-items-center">
          <div className="col-lg-5">
            <div className="instructor__testimonial-image">
              <img
                src="/assets/img/instructor/instructor2.png"
                alt="Krista A. - English tutor"
                className="img-fluid"
              />
            </div>
          </div>

          <div className="col-lg-7">
            <div className="instructor__testimonial-content">
              <blockquote className="testimonial-quote">
                "{t('become_instructor_page.testimonial.quote')}"
              </blockquote>
              <div className="testimonial-author">
                <p className="author-name">{t('become_instructor_page.testimonial.name')}</p>
                <p className="author-role">{t('become_instructor_page.testimonial.role')}</p>
              </div>
              <div className="testimonial-cta">
                <Link to="/registration/tutor" className="btn btn-primary">
                  {t('become_instructor_page.testimonial.cta')}
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="row mt-100 justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-50">
                <h2 className="section-title">{t('become_instructor_page.faq.title')}</h2>
              </div>

              <div className="faq-wrapper">
                {faq_data.map((faq) => (
                  <div key={faq.id} className="faq-item" style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <div
                      className="faq-header"
                      onClick={() => toggleFaq(faq.id)}
                      style={{
                        padding: '20px 0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <h4 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#0a0a0a' }}>
                        {faq.question}
                      </h4>
                      <span style={{ color: '#0a0a0a', fontSize: '14px' }}>
                        <i className={`fas fa-chevron-${openFaqId === faq.id ? 'up' : 'down'}`}></i>
                      </span>
                    </div>
                    {openFaqId === faq.id && (
                      <div className="faq-body" style={{ paddingBottom: '20px', color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA Banner */}
          {/* Final CTA Banner */}
          <div className="row mt-80 mb-80">
            <div className="col-12">
              <div className="instructor__final-cta-split d-flex flex-wrap align-items-stretch" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '2px solid #000' }}>
                <div className="cta-image" style={{ flex: '1 1 50%', minHeight: '400px', backgroundImage: 'url(/assets/img/instructor/instructor1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
                <div className="cta-content" style={{ flex: '1 1 50%', padding: '80px 60px', backgroundColor: '#36d6b2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#0a0a0a', marginBottom: '20px', lineHeight: 1.1 }}>{t('become_instructor_page.final_cta.title')}</h2>
                  <p style={{ fontSize: '18px', color: '#0a0a0a', marginBottom: '40px', maxWidth: '480px', lineHeight: 1.6, fontWeight: 500 }}>
                    {t('become_instructor_page.final_cta.desc')}
                  </p>
                  <div>
                    <Link to="/registration/tutor" className="btn" style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '18px 45px', borderRadius: '8px', fontSize: '18px', fontWeight: 700, border: 'none', minWidth: '200px' }}>
                      {t('become_instructor_page.final_cta.button')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </section >
  );
};

export default InstructorDetailsArea;
