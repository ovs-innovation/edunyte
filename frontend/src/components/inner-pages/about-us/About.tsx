import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('teachers');

    const tabData = {
        teachers: {
            image: "assets/images/Teach.jpg",
            badge: t('about_page.platform.tabs.teachers.badge', 'Expert Faculty'),
            badgeColor: "#5751E1",
            title: t('about_page.platform.tabs.teachers.title', 'Empowering Educators'),
            text: t('about_page.platform.tabs.teachers.text', 'We provide tutors with the tools and global reach they need to transform lives. Our platform handles the logistics, so experts can focus on what they do best: teaching.')
        },
        students: {
            image: "/assets/img/banner/h5_hero_img.png",
            badge: t('about_page.platform.tabs.students.badge', 'Success Driven'),
            badgeColor: "#FFC107",
            title: t('about_page.platform.tabs.students.title', 'Student-Centric Learning'),
            text: t('about_page.platform.tabs.students.text', 'Personalized education tailored to individual goals. From K-12 to professional development, we connect students with the perfect mentor for their unique path.')
        },
        values: {
            image: "/assets/img/banner/h3_hero_img.png",
            badge: t('about_page.platform.tabs.values.badge', 'Core Values'),
            badgeColor: "#009688",
            title: t('about_page.platform.tabs.values.title', 'Our Guiding Principles'),
            text: t('about_page.platform.tabs.values.list.1', 'Integrity, innovation, and inclusivity are at the heart of everything we do. We believe education should be accessible, high-quality, and borderless.')
        }
    };

    const currentTab = tabData[activeTab as keyof typeof tabData];

    return (
        <div className="about-page-content">
            {/* Purpose Section */}
            <section className="purpose-area section-pt-120 section-pb-120">
                <div className="container">
                    <div className="row g-4">
                        {[
                            { icon: 'fa-user-graduate', title: t('about_page.purpose.cards.student_confidence.title', 'Student Confidence'), text: t('about_page.purpose.cards.student_confidence.description', 'Building self-assurance through personalized, 1-on-1 mentorship.'), bg: 'rgba(87, 81, 225, 0.05)' },
                            { icon: 'fa-chalkboard-teacher', title: t('about_page.purpose.cards.teacher_support.title', 'Teacher Support'), text: t('about_page.purpose.cards.teacher_support.description', 'Giving educators the platform to build their brand and reach.'), bg: 'rgba(255, 107, 139, 0.05)' },
                            { icon: 'fa-shield-alt', title: t('about_page.purpose.cards.trusted_environment.title', 'Trusted Environment'), text: t('about_page.purpose.cards.trusted_environment.description', 'A secure environment verified by thousands of success stories.'), bg: 'rgba(0, 150, 136, 0.05)' }
                        ].map((item, idx) => (
                            <div key={idx} className="col-lg-4">
                                <div className="glass-panel p-5 h-100 hover-scale shadow-sm" style={{ border: '1px solid var(--glass-border)', borderRadius: '20px' }}>
                                    <div className="icon-wrap mb-4 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '16px', background: item.bg, color: '#5751E1' }}>
                                        <i className={`fas ${item.icon} fa-2x`}></i>
                                    </div>
                                    <h3 className="fw-800 mb-3" style={{ fontSize: '1.5rem' }}>{item.title}</h3>
                                    <p className="opacity-70 m-0" style={{ lineHeight: 1.6 }}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Innovation */}
            <section className="innovation-area section-pb-120">
                <div className="container">
                    <div className="glass-panel p-5 shadow-lg overflow-hidden position-relative" style={{ borderRadius: '32px', border: '1px solid rgba(0,0,0,0.05)', background: 'white' }}>
                        <div className="row align-items-center">
                            <div className="col-lg-5 mb-40 mb-lg-0">
                                <h2 className="fw-900 mb-4" style={{ fontSize: '2.5rem', color: '#1B1B1B' }}>{t('about_page.platform.title', 'One Platform for Everyone')}</h2>
                                <div className="d-flex flex-column gap-3 mb-40">
                                    {Object.keys(tabData).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`text-start p-4 rounded-3 border-0 transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-transparent text-muted hover-bg-light'}`}
                                            style={{ fontWeight: 700, fontSize: '1.1rem', background: activeTab === tab ? '#5751E1' : 'transparent' }}
                                        >
                                            {tab === 'teachers' ? t('about_page.platform.tabs.teachers.badge', 'For Educators') : tab === 'students' ? t('about_page.platform.tabs.students.badge', 'For Learners') : t('about_page.platform.tabs.values.badge', 'Our Legacy')}
                                        </button>
                                    ))}
                                </div>
                                <Link to="/instructors" className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-2" style={{ color: '#5751E1' }}>
                                    {t('common.explore', 'Explore the platform')} <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                            <div className="col-lg-7">
                                <div className="ps-lg-5">
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-6">
                                            <div className="rounded-4 overflow-hidden shadow-sm border">
                                                <img src={currentTab.image} alt="" className="w-100" style={{ height: '350px', objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: currentTab.badgeColor, color: 'white' }}>{currentTab.badge}</span>
                                            <h4 className="fw-800 mb-3" style={{ fontSize: '1.5rem', color: '#1B1B1B' }}>{currentTab.title}</h4>
                                            <p className="opacity-70 m-0" style={{ lineHeight: 1.6 }}>{currentTab.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .hover-scale { transition: transform 0.3s ease; }
                .hover-scale:hover { transform: translateY(-5px); }
                .hover-bg-light:hover { background: rgba(87, 81, 225, 0.05) !important; color: #5751E1 !important; }
                .bg-primary { background-color: #5751E1 !important; }
            `}</style>
        </div>
    )
}

export default About
