import { useTranslation } from "react-i18next";

const HowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        {
            id: '01',
            title: t('home.one.how_it_works.step1_title', 'Find the best tutor'),
            desc: t('home.one.how_it_works.step1_desc', 'Choose from over 32,000 online tutors. Use filters to narrow your search and find the perfect fit.'),
            image: "/assets/img/others/educational_collaboration.png",
            icon: "fas fa-search",
            color: "var(--neon-blue)"
        },
        {
            id: '02',
            title: t('home.one.how_it_works.step2_title', 'Take lessons anytime'),
            desc: t('home.one.how_it_works.step2_desc', 'Find the perfect time for your busy schedule. Book lessons in seconds via desktop or mobile.'),
            image: "/assets/img/others/global_education_network.png",
            icon: "far fa-calendar-check",
            color: "var(--neon-purple)"
        },
        {
            id: '03',
            title: t('home.one.how_it_works.step3_title', 'Enter virtual classroom'),
            desc: t('home.one.how_it_works.step3_desc', 'When it\'s lesson time, connect with your tutor through our comprehensive video platform.'),
            image: "/assets/img/others/student_success_celebration.png",
            icon: "fas fa-video",
            color: "var(--neon-cyan)"
        }
    ];

    return (
        <section className="glow-bg" style={{ padding: '100px 0' }}>
            <div className="container position-relative z-1">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span className="sub-title text-primary fw-bold mb-2 d-block text-uppercase" style={{ letterSpacing: '2px' }}>{t('home.one.how_it_works.subtitle', 'Simple Process')}</span>
                    <h2 className="title fw-900" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}>
                        {t('home.one.how_it_works.title_start', 'How it')} <span className="text-gradient">{t('home.one.how_it_works.title_end', 'works')}</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '20px auto 0', opacity: 0.8 }}>
                        {t('home.one.how_it_works.description', 'Learn a language online with 1-on-1 lessons tailored specifically to your needs.')}
                    </p>
                </div>

                <div className="row g-5 justify-content-center">
                    {steps.map((step, index) => (
                        <div key={step.id} className="col-lg-4 col-md-6">
                            <div className="how-it-works-card position-relative h-100">
                                {/* Step Connector (Desktop Only) */}
                                {index < steps.length - 1 && (
                                    <div className="d-none d-lg-block position-absolute" style={{ top: '25%', right: '-15%', width: '30%', zIndex: 0, opacity: 0.15 }}>
                                        <svg width="100%" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 20C20 20 30 5 50 5C70 5 80 20 100 20" stroke="var(--neon-purple)" strokeWidth="2" strokeDasharray="6 6" />
                                            <path d="M95 15L100 20L95 25" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}

                                <div className="glass-panel h-100 overflow-hidden hover-lift shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.7)', borderRadius: '24px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                    {/* Card Header with Image */}
                                    <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
                                        <img src={step.image} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
                                        
                                        {/* Step Badge */}
                                        <div className="position-absolute top-0 end-0 m-3" style={{ width: '50px', height: '50px', background: 'var(--grad-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                                            {step.id}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 pt-5 position-relative">
                                        {/* Icon Badge */}
                                        <div className="position-absolute top-0 start-50 translate-middle" style={{ width: '70px', height: '70px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid var(--glass-border)' }}>
                                            <i className={step.icon} style={{ fontSize: '1.8rem', color: step.color }}></i>
                                        </div>
                                        
                                        <div className="text-center mt-3">
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-primary)' }}>{step.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{step.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .hover-lift:hover {
                    transform: translateY(-12px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important;
                    background: white !important;
                    border-color: var(--neon-purple) !important;
                }
                .text-gradient {
                    background: var(--grad-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .opacity-05 { opacity: 0.05; }
                @media (max-width: 991px) {
                    .how-it-works-card { margin-bottom: 30px; }
                }
            `}</style>
        </section>
    );
};

export default HowItWorks;
