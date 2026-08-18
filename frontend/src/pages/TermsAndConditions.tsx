import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
import { useState, useEffect } from 'react';

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'platform-services', title: '2. Platform Services' },
    { id: 'eligibility', title: '3. Eligibility' },
    { id: 'account-registration', title: '4. Account Registration' },
    { id: 'code-of-conduct', title: '5. Code of Conduct' },
    { id: 'class-rules', title: '6. Class Rules & Student Behavior' },
    { id: 'payments-and-fees', title: '7. Payments & Fees' },
    { id: 'refund-policy', title: '8. Refund Policy' },
    { id: 'rescheduling', title: '9. Rescheduling & Cancellations' },
    { id: 'recording-classes', title: '10. Recording of Classes' },
    { id: 'intellectual-property', title: '11. Intellectual Property' },
    { id: 'teacher-interaction', title: '12. Teacher-Student Interaction' },
    { id: 'safeguarding', title: '13. Safeguarding & Minor Protection' },
    { id: 'privacy-data', title: '14. Privacy & Data Protection' },
    { id: 'platform-rights', title: '15. Platform Rights' },
    { id: 'disclaimers', title: '16. Disclaimers' },
    { id: 'limitation-liability', title: '17. Limitation of Liability' },
    { id: 'termination', title: '18. Termination' },
    { id: 'governing-law', title: '19. Governing Law & Jurisdiction' },
    { id: 'changes-to-terms', title: '20. Changes to Terms' },
    { id: 'contact-details', title: '21. Contact Details' },
  ];

  const lastUpdated = "August 18, 2026";

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredSections = sections.filter(sec =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Wrapper>
      <SEO pageTitle={'Terms & Conditions - Edunyte'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne
          title={"Terms & Conditions"}
          sub_title={"Terms & Conditions"}
          description={"Please review the terms and conditions that govern your use of the Edunyte learning platform and services."}
          hideImage={true}
          features={['Official Terms', 'Comprehensive Policies', 'Transparent Legal Terms']}
        />

        <section className="section-pt-90 section-pb-120 overflow-hidden">
          <div className="container">
            <div className="row g-4">
              
              {/* Modern Ultra-Clean Sticky Sidebar Navigation */}
              <div className="col-lg-4 col-xl-3">
                <div 
                  className="p-3 p-md-4 rounded-4 shadow-sm position-sticky" 
                  style={{ 
                    top: '100px', 
                    background: '#FFFFFF',
                    border: '1px solid rgba(87, 81, 225, 0.12)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                    maxHeight: 'calc(100vh - 120px)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#1E293B', fontSize: '0.95rem' }}>
                      <i className="fas fa-list-ol" style={{ color: '#5751E1' }}></i> Table of Contents
                    </h6>
                    <span className="badge rounded-pill" style={{ background: 'rgba(87, 81, 225, 0.1)', color: '#5751E1', fontSize: '0.75rem', fontWeight: 600 }}>
                      {sections.length} Sections
                    </span>
                  </div>
                  
                  <p className="small text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                    Updated: {lastUpdated}
                  </p>

                  {/* Search Input Filter */}
                  <div className="position-relative mb-3">
                    <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }}></i>
                    <input 
                      type="text"
                      placeholder="Search sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '32px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        outline: 'none',
                        background: '#F8FAFC',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#5751E1';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                      }}
                    />
                  </div>

                  {/* Scrollable Section Items List */}
                  <div 
                    className="custom-nav-scroll flex-grow-1 overflow-y-auto"
                    style={{
                      paddingRight: '2px',
                      maxHeight: 'calc(100vh - 270px)',
                    }}
                  >
                    <div className="d-flex flex-column gap-1 position-relative" style={{ borderLeft: '2px solid #F1F5F9' }}>
                      {filteredSections.map((sec) => {
                        const isActive = activeSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => scrollToSection(sec.id)}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              background: isActive ? 'rgba(87, 81, 225, 0.08)' : 'transparent',
                              color: isActive ? '#5751E1' : '#475569',
                              border: 'none',
                              borderLeft: isActive ? '3px solid #5751E1' : '3px solid transparent',
                              marginLeft: '-2px',
                              padding: '7px 12px',
                              borderRadius: '0 8px 8px 0',
                              fontSize: '0.83rem',
                              fontWeight: isActive ? 600 : 400,
                              lineHeight: '1.4',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out',
                              outline: 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(87, 81, 225, 0.04)';
                                e.currentTarget.style.color = '#5751E1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#475569';
                              }
                            }}
                          >
                            {sec.title}
                          </button>
                        );
                      })}
                      {filteredSections.length === 0 && (
                        <p className="text-muted small p-2 m-0 text-center">No matching sections found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Content Area */}
              <div className="col-lg-8 col-xl-9">
                <div 
                  className="glass-panel p-4 p-md-5 rounded-4 shadow-sm bg-white"
                  style={{ border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.08))' }}
                >
                  <div className="mb-4 pb-3 border-bottom">
                    <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill mb-2">
                      Official Terms of Service
                    </span>
                    <h2 className="fw-900 mb-2" style={{ color: '#1B1B1B' }}>
                      Edunyte Terms and Conditions
                    </h2>
                    <p className="text-muted small">SDEDUCATORS (OPC) PRIVATE LIMITED &bull; Last updated: {lastUpdated}</p>
                  </div>

                  {/* 1. INTRODUCTION */}
                  <div id="intro" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-file-contract"></i> 1. Introduction
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Welcome to <strong>Edunyte</strong>, an educational technology platform owned and operated by <strong>SDEDUCATORS (OPC) PRIVATE LIMITED</strong> ("Edunyte", "Company", "We", "Us", or "Our"). These Terms and Conditions ("Terms") constitute a legally binding agreement between the Company and any individual or entity accessing, browsing, registering on, subscribing to, purchasing from, or otherwise using the Edunyte website, mobile applications, services, products, courses, learning tools, or any related platforms (collectively referred to as the "Platform").
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      These Terms apply to all users of the Platform, including but not limited to students, parents, guardians, visitors, educators, subscribers, and any other persons accessing or utilizing the services provided by Edunyte ("User", "Student", "You", or "Your").
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      By accessing or using the Platform in any manner whatsoever, You acknowledge that You have read, understood, and agreed to comply with and be legally bound by:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      <li className="d-flex gap-2 align-items-center">
                        <i className="fas fa-dot-circle text-primary" style={{ fontSize: '0.6rem' }}></i>
                        <span>These Terms and Conditions;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-center">
                        <i className="fas fa-dot-circle text-primary" style={{ fontSize: '0.6rem' }}></i>
                        <span>Our Privacy Policy;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-center">
                        <i className="fas fa-dot-circle text-primary" style={{ fontSize: '0.6rem' }}></i>
                        <span>Refund and Cancellation Policy;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-center">
                        <i className="fas fa-dot-circle text-primary" style={{ fontSize: '0.6rem' }}></i>
                        <span>Community Guidelines;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-center">
                        <i className="fas fa-dot-circle text-primary" style={{ fontSize: '0.6rem' }}></i>
                        <span>Any additional policies, rules, notices, or agreements published by Edunyte from time to time.</span>
                      </li>
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Your continued access to or use of the Platform shall constitute Your express acceptance of these Terms, including any future amendments or modifications made by the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      If You do not agree with any provision of these Terms or any associated policies, You must immediately discontinue use of the Platform and refrain from accessing any services offered by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right, at its sole discretion, to modify, revise, update, amend, or replace any part of these Terms at any time without prior notice. Users are encouraged to periodically review these Terms to remain informed of any updates. Continued use of the Platform following the publication of revised Terms shall constitute acceptance of such changes.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      The Company further reserves the right to suspend, restrict, terminate, or deny access to any User found to be in violation of these Terms, applicable laws, community standards, or the integrity and security of the Platform.
                    </p>
                  </div>

                  {/* 2. PLATFORM SERVICES */}
                  <div id="platform-services" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-cubes"></i> 2. Platform Services
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte is a digital education and learning platform operated by SDEDUCATORS (OPC) PRIVATE LIMITED, designed to provide academic support, skill development, mentorship, and technology-enabled learning solutions to students and learners across various age groups and educational levels.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      The Platform may offer, include, or facilitate a wide range of educational services and resources, including but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "Live one-to-one tutoring and personalized learning sessions;",
                        "Group classes, academic batches, and collaborative learning programs;",
                        "Recorded video lectures, self-paced courses, and on-demand educational content;",
                        "Examination preparation programs, mentoring sessions, and career guidance;",
                        "Workshops, seminars, masterclasses, and webinars conducted online or offline;",
                        "Academic counseling, educational consultation, and student support services;",
                        "Skill-development and professional enhancement courses;",
                        "Study materials, notes, e-books, worksheets, assignments, and other digital educational resources;",
                        "Practice tests, quizzes, assessments, mock examinations, and evaluation tools;",
                        "AI-assisted educational features, automated learning systems, analytics, and smart learning tools;",
                        "Discussion forums, student communities, peer-learning spaces, and interactive educational environments;",
                        "Any other educational, technological, or support services introduced by Edunyte from time to time."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      The services provided through the Platform may vary depending on factors such as course type, subscription plan, teacher availability, student requirements, geographical accessibility, technical limitations, and operational policies of the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      Edunyte continuously strives to improve and enhance the quality, functionality, security, and effectiveness of its services. Accordingly, the Company reserves the absolute right, at its sole discretion and without prior notice, to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "Modify, update, suspend, discontinue, replace, or remove any feature, service, course, program, content, functionality, or offering available on the Platform;",
                        "Introduce new services, subscription models, technologies, pricing structures, or operational policies;",
                        "Restrict access to certain services based on eligibility, age, location, academic requirements, conduct, or payment status;",
                        "Change the structure, duration, curriculum, schedule, format, or delivery mode of classes or educational programs;",
                        "Temporarily interrupt services for maintenance, upgrades, technical improvements, legal compliance, or security reasons."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-arrow-right text-primary mt-1" style={{ fontSize: '0.75rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      While Edunyte endeavors to provide uninterrupted and high-quality educational services, the Company does not guarantee that all services will always be available, error-free, uninterrupted, or suitable for every individual learner’s expectations or requirements.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      The Platform and its services are intended solely for lawful educational and learning purposes. Any misuse, unauthorized exploitation, or commercial use of the Platform without prior written consent from Edunyte is strictly prohibited.
                    </p>
                  </div>

                  {/* 3. ELIGIBILITY */}
                  <div id="eligibility" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-user-check"></i> 3. Eligibility
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Access to and use of the Edunyte Platform is permitted only to individuals who are legally capable of entering into binding agreements under the applicable laws of their jurisdiction. By accessing or using the Platform, Users represent and warrant that they satisfy all eligibility requirements set forth in these Terms.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      To use the Platform and its services, the following conditions must be fulfilled:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>Users must possess the legal capacity and competence required under applicable laws to enter into a valid and enforceable agreement.</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>Individuals who are below eighteen (18) years of age or otherwise considered minors under applicable law may access or use the Platform only under the supervision, consent, and guidance of a parent, legal guardian, or authorized adult representative.</span>
                      </li>
                    </ul>
                    <div className="p-3 mb-3 bg-light rounded-3 border-start border-primary border-4">
                      <h6 className="fw-bold text-dark mb-2"><i className="fas fa-shield-alt text-primary me-2"></i>Parent / Guardian Responsibility</h6>
                      <p className="small text-muted mb-1">Parents or guardians of minor Users shall be fully responsible and liable for:</p>
                      <ul className="small text-muted mb-0 ps-3">
                        <li className="mb-1">the conduct, behavior, and activities of the minor on the Platform;</li>
                        <li className="mb-1">ensuring compliance with these Terms and all applicable policies;</li>
                        <li className="mb-1">monitoring the minor’s interactions, communications, and educational activities;</li>
                        <li className="mb-0">all payments, purchases, subscriptions, and transactions carried out by the minor through the Platform.</li>
                      </ul>
                    </div>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users are required to provide accurate, current, complete, and truthful information at the time of registration and throughout their use of the Platform. Such information may include, but is not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "full legal name;",
                        "contact details;",
                        "educational information;",
                        "payment information;",
                        "identity-related information where required."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users agree to promptly update their account information whenever there is any change to ensure that records remain accurate and up to date.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the absolute right, at its sole discretion, to verify the authenticity and accuracy of any information provided by Users. The Company may request additional documentation, proof of identity, age verification, parental consent, or other supporting information whenever deemed necessary for security, compliance, operational, or legal purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte further reserves the right to refuse registration, restrict access, suspend, deactivate, or permanently terminate any account if:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "false, inaccurate, misleading, outdated, or incomplete information is provided;",
                        "a User is found to be impersonating another person or entity;",
                        "there is suspicion of fraudulent, unlawful, abusive, or unauthorized activity;",
                        "the User fails to comply with these Terms or any applicable policies of the Platform;",
                        "the continued use of the Platform by the User may pose a legal, operational, reputational, or security risk to Edunyte, its teachers, students, or other users."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Any suspension or termination of access under this Clause may occur without prior notice and without liability to Edunyte.
                    </p>
                  </div>

                  {/* 4. ACCOUNT REGISTRATION */}
                  <div id="account-registration" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-user-plus"></i> 4. Account Registration
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      In order to access certain services, courses, features, or functionalities offered through the Edunyte Platform, Users may be required to create and maintain a registered account. By registering an account on the Platform, the User agrees to comply with all applicable Terms, policies, operational guidelines, and security requirements prescribed by Edunyte from time to time.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      During the registration process, Users may be required to provide certain information including, but not limited to, their name, email address, phone number, educational details, payment information, and any other details reasonably requested by the Platform for operational, verification, compliance, or security purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      The User represents and warrants that all information submitted during registration and thereafter shall be accurate, complete, current, and truthful. Users further agree to promptly update their account information whenever necessary to ensure that such information remains accurate and up to date at all times.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      By creating and using an account on the Platform, the User expressly agrees to the following obligations:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "To maintain the confidentiality, security, and privacy of their login credentials, passwords, verification codes, and account access details;",
                        "Not to share, transfer, sell, sublicense, or permit any third party to access or use their account without prior written authorization from Edunyte;",
                        "To remain fully responsible and liable for all activities, transactions, communications, content, and actions conducted through their account, whether authorized by the User or not;",
                        "To immediately notify Edunyte upon becoming aware of any unauthorized access, security breach, suspicious activity, misuse, or compromise relating to their account or login credentials;",
                        "To ensure that their use of the Platform complies with all applicable laws, these Terms, and any additional policies issued by Edunyte."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge that Edunyte may rely on account credentials and associated activity as evidence of authorized use of the Platform. Accordingly, the Company shall not ordinarily be liable for any loss, damage, unauthorized transactions, or misuse arising from the User’s failure to maintain adequate account security or confidentiality.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the unrestricted right, at its sole discretion and without prior notice where deemed necessary, to suspend, restrict, investigate, deactivate, or permanently terminate any account that is found or reasonably suspected to be involved in:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "fraudulent, deceptive, or unlawful activities;",
                        "impersonation or identity misrepresentation;",
                        "abusive, harmful, threatening, or disruptive conduct;",
                        "violation of these Terms or Platform policies;",
                        "unauthorized access attempts or cybersecurity threats;",
                        "misuse of payment systems or chargeback abuse;",
                        "suspicious account behavior or unusual activity patterns;",
                        "sharing of accounts or unauthorized commercial usage;",
                        "activities that may compromise the safety, integrity, reputation, or operational functioning of the Platform."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte may additionally retain records, restrict access to services, freeze transactions, preserve evidence, or cooperate with law enforcement authorities and regulatory agencies where required by applicable law or where reasonably necessary for security, compliance, or investigative purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      The User acknowledges and agrees that account registration constitutes only a limited and revocable permission to access the Platform and does not create any ownership right or guaranteed entitlement to continued access or availability of services.
                    </p>
                  </div>

                  {/* 5. CODE OF CONDUCT */}
                  <div id="code-of-conduct" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-gavel"></i> 5. Code of Conduct
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte is committed to maintaining a safe, respectful, professional, inclusive, and academically focused learning environment for all students, teachers, parents, mentors, staff members, and users of the Platform. All Users are expected to conduct themselves responsibly, ethically, and respectfully while accessing or participating in any activity, service, communication, or interaction on the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By using the Platform, Users agree to comply with the standards of behavior set forth in this Code of Conduct and acknowledge that any violation may result in disciplinary action, suspension, termination of access, legal action, or other remedial measures deemed appropriate by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users shall strictly refrain from engaging in any conduct that is unlawful, harmful, abusive, disruptive, unethical, or inconsistent with the educational objectives and integrity of the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Without limitation, Users shall NOT:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "Abuse, threaten, intimidate, harass, bully, stalk, insult, defame, humiliate, or engage in inappropriate behavior toward teachers, students, parents, staff members, or any other users of the Platform;",
                        "Use vulgar, obscene, sexually explicit, hateful, discriminatory, racist, offensive, defamatory, or abusive language, gestures, content, or communication in any form;",
                        "Engage in cyberbullying, trolling, targeted harassment, hate speech, or conduct intended to create fear, discomfort, hostility, or emotional distress;",
                        "Record, copy, screenshot, download, stream, reproduce, distribute, publish, sell, or share classes, sessions, meetings, educational content, teacher materials, or communications without prior written authorization from Edunyte;",
                        "Share, upload, transmit, distribute, or use pirated, stolen, unauthorized, infringing, or copyrighted material in violation of applicable intellectual property laws;",
                        "Cheat, plagiarize, manipulate results, use unauthorized assistance, or engage in dishonest conduct during examinations, quizzes, tests, assignments, interviews, or assessments;",
                        "Impersonate another individual, falsely represent their identity, credentials, qualifications, affiliation, or relationship with any person or organization;",
                        "Intentionally disrupt classes, interfere with educational sessions, create disturbances, spam communications, misuse platform tools, or obstruct the learning experience of others;",
                        "Promote, advertise, market, solicit, or endorse competing educational services, external businesses, unauthorized commercial activities, referral schemes, or third-party platforms without written approval from Edunyte;",
                        "Use the Platform for any unlawful, fraudulent, misleading, harmful, exploitative, or unauthorized purpose;",
                        "Attempt to gain unauthorized access to Platform systems, servers, databases, software, teacher accounts, student accounts, confidential information, or restricted technological infrastructure;",
                        "Introduce viruses, malware, spyware, bots, automated scripts, malicious code, or any harmful technological mechanism into the Platform;",
                        "Circumvent security measures, exploit vulnerabilities, reverse engineer software, or interfere with the integrity, stability, or operation of the Platform;",
                        "Engage in any activity that may damage the reputation, goodwill, safety, operations, or legal compliance of Edunyte."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-times-circle text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 mb-3 bg-danger-subtle rounded-3 border-start border-danger border-4">
                      <h6 className="fw-bold text-danger mb-2"><i className="fas fa-ban me-2"></i>Zero Tolerance Policy</h6>
                      <p className="small text-muted mb-2">Edunyte maintains a strict zero-tolerance policy toward:</p>
                      <ul className="small text-muted mb-0 ps-3">
                        <li className="mb-1">harassment and bullying;</li>
                        <li className="mb-1">abuse or intimidation;</li>
                        <li className="mb-1">hate speech and discrimination;</li>
                        <li className="mb-1">threats or violent conduct;</li>
                        <li className="mb-1">sexual misconduct or inappropriate communication;</li>
                        <li className="mb-1">academic dishonesty;</li>
                        <li className="mb-1">cybersecurity violations;</li>
                        <li className="mb-1">fraudulent or illegal activities;</li>
                        <li className="mb-0">misconduct affecting minors or vulnerable individuals.</li>
                      </ul>
                    </div>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      The Company reserves the absolute right, at its sole discretion, to investigate any suspected violation of this Code of Conduct and to take any action deemed necessary, including but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "issuing warnings;",
                        "restricting access to certain services or features;",
                        "removing content or communications;",
                        "suspending or terminating accounts;",
                        "canceling classes or subscriptions;",
                        "withholding refunds;",
                        "reporting incidents to parents, guardians, educational institutions, employers, regulatory bodies, or law enforcement authorities where required by law."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that Edunyte may monitor communications, interactions, sessions, activities, and content on the Platform for purposes including safety, quality assurance, compliance, dispute resolution, fraud prevention, and enforcement of these Terms.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      All Users are expected to contribute positively to the learning environment and uphold the principles of professionalism, integrity, respect, inclusivity, and responsible digital conduct while using the Platform.
                    </p>
                  </div>

                  {/* 6. CLASS RULES AND STUDENT BEHAVIOR */}
                  <div id="class-rules" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-chalkboard-teacher"></i> 6. Class Rules and Student Behavior
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte is committed to creating and maintaining a professional, respectful, disciplined, and productive learning environment that promotes academic growth, positive interaction, and effective communication among students, teachers, mentors, and all participants on the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All students are expected to behave responsibly, courteously, and ethically during classes, sessions, discussions, assessments, and all other educational activities conducted through the Platform. By enrolling in or attending any class or educational program offered by Edunyte, students agree to comply with the rules and behavioral standards outlined in this section.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Students expressly agree to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "Attend scheduled classes, sessions, workshops, assessments, and meetings punctually and in a respectful manner;",
                        "Maintain appropriate, disciplined, and professional behavior throughout the duration of classes and interactions on the Platform;",
                        "Use respectful, polite, and appropriate language in verbal, written, visual, and digital communications with teachers, staff members, and fellow students;",
                        "Follow instructions, classroom guidelines, academic procedures, and directions provided by teachers, moderators, or authorized representatives of Edunyte;",
                        "Maintain proper camera, microphone, chat, and virtual classroom etiquette wherever applicable, including minimizing unnecessary background noise, distractions, interruptions, or inappropriate visual content;",
                        "Participate in classes in a manner that supports a positive and constructive learning environment for all participants;",
                        "Avoid any conduct that may disturb, interrupt, distract, delay, or negatively impact classes, teachers, or fellow learners;",
                        "Respect the rights, dignity, privacy, opinions, and educational experience of teachers and other students;",
                        "Ensure that all devices, usernames, profile names, backgrounds, and display pictures used during classes are appropriate and not offensive, misleading, vulgar, or disruptive;",
                        "Refrain from engaging in misconduct, disruptive behavior, academic dishonesty, harassment, bullying, abusive communication, or any activity inconsistent with the educational purpose of the Platform."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Students shall strictly refrain from:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "intentionally disrupting or sabotaging classes;",
                        "using abusive, offensive, discriminatory, or inappropriate language;",
                        "making false allegations or engaging in threatening conduct;",
                        "disturbing teachers or other students through excessive interruptions, spamming, or misuse of chat features;",
                        "attending classes under fake identities or impersonating another individual;",
                        "sharing unauthorized links, promotional material, or unrelated content during sessions;",
                        "recording, streaming, copying, or distributing classes without prior written permission from Edunyte;",
                        "engaging in cheating, plagiarism, or other dishonest academic practices."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Where classes involve minors, students and participants must maintain especially appropriate and respectful conduct at all times. Any behavior deemed unsafe, inappropriate, exploitative, or harmful toward minors shall be treated with utmost seriousness and may be reported to appropriate authorities where required by law.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the absolute right, at its sole discretion, to monitor classroom behavior and take disciplinary or corrective action whenever necessary to preserve the integrity, safety, discipline, and quality of the learning environment.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Such actions may include, without limitation:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "verbal or written warnings;",
                        "temporary removal from a class or session;",
                        "muting or restricting communication features;",
                        "suspension of access to specific services or programs;",
                        "permanent suspension or termination of the student account;",
                        "cancellation of subscriptions or enrollments;",
                        "denial of future access to the Platform;",
                        "withholding of refunds in cases involving misconduct or policy violations."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Students acknowledge and agree that disciplinary decisions made by Edunyte in relation to classroom conduct, safety, behavioral standards, or policy enforcement shall be final and binding.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Edunyte further reserves the right to maintain records of behavioral incidents, class participation, complaints, investigations, disciplinary actions, and communications for compliance, safety, operational, and legal purposes.
                    </p>
                  </div>

                  {/* 7. PAYMENTS AND FEES */}
                  <div id="payments-and-fees" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-credit-card"></i> 7. Payments and Fees
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users agree to pay all applicable fees, charges, subscription amounts, taxes, and other payments associated with the courses, classes, programs, services, or products purchased or accessed through the Edunyte Platform in accordance with the pricing, billing terms, and payment policies communicated by Edunyte from time to time.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All payments made on the Platform must be completed through the authorized payment methods, payment gateways, banking channels, or financial systems officially approved and made available by Edunyte. Users are solely responsible for ensuring that payment details provided are accurate, valid, and lawfully owned or authorized for use.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      By making any payment on the Platform, the User represents and warrants that:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "they are legally authorized to use the selected payment method;",
                        "all payment information submitted is accurate and complete;",
                        "the transaction does not violate any applicable laws, banking regulations, or third-party rights."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users expressly agree that they shall not:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "make direct payments to teachers, tutors, mentors, or representatives outside the Platform;",
                        "solicit or encourage off-platform financial transactions;",
                        "attempt to bypass Edunyte’s payment systems or service fee structures;",
                        "use fraudulent, unauthorized, stolen, or invalid payment methods;",
                        "initiate false chargebacks, payment disputes, or fraudulent refund claims."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-light rounded-3 border-start border-danger border-4 mb-3">
                      <h6 className="fw-bold text-danger mb-1"><i className="fas fa-exclamation-triangle me-2"></i>Off-Platform Transaction Risk</h6>
                      <p className="small text-muted mb-0">
                        Any direct financial transaction conducted outside the Platform shall be entirely at the User’s own risk, and Edunyte shall bear no responsibility or liability for any resulting disputes, losses, fraud, misconduct, non-performance of services, or damages arising from such unauthorized arrangements.
                      </p>
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to revise, modify, increase, decrease, restructure, or update pricing, subscription plans, service fees, promotional offers, discounts, billing cycles, or payment structures at any time at its sole discretion. Such changes may become effective immediately or from a future date specified by the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All fees displayed on the Platform are subject to applicable taxes, government levies, transaction charges, processing fees, currency conversion charges, or statutory deductions as required under applicable law. Users shall be solely responsible for payment of all such applicable taxes and charges unless expressly stated otherwise by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Payments made through third-party payment gateways or financial service providers may additionally be governed by the terms and conditions of such third parties. Edunyte shall not be responsible for:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "payment gateway failures;",
                        "banking delays;",
                        "declined transactions;",
                        "technical errors;",
                        "unauthorized banking activity;",
                        "interruptions caused by third-party financial institutions."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-times-circle text-muted mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      In the event of failed, incomplete, delayed, reversed, disputed, or unauthorized payments, Edunyte reserves the right to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "suspend or restrict access to classes, subscriptions, or services;",
                        "withhold study materials, certificates, or course access;",
                        "cancel bookings, enrollments, or scheduled sessions;",
                        "recover outstanding dues or losses incurred by the Company;",
                        "initiate verification or investigation procedures;",
                        "permanently terminate accounts involved in fraudulent payment activity."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Failure to complete required payments within the prescribed timelines may result in immediate suspension, cancellation, or discontinuation of services without liability on the part of Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Unless otherwise expressly stated in a separate written policy or agreement, all payments made to Edunyte are non-transferable and subject to the Company’s applicable Refund and Cancellation Policy.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to maintain transaction records, invoices, payment histories, billing information, and related financial documentation for accounting, compliance, legal, audit, fraud prevention, and operational purposes.
                    </p>
                  </div>

                  {/* 8. REFUND POLICY */}
                  <div id="refund-policy" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-undo-alt"></i> 8. Refund Policy
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All refund requests relating to classes, subscriptions, educational programs, workshops, digital content, or any other services offered through the Edunyte Platform shall be governed by Edunyte’s applicable Refund Policy, as updated or amended from time to time at the sole discretion of the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By purchasing or enrolling in any service offered by Edunyte, the User acknowledges and agrees that educational services, digital products, scheduling arrangements, teacher allocations, and platform resources involve operational, administrative, and technological commitments that may limit the availability of refunds under certain circumstances.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Refund requests, where applicable, shall generally be reviewed on a case-by-case basis after considering factors including but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the nature of the purchased service or subscription;",
                        "the duration of usage or access already availed;",
                        "attendance records and participation history;",
                        "scheduling and teacher allocation commitments;",
                        "the reason for the refund request;",
                        "compliance with these Terms and Platform policies;",
                        "evidence of misuse, abuse, misconduct, or fraudulent activity."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Unless otherwise expressly stated in writing by Edunyte:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "No refunds may be provided for classes, sessions, consultations, workshops, or services that have already been completed, delivered, attended, accessed, downloaded, or substantially utilized by the User;",
                        "Fees paid for recorded courses, digital materials, downloadable content, study resources, or subscription-based services may be non-refundable once access has been granted;",
                        "Missed classes, unattended sessions, or scheduling conflicts arising due to the User’s personal reasons, negligence, technical limitations on the User’s side, lack of attendance, or failure to join sessions on time may not qualify for refunds, replacements, or compensation;",
                        "Refund eligibility may be restricted where teachers, mentors, or operational resources have already been allocated or reserved for the User;",
                        "Administrative charges, payment gateway fees, taxes, processing charges, or third-party transaction costs may be deducted from any approved refund amount where applicable."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-times-circle text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to deny, refuse, withhold, partially approve, or cancel refund requests in situations including, but not limited to:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "misuse or abuse of the Platform or refund process;",
                        "violation of these Terms or other Platform policies;",
                        "fraudulent transactions or suspicious payment activity;",
                        "repeated cancellations or excessive refund requests;",
                        "misconduct toward teachers, staff, or other users;",
                        "attempts to exploit promotional offers, discounts, free trials, or refund loopholes;",
                        "unauthorized sharing, copying, or distribution of educational content;",
                        "account suspension or termination resulting from policy violations."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Refund requests must be submitted through the official communication channels or support systems designated by Edunyte and within any timelines prescribed by the Company. Users may be required to provide supporting information, transaction details, proof of payment, or additional documentation for verification purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Refund processing timelines may vary depending on:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the payment method used;",
                        "banking procedures;",
                        "third-party payment gateway processing;",
                        "financial institution policies;",
                        "applicable regulatory or compliance requirements."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-clock text-muted mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall not be responsible for delays caused by banks, payment gateways, financial intermediaries, or external service providers involved in the refund process.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      The Company reserves the absolute and final authority to determine:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "eligibility for refunds;",
                        "applicable deductions or adjustments;",
                        "refund amounts;",
                        "alternative remedies such as credits, rescheduling, replacements, or extensions;",
                        "acceptance or rejection of refund claims."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-primary mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      All decisions made by Edunyte regarding refunds, cancellations, credits, adjustments, or payment disputes shall be final and binding to the fullest extent permitted under applicable law.
                    </p>
                  </div>

                  {/* 9. RESCHEDULING AND CANCELLATIONS */}
                  <div id="rescheduling" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-calendar-alt"></i> 9. Rescheduling and Cancellations
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte understands that unforeseen circumstances may occasionally require students to reschedule or cancel classes, sessions, consultations, workshops, or other educational services. Accordingly, the Platform may permit rescheduling or cancellation requests subject to the terms, conditions, operational requirements, and policies established by Edunyte from time to time.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Any request for rescheduling or cancellation shall be subject to factors including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "availability of the assigned teacher, tutor, mentor, or instructor;",
                        "the nature and validity of the User’s subscription plan or purchased package;",
                        "scheduling limitations and operational feasibility;",
                        "prior notice requirements communicated by Edunyte;",
                        "applicable classroom policies, batch structures, and academic timelines;",
                        "teacher allocation commitments and platform resource availability."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that rescheduling requests are not guaranteed and may be approved, denied, or modified at the sole discretion of Edunyte depending on operational constraints and teacher availability.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      To ensure smooth functioning of the Platform and fair allocation of educational resources, students are expected to provide reasonable advance notice for any cancellation or rescheduling request. Failure to provide timely notice may result in forfeiture of the class, denial of rescheduling eligibility, or other applicable consequences as determined by the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Unless otherwise specifically stated under a separate subscription plan or policy:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "missed classes due to the student’s absence, late joining, technical issues on the User’s side, scheduling conflicts, or failure to attend may be treated as completed sessions;",
                        "repeated last-minute cancellations or frequent rescheduling requests may affect future scheduling flexibility or service eligibility;",
                        "teachers may not be obligated to compensate for classes missed due to student negligence or non-attendance;",
                        "rescheduled sessions shall be subject to mutually available time slots and operational feasibility."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to impose restrictions, limitations, administrative controls, or penalties in cases involving:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "repeated no-shows or absenteeism;",
                        "misuse or abuse of scheduling systems;",
                        "excessive cancellation requests;",
                        "habitual last-minute rescheduling;",
                        "intentional disruption of teacher schedules;",
                        "attempts to manipulate attendance, billing, or subscription systems."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-exclamation-triangle text-warning mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Such measures may include, without limitation:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "restriction of rescheduling privileges;",
                        "deduction or forfeiture of session credits;",
                        "cancellation of classes or subscriptions;",
                        "temporary suspension of scheduling access;",
                        "limitation on future bookings;",
                        "denial of refunds or compensation;",
                        "account suspension or termination in serious or repeated cases."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      In situations where classes are canceled or rescheduled by Edunyte due to teacher unavailability, technical issues, emergencies, operational requirements, or other circumstances beyond reasonable control, the Company may, at its sole discretion, offer alternative sessions, replacement classes, credits, extensions, or other reasonable remedies deemed appropriate.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall not be held liable for any losses, inconvenience, academic impact, missed opportunities, or damages arising from canceled, postponed, delayed, or rescheduled sessions resulting from circumstances beyond the reasonable control of the Company, including but not limited to technical failures, internet disruptions, natural disasters, health emergencies, governmental restrictions, or force majeure events.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      All decisions made by Edunyte concerning rescheduling requests, cancellations, attendance disputes, no-show determinations, and related operational matters shall be final and binding.
                    </p>
                  </div>

                  {/* 10. RECORDING OF CLASSES */}
                  <div id="recording-classes" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-video"></i> 10. Recording of Classes
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      To ensure the quality, safety, effectiveness, continuity, and integrity of educational services provided through the Platform, Edunyte reserves the right to record, monitor, store, review, and process online classes, sessions, workshops, meetings, assessments, communications, and other interactions conducted through or in connection with the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By accessing, attending, participating in, or using any service offered by Edunyte, Users expressly acknowledge, understand, and consent to such recording, monitoring, storage, and processing activities.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Class recordings and related data may be created, maintained, and used for purposes including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "quality assurance and service monitoring;",
                        "maintaining educational standards and teaching effectiveness;",
                        "student safety, safeguarding, and security compliance;",
                        "monitoring professional conduct and classroom behavior;",
                        "educational continuity and revision support;",
                        "internal audits, staff evaluation, and operational review;",
                        "teacher training, mentoring, and performance improvement;",
                        "dispute resolution, complaint handling, and investigation purposes;",
                        "maintaining records for legal, compliance, or regulatory obligations;",
                        "creation and maintenance of educational content libraries;",
                        "development, testing, enhancement, and improvement of technology systems;",
                        "AI-assisted learning tools, automated educational systems, analytics, and technological research;",
                        "fraud prevention, abuse detection, cybersecurity, and platform security management."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge that recordings may include audio, video, screen sharing, chat messages, educational content, presentations, participation data, usernames, profile information, assignments, assessments, and other communications occurring during sessions conducted through the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall make commercially reasonable efforts to handle recordings and related data in accordance with applicable privacy laws, internal security measures, and operational safeguards. However, Users acknowledge that no digital system or technological platform can guarantee absolute security or uninterrupted confidentiality.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      By using the Platform, Users expressly consent to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the recording and monitoring of classes and interactions;",
                        "storage of recordings on servers, cloud systems, or technological infrastructure used by Edunyte or authorized service providers;",
                        "internal access to recordings by authorized personnel for legitimate business, operational, legal, safety, educational, or technical purposes;",
                        "use of anonymized or aggregated data for technological development, analytics, educational research, and AI-related improvements."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Where legally required or operationally appropriate, parents or guardians of minor students acknowledge and provide consent on behalf of such minors for participation in recorded sessions and monitoring activities conducted by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users shall strictly refrain from:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "independently recording classes, meetings, sessions, or communications without prior written authorization from Edunyte;",
                        "taking screenshots, screen recordings, audio recordings, photographs, or copies of educational content or participant interactions without permission;",
                        "distributing, publishing, uploading, streaming, reproducing, forwarding, selling, or sharing recordings or class materials with unauthorized persons;",
                        "using class recordings for commercial purposes, social media publication, harassment, defamation, impersonation, or any unlawful or harmful activity;",
                        "modifying, editing, manipulating, or misrepresenting recorded content in any manner."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All recordings, educational materials, and related content generated through the Platform shall remain the exclusive intellectual property of Edunyte unless otherwise expressly stated in writing.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Any unauthorized recording, reproduction, distribution, disclosure, or misuse of class content or recordings may result in:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "immediate suspension or termination of Platform access;",
                        "cancellation of subscriptions or services;",
                        "denial of refunds;",
                        "legal proceedings for breach of intellectual property, confidentiality, or privacy rights;",
                        "reporting to law enforcement or regulatory authorities where applicable."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the unrestricted right to retain, archive, delete, review, or manage recordings and related data in accordance with operational requirements, legal obligations, internal policies, and applicable laws.
                    </p>
                  </div>

                  {/* 11. INTELLECTUAL PROPERTY */}
                  <div id="intellectual-property" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-copyright"></i> 11. Intellectual Property
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All content, materials, technology, features, and resources made available on or through the Edunyte Platform are the exclusive property of <strong>SDEDUCATORS (OPC) PRIVATE LIMITED</strong>, its licensors, content providers, partners, or authorized affiliates, and are protected under applicable intellectual property, copyright, trademark, patent, trade secret, and other proprietary rights laws.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      This protection applies to all forms of content and materials available on the Platform, including but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "videos and recorded lectures;",
                        "live class content and session recordings;",
                        "study materials, notes, assignments, worksheets, and e-books;",
                        "presentations, graphics, illustrations, and visual designs;",
                        "logos, trademarks, trade names, and brand elements;",
                        "website content, text, layouts, and user interfaces;",
                        "educational methodologies, teaching formats, and course structures;",
                        "software, applications, algorithms, coding systems, and technological infrastructure;",
                        "assessments, quizzes, tests, and evaluation systems;",
                        "databases, compilations, analytics, and educational tools;",
                        "AI-generated or AI-assisted educational content and systems;",
                        "audio content, animations, downloadable materials, and multimedia resources;",
                        "any other proprietary content, information, or material made available through the Platform."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Unless expressly permitted in writing by Edunyte, Users are granted only a limited, non-exclusive, non-transferable, revocable right to access and use the Platform solely for personal, lawful, and non-commercial educational purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users shall not, directly or indirectly:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "copy, reproduce, duplicate, or replicate any Platform content;",
                        "download, store, archive, or extract content except where expressly permitted by the Platform;",
                        "redistribute, publish, transmit, broadcast, display, upload, or publicly share content in any form;",
                        "sell, sublicense, lease, monetize, or commercially exploit any material or service provided by Edunyte;",
                        "modify, edit, adapt, translate, reverse engineer, or create derivative works from Platform content or systems;",
                        "remove, alter, or conceal copyright notices, trademarks, logos, disclaimers, or proprietary markings;",
                        "use Platform materials for coaching institutes, tuition centers, commercial teaching, competing educational businesses, or unauthorized educational services;",
                        "share login credentials or grant unauthorized persons access to proprietary content;",
                        "use automated systems, bots, scraping tools, data-mining tools, or extraction technologies to copy or collect Platform content or data;",
                        "distribute recorded lectures, screenshots, notes, class recordings, or educational resources through social media, messaging platforms, websites, cloud storage systems, or third-party applications without authorization."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Any unauthorized use, reproduction, distribution, disclosure, exploitation, or infringement of Edunyte’s intellectual property rights may constitute a violation of applicable laws and may result in:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "immediate suspension or termination of access to the Platform;",
                        "cancellation of subscriptions or educational services;",
                        "denial of refunds;",
                        "civil claims for damages, losses, and injunctive relief;",
                        "criminal proceedings where applicable under law;",
                        "reporting to law enforcement authorities or regulatory bodies."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that all goodwill, rights, title, and interest relating to the Platform and its intellectual property shall remain solely vested in Edunyte and its authorized licensors.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Nothing contained in these Terms shall be interpreted as transferring, assigning, licensing, or granting ownership of any intellectual property rights to Users except for the limited right to access and use the Platform in accordance with these Terms.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the unrestricted right to monitor, investigate, detect, and take legal or technological action against any suspected infringement, piracy, unauthorized sharing, misuse, or exploitation of its intellectual property or proprietary systems.
                    </p>
                  </div>

                  {/* 12. TEACHER-STUDENT INTERACTION POLICY */}
                  <div id="teacher-interaction" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-comments"></i> 12. Teacher-Student Interaction Policy
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte is committed to maintaining a secure, professional, transparent, and ethically managed educational environment for students, parents, teachers, mentors, and all users of the Platform. To protect the integrity of the Platform, ensure user safety, maintain quality standards, and safeguard business operations, all interactions between students, parents, and teachers must occur strictly through authorized channels and systems provided by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By using the Platform, students, parents, guardians, and users acknowledge and agree that teachers engaged through Edunyte are associated with the Platform under specific professional, operational, and contractual arrangements. Users therefore agree not to engage in any conduct intended to bypass, circumvent, interfere with, or undermine the Platform’s systems, policies, teacher relationships, or operational framework.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Students, parents, guardians, and users shall strictly refrain from:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "requesting, soliciting, arranging, or encouraging private classes, tuition, mentorship, or educational services outside the Edunyte Platform with teachers introduced through the Platform;",
                        "asking teachers for personal phone numbers, personal email addresses, social media accounts, residential addresses, banking information, or any other private contact details unless expressly authorized by Edunyte;",
                        "sharing personal contact information with teachers for the purpose of conducting off-platform educational or commercial interactions;",
                        "making direct payments, transfers, gifts, commissions, or financial arrangements to teachers outside the authorized payment systems of Edunyte;",
                        "attempting to negotiate independent service arrangements with teachers outside the Platform;",
                        "encouraging teachers to leave, compete with, or provide services independently from Edunyte;",
                        "using third-party applications, messaging platforms, or communication channels to bypass the Platform’s monitoring, payment, scheduling, or compliance systems;",
                        "engaging in any activity intended to avoid platform fees, service charges, subscription structures, or operational controls established by Edunyte."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All educational sessions, scheduling arrangements, communications, payments, and related interactions between students and teachers are expected to occur exclusively through officially authorized systems, channels, and processes provided by Edunyte unless expressly permitted in writing by the Company.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users acknowledge that the restrictions contained in this policy are necessary to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "protect student safety and safeguarding standards;",
                        "maintain quality control and accountability;",
                        "ensure dispute resolution and monitoring capabilities;",
                        "preserve teacher professionalism and platform integrity;",
                        "prevent fraud, exploitation, unauthorized solicitation, and operational misuse;",
                        "protect the legitimate business interests, intellectual property, and contractual relationships of Edunyte."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the unrestricted right to monitor interactions, communications, scheduling activity, payment patterns, and account behavior for the purpose of detecting unauthorized off-platform arrangements, circumvention attempts, or policy violations.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Any attempt to circumvent, bypass, undermine, or misuse the Platform’s systems or teacher relationships may result in immediate disciplinary or legal action, including but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "immediate suspension or restriction of account access;",
                        "permanent banning or termination of the User’s account;",
                        "cancellation of classes, subscriptions, or educational services;",
                        "forfeiture of payments, credits, or refunds;",
                        "restriction from future use of the Platform;",
                        "legal proceedings for breach of contract, interference with business relations, intellectual property violations, or financial damages;",
                        "reporting of fraudulent or unlawful conduct to relevant authorities where applicable."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-gavel text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte further reserves the right to investigate suspicious conduct, preserve records and communications, cooperate with law enforcement agencies, and pursue civil or criminal remedies where necessary to protect its Platform, teachers, students, operations, and legal rights.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that any decision made by Edunyte regarding enforcement of this policy shall be final and binding to the fullest extent permitted by applicable law.
                    </p>
                  </div>

                  {/* 13. SAFEGUARDING AND MINOR PROTECTION */}
                  <div id="safeguarding" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-user-shield"></i> 13. Safeguarding and Minor Protection
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte is firmly committed to maintaining a safe, secure, respectful, and child-friendly educational environment for all students, particularly minors using the Platform. The safety, dignity, well-being, privacy, and protection of children and vulnerable users are of the highest priority to Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All users of the Platform, including students, parents, guardians, teachers, mentors, staff members, and visitors, are required to comply with the safeguarding standards, safety protocols, behavioral expectations, and child protection principles established by Edunyte and applicable laws.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users shall strictly refrain from engaging in any conduct that may endanger, exploit, harass, manipulate, harm, or negatively affect minors or vulnerable individuals in any manner whatsoever.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Without limitation, Users shall NOT:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "engage in inappropriate, offensive, sexually suggestive, manipulative, abusive, or exploitative conversations with minors;",
                        "share, upload, transmit, display, request, or distribute explicit, obscene, harmful, violent, illegal, or age-inappropriate content;",
                        "harass, bully, intimidate, threaten, shame, discriminate against, or emotionally abuse minors or other users;",
                        "engage in grooming behavior, manipulation, coercion, exploitation, or attempts to establish inappropriate personal relationships with minors;",
                        "encourage secrecy, concealment of communications, or inappropriate interactions outside the knowledge of parents, guardians, or the Platform;",
                        "seek or initiate private communication with minors outside authorized and monitored channels provided by Edunyte;",
                        "request personal photographs, private information, addresses, passwords, financial information, or sensitive personal data from minors without lawful authorization;",
                        "use the Platform to engage in predatory behavior, exploitation, trafficking, extortion, blackmail, or any unlawful activity involving minors;",
                        "expose minors to harmful, unsafe, discriminatory, hateful, or psychologically damaging material or conduct."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-times-circle text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All interactions involving minors are expected to remain professional, educational, respectful, transparent, and appropriate at all times.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Parents, guardians, teachers, students, and users are strongly encouraged and expected to immediately report any suspicious, unsafe, inappropriate, exploitative, abusive, or concerning behavior observed on or related to the Platform. Reports may include, but are not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "suspected grooming behavior;",
                        "inappropriate messaging or communication;",
                        "harassment or bullying;",
                        "unauthorized contact attempts;",
                        "exploitation or manipulation;",
                        "threats to child safety or well-being;",
                        "exposure to harmful or illegal content."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-exclamation-triangle text-warning mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the unrestricted right to monitor classes, communications, reports, interactions, recordings, and user activities for safeguarding, compliance, security, investigation, and child protection purposes in accordance with applicable laws and privacy obligations.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Upon receiving complaints, reports, or reasonable suspicion of misconduct, Edunyte may, at its sole discretion:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "investigate the matter internally;",
                        "review recordings, communications, and account activity;",
                        "suspend or terminate accounts;",
                        "restrict communication privileges;",
                        "remove users from the Platform;",
                        "preserve evidence and records;",
                        "notify parents or guardians;",
                        "cooperate with law enforcement authorities, regulatory bodies, child protection agencies, educational institutions, or governmental authorities where legally required or deemed necessary for safety purposes."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 mb-3 bg-light rounded-3 border-start border-danger border-4">
                      <h6 className="fw-bold text-danger mb-1"><i className="fas fa-ban me-2"></i>Zero-Tolerance Policy</h6>
                      <p className="small text-muted mb-0">
                        Edunyte maintains a strict zero-tolerance policy toward child exploitation, abuse, harassment, grooming, predatory behavior, or any activity that threatens the safety or well-being of minors. Any violation of this policy may result in immediate suspension or permanent termination of access to the Platform without refund, along with potential civil or criminal legal action under applicable laws.
                      </p>
                    </div>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that Edunyte may take urgent preventive or protective action without prior notice where necessary to protect minors, vulnerable individuals, Platform users, or the integrity and safety of the educational environment.
                    </p>
                  </div>

                  {/* 14. PRIVACY AND DATA PROTECTION */}
                  <div id="privacy-data" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-lock"></i> 14. Privacy and Data Protection
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte recognizes the importance of privacy, confidentiality, and responsible data handling and is committed to protecting the personal information and data of its users in accordance with applicable data protection laws, privacy regulations, industry standards, and internal security practices.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By accessing, registering on, or using the Platform and its services, Users expressly acknowledge, understand, and consent to the collection, storage, processing, use, transfer, sharing, and retention of their information and data as described in these Terms and Edunyte’s Privacy Policy.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      The information collected by Edunyte may include, but is not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "personal information such as name, age, date of birth, address, email address, phone number, photographs, identity-related information, and profile details;",
                        "educational data including academic records, course enrollments, assessments, performance reports, attendance records, assignments, class participation, and learning progress;",
                        "usage data such as browsing activity, platform interactions, access history, session duration, feature usage, engagement patterns, and behavioral analytics;",
                        "technical and device-related data including IP addresses, browser type, device identifiers, operating system details, cookies, network information, and system logs;",
                        "payment and transaction information including billing details, payment confirmations, subscription records, invoices, and transaction histories;",
                        "communication records including emails, chat messages, support requests, class recordings, customer service interactions, feedback submissions, and communications conducted through the Platform;",
                        "information voluntarily submitted by Users through forms, surveys, applications, uploads, or interactions with the Platform."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte may collect and process such information for purposes including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "providing and managing educational services;",
                        "facilitating classes, assessments, and user interactions;",
                        "improving user experience and platform functionality;",
                        "personalizing educational content and recommendations;",
                        "monitoring quality, safety, compliance, and operational performance;",
                        "conducting analytics, research, audits, and technological improvements;",
                        "developing AI-assisted educational tools and automated systems;",
                        "processing payments, subscriptions, refunds, and financial transactions;",
                        "preventing fraud, abuse, cybersecurity threats, and unauthorized activities;",
                        "responding to support requests, disputes, complaints, or legal obligations;",
                        "complying with applicable laws, regulatory requirements, court orders, or governmental requests."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-arrow-right text-primary mt-1" style={{ fontSize: '0.75rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that certain information may be processed, stored, or transferred through third-party service providers, cloud infrastructure providers, payment gateways, communication systems, analytics providers, or technology partners engaged by Edunyte for legitimate operational, technical, or business purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall implement commercially reasonable administrative, technical, organizational, and security measures intended to protect user data from unauthorized access, misuse, loss, disclosure, alteration, or destruction. However, Users acknowledge that no digital platform, internet transmission, or electronic storage system can be guaranteed to be completely secure or free from vulnerabilities.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      By using the Platform, Users further consent to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the use of cookies, tracking technologies, and analytics systems;",
                        "automated processing of data for operational and educational purposes;",
                        "retention of records and communications where necessary for legal, security, audit, compliance, or operational reasons;",
                        "anonymized or aggregated use of data for research, analytics, educational development, and technological enhancement."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users are responsible for ensuring that information submitted by them is accurate, lawful, and not misleading. Users shall also take reasonable precautions to maintain the confidentiality of their account credentials and personal devices used to access the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Where minors use the Platform, parents or legal guardians acknowledge and consent to the collection and processing of the minor’s data in connection with educational services, safeguarding requirements, operational management, and legal compliance.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to disclose user information where required:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "under applicable law or legal process;",
                        "pursuant to court orders, governmental requests, or regulatory obligations;",
                        "to protect the safety, rights, property, or security of users, minors, teachers, or the Platform;",
                        "to investigate fraud, misconduct, security incidents, or policy violations."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-exclamation-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      All collection, processing, storage, sharing, and protection of user information shall be governed by Edunyte’s applicable Privacy Policy, as amended or updated from time to time.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Users who do not agree with the data collection and processing practices described herein or in the Privacy Policy must discontinue use of the Platform immediately.
                    </p>
                  </div>

                  {/* 15. PLATFORM RIGHTS */}
                  <div id="platform-rights" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-sliders-h"></i> 15. Platform Rights
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves broad and unrestricted rights to manage, operate, maintain, secure, modify, regulate, and protect the Platform, its services, users, systems, intellectual property, educational environment, and business interests. These rights may be exercised at the sole discretion of the Company whenever deemed necessary for operational efficiency, safety, compliance, quality assurance, legal obligations, technological improvement, or protection of the Platform and its users.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      By accessing or using the Platform, Users acknowledge and agree that Edunyte may exercise the rights described in this section without prior notice where permitted or reasonably necessary.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right, at its sole discretion, to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "suspend, restrict, deactivate, or permanently terminate user accounts;",
                        "deny or limit access to specific services, features, courses, programs, or areas of the Platform;",
                        "remove, disable, edit, block, review, or refuse any content, communication, material, upload, or activity that violates these Terms or is otherwise considered inappropriate, unlawful, harmful, misleading, offensive, or operationally undesirable;",
                        "cancel, postpone, reschedule, replace, or discontinue classes, sessions, workshops, subscriptions, or educational services;",
                        "modify, update, discontinue, replace, or introduce Platform features, technologies, functionalities, pricing structures, subscription models, educational programs, operational systems, or policies;",
                        "conduct investigations relating to misconduct, complaints, fraud, abuse, policy violations, intellectual property infringement, safeguarding concerns, payment disputes, cybersecurity threats, or unlawful activities;",
                        "monitor, review, record, analyze, and audit Platform activity, communications, transactions, sessions, account behavior, and user interactions for safety, compliance, quality assurance, dispute resolution, fraud prevention, and operational purposes;",
                        "verify user identities, account information, payment details, eligibility status, or submitted documentation;",
                        "implement technical restrictions, security protocols, access controls, automated systems, content moderation tools, or compliance measures deemed necessary for the operation or protection of the Platform;",
                        "cooperate with law enforcement authorities, courts, regulators, educational institutions, payment processors, or governmental agencies where legally required or operationally necessary;",
                        "preserve records, communications, logs, and evidence for legal, compliance, audit, dispute resolution, or investigative purposes."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte may exercise these rights in circumstances including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "protection of student safety and safeguarding standards;",
                        "prevention of fraud, abuse, harassment, cyber threats, or unlawful conduct;",
                        "maintenance of educational quality and professional standards;",
                        "enforcement of these Terms, Platform policies, or applicable laws;",
                        "operational requirements, business continuity, or technological upgrades;",
                        "intellectual property protection;",
                        "dispute resolution or complaint handling;",
                        "compliance with legal, regulatory, judicial, or governmental obligations;",
                        "emergency situations, security incidents, or force majeure events."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-arrow-right text-primary mt-1" style={{ fontSize: '0.75rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that Edunyte may take immediate preventive or corrective action without prior notice where the Company reasonably believes that such action is necessary to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "protect the safety, rights, or well-being of students, teachers, minors, or other users;",
                        "maintain the integrity, security, or reputation of the Platform;",
                        "prevent financial loss, legal exposure, or operational disruption;",
                        "comply with legal obligations or enforce Platform policies."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall not be liable for any loss, interruption, inconvenience, damages, academic impact, or business consequences arising from actions taken in good faith under this section, including account suspension, service restriction, content removal, or modification of Platform features.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Nothing in these Terms shall be interpreted as granting Users any guaranteed right to uninterrupted access, continued availability of services, or permanent maintenance of any specific feature, pricing structure, course, teacher, technological system, or Platform functionality.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      All decisions made by Edunyte regarding enforcement actions, investigations, operational changes, restrictions, suspensions, or Platform management shall be final and binding to the fullest extent permitted by applicable law.
                    </p>
                  </div>

                  {/* 16. DISCLAIMERS */}
                  <div id="disclaimers" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-exclamation-circle"></i> 16. Disclaimers
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte provides educational services, learning resources, mentorship, guidance, and technology-enabled academic support with the objective of assisting students in their educational and skill-development journey. However, Users acknowledge and agree that educational performance and outcomes are influenced by numerous personal, academic, psychological, technological, environmental, and external factors that are beyond the reasonable control of Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Accordingly, Edunyte makes no representations, warranties, guarantees, or assurances, whether express or implied, regarding any specific educational, academic, professional, or personal outcome arising from the use of the Platform or its services.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Without limitation, Edunyte does not guarantee:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "academic success or improvement in performance;",
                        "passing of examinations or competitive tests;",
                        "achievement of specific grades, ranks, scores, or academic results;",
                        "admission into schools, colleges, universities, or educational institutions;",
                        "scholarships, certifications, placements, internships, or employment opportunities;",
                        "career advancement or professional success;",
                        "completion of courses within any fixed timeline;",
                        "compatibility between students and teachers;",
                        "uninterrupted access to classes, content, or Platform services;",
                        "continuous availability, functionality, or error-free operation of the Platform."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-times-circle text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users acknowledge that educational outcomes depend on several factors including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the student’s personal effort, discipline, consistency, attendance, participation, and commitment;",
                        "prior educational background and learning capability;",
                        "study habits, practice, preparation, and independent learning;",
                        "internet connectivity, device quality, and technological infrastructure;",
                        "health conditions, mental well-being, and personal circumstances;",
                        "parental support and home environment;",
                        "examination patterns, institutional criteria, and external evaluation standards;",
                        "changes in academic policies, curricula, regulations, or educational systems."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Any testimonials, reviews, rankings, achievements, case studies, success stories, or performance examples displayed on the Platform or promotional materials are provided solely for informational and illustrative purposes and shall not be interpreted as guarantees or promises of similar outcomes for every User.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte further does not warrant or guarantee that:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "the Platform will always operate without interruptions, delays, downtime, bugs, errors, or technical issues;",
                        "content will always remain available or accessible;",
                        "services will meet every User’s individual expectations or requirements;",
                        "all information, study material, or educational content will be entirely accurate, complete, current, or error-free at all times."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-exclamation-triangle text-warning mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 mb-3 bg-light rounded-3 border-start border-primary border-4">
                      <h6 className="fw-bold text-dark mb-1"><i className="fas fa-info-circle text-primary me-2"></i>"AS IS" & "AS AVAILABLE" Basis</h6>
                      <p className="small text-muted mb-0">
                        The Platform and all services, content, educational resources, software, and functionalities are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, reliability, or availability.
                      </p>
                    </div>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      To the fullest extent permitted under applicable law, Edunyte disclaims all liability arising from:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "academic performance or examination results;",
                        "educational decisions made by Users;",
                        "interruptions or failures in service;",
                        "loss of data or technical malfunctions;",
                        "reliance on educational content or guidance;",
                        "conduct of third-party users;",
                        "external links, third-party platforms, or external educational resources;",
                        "delays, cancellations, or scheduling conflicts;",
                        "circumstances beyond the reasonable control of the Company."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-times-circle text-muted mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users assume full responsibility for their educational decisions, participation, reliance on services, and use of the Platform.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Nothing in these Terms shall exclude or limit any rights or protections that cannot legally be excluded under applicable law.
                    </p>
                  </div>

                  {/* 17. LIMITATION OF LIABILITY */}
                  <div id="limitation-liability" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-balance-scale"></i> 17. Limitation of Liability
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      To the fullest extent permitted under applicable law, Edunyte, including its parent company, subsidiaries, affiliates, directors, officers, employees, teachers, mentors, consultants, representatives, agents, licensors, technology partners, and service providers, shall not be liable for any direct, indirect, incidental, special, consequential, exemplary, punitive, or economic losses, damages, liabilities, or expenses arising out of or related to the access to, use of, inability to use, or reliance upon the Platform or any services provided through it.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users expressly acknowledge and agree that use of the Platform and all associated services is undertaken voluntarily and entirely at the User’s own risk.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Without limitation, Edunyte shall not be liable for:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "indirect, incidental, special, punitive, or consequential losses or damages;",
                        "loss of data, records, educational materials, communications, or digital information;",
                        "academic performance issues, examination outcomes, educational decisions, or learning results;",
                        "failure to achieve expected grades, rankings, admissions, placements, certifications, or professional outcomes;",
                        "internet failures, network disruptions, bandwidth limitations, or connectivity issues;",
                        "interruptions caused by telecommunications providers, hosting services, cloud infrastructure, or third-party technology systems;",
                        "third-party payment gateway failures, banking issues, unauthorized transactions, declined payments, or financial processing delays;",
                        "device malfunctions, hardware failures, software incompatibility, viruses, malware, or technical defects affecting access to the Platform;",
                        "service interruptions, downtime, maintenance periods, system crashes, bugs, delays, or temporary unavailability of Platform features;",
                        "cancellation, postponement, rescheduling, or interruption of classes, educational programs, or sessions;",
                        "unauthorized access to accounts resulting from User negligence or failure to maintain credential security;",
                        "actions, conduct, communications, or content of other users, teachers, students, parents, or third parties;",
                        "reliance on educational content, study materials, AI-generated responses, assessments, recommendations, or guidance provided through the Platform;",
                        "errors, inaccuracies, omissions, outdated information, or technical defects in educational or technological content;",
                        "emotional distress, reputational harm, inconvenience, loss of opportunity, or business interruption arising from use of the Platform;",
                        "force majeure events including natural disasters, pandemics, governmental restrictions, strikes, cyberattacks, war, civil unrest, power failures, or circumstances beyond the reasonable control of Edunyte."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-times-circle text-muted mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge that Edunyte functions as a technology-enabled educational platform and does not guarantee uninterrupted service, flawless technological performance, or specific educational outcomes.
                    </p>
                    <div className="p-3 mb-3 bg-light rounded-3 border-start border-primary border-4">
                      <h6 className="fw-bold text-dark mb-1"><i className="fas fa-coins text-primary me-2"></i>Cumulative Liability Cap</h6>
                      <p className="small text-muted mb-0">
                        To the maximum extent permitted under applicable law, the total cumulative liability of Edunyte arising from or related to any claim, dispute, or cause of action shall not exceed the amount actually paid by the User to Edunyte for the specific service directly giving rise to such claim during the three (3) months preceding the event giving rise to liability.
                      </p>
                    </div>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Nothing in these Terms shall create any fiduciary relationship, partnership, joint venture, employment relationship, or guarantee of service continuity between Edunyte and the User.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Users further agree to indemnify, defend, and hold harmless Edunyte and its affiliates, representatives, employees, teachers, and partners from and against any claims, liabilities, losses, damages, expenses, legal proceedings, penalties, or costs arising out of:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "violation of these Terms;",
                        "misuse of the Platform;",
                        "unlawful conduct;",
                        "infringement of third-party rights;",
                        "unauthorized sharing or misuse of content;",
                        "breach of applicable laws or regulations by the User."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Some jurisdictions may not permit certain exclusions or limitations of liability. In such cases, the liability of Edunyte shall be limited to the maximum extent permitted under applicable law.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      By continuing to use the Platform, Users acknowledge and accept the limitations, exclusions, and risk allocations described in this section.
                    </p>
                  </div>

                  {/* 18. TERMINATION */}
                  <div id="termination" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-user-slash"></i> 18. Termination
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the absolute and unrestricted right, at its sole discretion, to suspend, restrict, deactivate, or permanently terminate any User account, access privileges, subscriptions, enrollments, classes, or services at any time where the Company reasonably determines that such action is necessary to protect the safety, integrity, legality, operational stability, reputation, or business interests of the Platform and its users.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Termination or suspension actions may be taken immediately, with or without prior notice, warning, or explanation, depending on the nature and severity of the conduct involved.
                    </p>
                    <p className="text-muted leading-relaxed mb-2 fw-semibold text-dark" style={{ lineHeight: '1.8' }}>
                      Edunyte may suspend or terminate accounts for reasons including, but not limited to:
                    </p>
                    <div className="row g-2 mb-3">
                      {[
                        "misconduct, disruptive behavior, or violation of classroom rules;",
                        "fraud, deception, impersonation, or misrepresentation;",
                        "abusive, threatening, defamatory, or harmful conduct toward teachers, students, staff members, or other users;",
                        "violation of these Terms, Platform policies, community guidelines, or applicable laws;",
                        "harassment, bullying, hate speech, discrimination, intimidation, or inappropriate communication;",
                        "unauthorized access attempts, cybersecurity threats, hacking activities, or misuse of Platform systems;",
                        "payment fraud, chargeback abuse, use of unauthorized payment methods, or suspicious financial activity;",
                        "unauthorized recording, copying, distribution, or commercial exploitation of classes, educational materials, or Platform content;",
                        "attempts to circumvent the Platform’s payment systems, teacher relationships, scheduling systems, operational controls, or business structure;",
                        "engagement in unlawful, illegal, exploitative, or fraudulent activities;",
                        "intellectual property infringement or piracy;",
                        "safeguarding concerns involving minors or vulnerable individuals;",
                        "repeated complaints, disciplinary issues, or operational disruptions;",
                        "any activity that may damage the reputation, operations, security, legal compliance, or educational environment of Edunyte."
                      ].map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="p-2 border rounded-2 bg-light-subtle d-flex gap-2 align-items-start">
                            <i className="fas fa-times-circle text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                            <span className="small text-muted">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      Edunyte further reserves the right to terminate or restrict access where:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "required by law, court order, governmental authority, or regulatory obligation;",
                        "technical, operational, or security concerns make continued access inappropriate;",
                        "a User poses a risk to the Platform, its systems, or other users;",
                        "continuation of services becomes commercially impractical or operationally unfeasible."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-arrow-right text-primary mt-1" style={{ fontSize: '0.75rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      Upon suspension or termination of an account, Edunyte may, at its sole discretion:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "revoke access to classes, subscriptions, educational content, recordings, study materials, and Platform features;",
                        "cancel pending sessions, bookings, or enrollments;",
                        "remove or restrict user-generated content;",
                        "preserve records, communications, logs, and account data for legal, compliance, audit, or investigative purposes;",
                        "block future registration attempts or access to the Platform."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-ban text-danger mt-1" style={{ fontSize: '0.85rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users acknowledge and agree that termination or suspension may occur without refund, compensation, reimbursement, replacement classes, or financial liability on the part of Edunyte, particularly in cases involving misconduct, fraud, abuse, policy violations, safeguarding concerns, unauthorized recordings, circumvention attempts, or unlawful activity.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte shall not be liable for any losses, damages, inconvenience, academic impact, loss of access, loss of data, or other consequences resulting from suspension or termination actions taken in good faith under these Terms.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users may voluntarily discontinue use of the Platform or request account closure at any time; however, such discontinuation shall not relieve the User from any outstanding payment obligations, liabilities, restrictions, or legal responsibilities incurred prior to termination.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      Certain provisions of these Terms, including but not limited to intellectual property rights, limitation of liability, indemnification obligations, dispute resolution, confidentiality obligations, payment liabilities, and legal protections, shall survive termination or expiration of the User’s relationship with Edunyte to the fullest extent permitted under applicable law.
                    </p>
                  </div>

                  {/* 19. GOVERNING LAW AND JURISDICTION */}
                  <div id="governing-law" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-gavel"></i> 19. Governing Law and Jurisdiction
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      These Terms and Conditions, along with all policies, agreements, services, transactions, and interactions related to the Edunyte Platform, shall be governed by, interpreted, and construed in accordance with the laws of India, without regard to any conflict of law principles.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      By accessing or using the Platform, Users expressly agree that any dispute, claim, controversy, legal proceeding, or cause of action arising out of or relating to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "these Terms and Conditions;",
                        "use of the Platform or services;",
                        "enrollment, payments, subscriptions, or transactions;",
                        "educational services or interactions;",
                        "privacy, intellectual property, or data protection matters;",
                        "termination, suspension, or enforcement actions;",
                        "any rights, obligations, or relationships between the User and Edunyte,"
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      shall be governed exclusively by the applicable laws of India.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      In the event of any dispute, disagreement, claim, or controversy arising between the User and Edunyte, the parties shall first endeavor to resolve the matter amicably through good-faith discussions and negotiations within a reasonable period.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      If the dispute is not resolved amicably, the matter shall be referred to and finally resolved through arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, including any statutory amendments, modifications, or re-enactments thereof in force at the relevant time.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      The arbitration proceedings shall be conducted under the following terms:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>The seat and legal place of arbitration shall be New Delhi, India;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>The arbitration proceedings shall be conducted in the English language;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>The arbitral tribunal may consist of a sole arbitrator appointed by Edunyte, unless otherwise required by applicable law;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>The arbitral award shall be final and binding upon the parties and enforceable in accordance with applicable law.</span>
                      </li>
                    </ul>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      Nothing in this clause shall prevent Edunyte from seeking interim, injunctive, equitable, or protective relief before any competent court where necessary to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "protect intellectual property rights;",
                        "prevent unauthorized use or disclosure of confidential information;",
                        "address cybersecurity threats or unlawful conduct;",
                        "safeguard minors or Platform users;",
                        "enforce payment obligations or operational rights."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-shield-alt text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Subject to the arbitration provisions stated above, Users expressly agree that the courts located in New Delhi, India shall have exclusive jurisdiction over all matters arising out of or relating to these Terms, the Platform, or any legal relationship between the User and Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users waive any objection relating to jurisdiction, venue, inconvenience of forum, or applicability of foreign laws to the maximum extent permitted under applicable law.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      If any provision of this section is held to be invalid, unenforceable, or contrary to applicable law, the remaining provisions shall continue to remain valid and enforceable to the fullest extent permitted by law.
                    </p>
                  </div>

                  {/* 20. CHANGES TO TERMS */}
                  <div id="changes-to-terms" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-history"></i> 20. Changes to Terms
                    </h4>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the absolute right, at its sole discretion, to modify, revise, amend, update, replace, expand, or remove any provision of these Terms and Conditions, as well as any related policies, guidelines, notices, or operational rules governing the use of the Platform and its services.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      Such modifications may be made from time to time for reasons including, but not limited to:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      {[
                        "compliance with applicable laws, regulations, or governmental requirements;",
                        "operational, technical, or business developments;",
                        "introduction of new services, features, technologies, or subscription models;",
                        "enhancement of security, safeguarding, or privacy practices;",
                        "prevention of fraud, misuse, abuse, or cybersecurity threats;",
                        "improvement of user experience and Platform functionality;",
                        "clarification of existing terms or correction of errors."
                      ].map((item, idx) => (
                        <li key={idx} className="d-flex gap-2 align-items-start">
                          <i className="fas fa-dot-circle text-primary mt-1" style={{ fontSize: '0.6rem' }}></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte may provide notice of material changes through the Platform, email communications, website notifications, account dashboards, or any other reasonable communication method deemed appropriate by the Company. However, Users acknowledge and agree that Edunyte shall not be obligated to provide individualized notice for every modification unless required by applicable law.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Users are solely responsible for periodically reviewing these Terms and related policies to remain informed of any updates or changes.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      The most current and updated version of the Terms shall supersede all previous versions and shall become effective immediately upon publication or from the effective date specified by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-2" style={{ lineHeight: '1.8' }}>
                      By continuing to access, browse, register on, purchase services from, or otherwise use the Platform after revised Terms have been published, the User expressly acknowledges and agrees that such continued use constitutes:
                    </p>
                    <ul className="text-muted list-unstyled d-flex flex-column gap-2 ms-3 mb-3" style={{ lineHeight: '1.8' }}>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>acceptance of the revised Terms;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>agreement to comply with all updated policies and conditions;</span>
                      </li>
                      <li className="d-flex gap-2 align-items-start">
                        <i className="fas fa-check-circle text-primary mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span>waiver of any objection to the modifications to the extent permitted under applicable law.</span>
                      </li>
                    </ul>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      If a User does not agree with any updated or modified Terms, the User must immediately discontinue use of the Platform and cease accessing any services provided by Edunyte.
                    </p>
                    <p className="text-muted leading-relaxed mb-3" style={{ lineHeight: '1.8' }}>
                      Edunyte reserves the right to require Users to expressly re-accept updated Terms before accessing certain services, features, or functionalities where deemed necessary for legal, operational, or compliance purposes.
                    </p>
                    <p className="text-muted leading-relaxed mb-0" style={{ lineHeight: '1.8' }}>
                      No waiver, delay, or failure by Edunyte to enforce any provision of these Terms shall be interpreted as a waiver of any rights or remedies available to the Company under applicable law.
                    </p>
                  </div>

                  {/* 21. CONTACT DETAILS */}
                  <div id="contact-details" className="mb-5 scroll-margin-top">
                    <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                      <i className="fas fa-building"></i> 21. Contact Details
                    </h4>
                    
                    <div className="p-4 rounded-3 bg-light border">
                      <h5 className="fw-bold text-dark mb-2">SDEDUCATORS (OPC) PRIVATE LIMITED</h5>
                      <p className="mb-2 text-muted"><strong>Registered Office:</strong> EG-03, Sanjay Gandhi Transport Nagar, Phase-II, Delhi – 110042, India</p>
                      <p className="mb-2 text-muted"><strong>Phone:</strong> <a href="tel:+919999339779" className="text-primary text-decoration-none">+91 9999339779</a></p>
                      <p className="mb-2 text-muted"><strong>Email:</strong> <a href="mailto:mishasethi94@gmail.com" className="text-primary text-decoration-none">mishasethi94@gmail.com</a></p>
                      <p className="mb-0 text-muted"><strong>Website:</strong> <a href="https://edunyte.com" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">https://edunyte.com</a></p>
                    </div>
                  </div>

                  {/* ACCEPTANCE FOOTER */}
                  <div className="p-4 rounded-4 bg-primary text-white text-center shadow-sm">
                    <h5 className="fw-bold text-white mb-2"><i className="fas fa-check-circle me-2"></i>ACCEPTANCE</h5>
                    <p className="mb-0 small text-white-50" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                      By accessing or using Edunyte, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <FooterOne style={false} style_2={false} />

      <style>{`
        .scroll-margin-top {
          scroll-margin-top: 110px;
        }
        .custom-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-nav-scroll::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 4px;
        }
        .custom-nav-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: #5751E1;
        }
      `}</style>
    </Wrapper>
  );
};

export default TermsAndConditions;
