import { Link } from "react-router-dom";
import { useState } from "react";

interface StepType {
  id: number;
  step: string;
  title: string;
  description: string;
}

const steps_data: StepType[] = [
  {
    id: 1,
    step: "1",
    title: "Sign up",
    description: "to create your tutor profile"
  },
  {
    id: 2,
    step: "2",
    title: "Get approved",
    description: "by our team in 5 business days"
  },
  {
    id: 3,
    step: "3",
    title: "Start earning",
    description: "by teaching students all over the world!"
  },
];

const faq_data = [
  {
    id: 1,
    question: "What kind of tutors does Edunyte look for?",
    answer: "No specific certification is needed! We look for passionate tutors who have great communication skills and are experts in their subjects. While teaching experience or certifications are a plus, they are not mandatory for all subjects."
  },
  {
    id: 2,
    question: "What subject can I teach?",
    answer: "You can teach over 100 subjects including languages, K-12 school subjects, university courses, coding, hobbies, and art. If your subject is not listed, you can suggest it during registration."
  },
  {
    id: 3,
    question: "How do I become an online tutor at Edunyte?",
    answer: "The process is simple: Sign up, create your profile, upload a professional photo/video introduction, and submit for review. Our team approves profiles within 3-5 business days."
  },
  {
    id: 4,
    question: "How can I get my profile approved quickly?",
    answer: "Ensure your profile is complete with a high-quality photo, a well-written description, and a clear video introduction. Verify your identity and qualifications to speed up the process."
  },
  {
    id: 5,
    question: "Why should I teach on Edunyte?",
    answer: "Edunyte offers flexibility to set your own rates and schedule, access to a global student base, secure payments, professional development resources, and a supportive community."
  },
  {
    id: 6,
    question: "What computer equipment do I need to teach on Edunyte?",
    answer: "You need a desktop or laptop computer with a stable internet connection, a working webcam, and a headset with a microphone for clear audio."
  },
  {
    id: 7,
    question: "Is it free to create a tutor profile on Edunyte?",
    answer: "Yes, creating a tutor profile and getting listed on Edunyte is completely free. We only charge a small commission on the lessons you teach."
  },
  {
    id: 8,
    question: "How much can I earn on Edunyte?",
    answer: "You set your own hourly rate. Earnings depend on your rate and the number of hours you teach. Top tutors can earn significantly by building a strong student base."
  },
];

const InstructorDetailsArea = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

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
                Learn it right, speak it bright, and step into a global
                future with Edunyte.
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
                <Link to="/instructor/register" className="btn btn-primary">
                  Create a tutor profile now
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
              <h3 className="feature-title">Set your own rate</h3>
              <p className="feature-description">
                Choose your hourly rate and change it anytime. On average, English tutors charge $15-25 per hour.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="instructor__feature-card">
              <h3 className="feature-title">Teach anytime, anywhere</h3>
              <p className="feature-description">
                Decide when and how many hours you want to teach. No minimum time commitment or fixed schedule. Be your own boss!
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="instructor__feature-card">
              <h3 className="feature-title">Grow professionally</h3>
              <p className="feature-description">
                Once you sign up and complete your application, you can be approved and start teaching in as little as three days.
              </p>
            </div>
          </div>
        </div>

        {/* Teach Globally Section */}
        <div className="row mt-80 align-items-center">
          <div className="col-lg-6">
            <div className="instructor__global-content">
              <h2 className="global-title">Inspire Minds. Teach Globally. Grow With Us.
              </h2>
              <p className="global-description">
                At Edunyte, we believe great teachers create great futures.
                If you’re passionate about teaching and want to make a real impact, Edunyte is hiring
                educators across multiple subjects and grades.
              </p>



              <ul className="global-features-list">
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span> Teach students from anywhere</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span> Flexible teaching hours</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>Competitive pay structure</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>Dedicated academic support</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>Growth opportunities & skill development</span>
                </li>
                <li className="global-feature-item">
                  <i className="fas fa-check"></i>
                  <span>Respect, recognition & professional environment
                  </span>
                </li>
              </ul>

              <div className="global-cta">
                <Link to="/instructor/register" className="btn btn-primary">
                  Create a tutor profile now
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
                "Edunyte allowed me to make a living without leaving home!"
              </blockquote>
              <div className="testimonial-author">
                <p className="author-name">Krista A.</p>
                <p className="author-role">English tutor</p>
              </div>
              <div className="testimonial-cta">
                <Link to="/instructor/register" className="btn btn-primary">
                  Create a tutor profile now
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="row mt-100 justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-50">
                <h2 className="section-title">Frequently asked questions</h2>
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
                  <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#0a0a0a', marginBottom: '20px', lineHeight: 1.1 }}>Get paid to teach online</h2>
                  <p style={{ fontSize: '18px', color: '#0a0a0a', marginBottom: '40px', maxWidth: '480px', lineHeight: 1.6, fontWeight: 500 }}>
                    Connect with thousands of learners around the world and teach from your living room
                  </p>
                  <div>
                    <Link to="/instructor/register" className="btn" style={{ backgroundColor: '#0a0a0a', color: '#fff', padding: '18px 45px', borderRadius: '8px', fontSize: '18px', fontWeight: 700, border: 'none', minWidth: '200px' }}>
                      Create a tutor profile now
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
