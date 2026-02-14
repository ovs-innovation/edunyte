import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('teachers');

    const tabData = {
        teachers: {
            image: "/assets/img/others/h7_testimonial_img.png",
            badge: t('about_page.platform.tabs.teachers.badge'),
            badgeColor: "#4CAF50",
            title: t('about_page.platform.tabs.teachers.title'),
            text: t('about_page.platform.tabs.teachers.text')
        },
        students: {
            image: "/assets/img/others/h6_testimonial_img.jpg",
            badge: t('about_page.platform.tabs.students.badge'),
            badgeColor: "#FFC107",
            title: t('about_page.platform.tabs.students.title'),
            text: t('about_page.platform.tabs.students.text')
        },
        values: {
            image: "/assets/img/others/h5_about_img02.jpg",
            badge: t('about_page.platform.tabs.values.badge'),
            badgeColor: "#2196F3",
            title: t('about_page.platform.tabs.values.title'),
            text: (
                <>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '0' }}>
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('about_page.platform.tabs.values.list.1') }} />
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('about_page.platform.tabs.values.list.2') }} />
                        <li style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: t('about_page.platform.tabs.values.list.3') }} />
                        <li style={{ marginBottom: '0' }} dangerouslySetInnerHTML={{ __html: t('about_page.platform.tabs.values.list.4') }} />
                    </ul>
                </>
            )
        }
    };

    const currentTab = tabData[activeTab as keyof typeof tabData];

    return (
        <>
            {/* Hero Section */}
            <section className="about-area section-py-120" style={{ backgroundColor: '#fff' }}>
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-xl-10 col-lg-12">
                            <h2 className="title" style={{
                                fontSize: '56px',
                                fontWeight: 800,
                                marginBottom: '24px',
                                color: '#0a0a0a',
                                letterSpacing: '-1px',
                                lineHeight: '1.2'
                            }}>{t('about_page.hero.title')}</h2>
                            <p className="desc" style={{
                                fontSize: '20px',
                                marginBottom: '60px',
                                color: '#4a4a4a',
                                maxWidth: '800px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                lineHeight: '1.6'
                            }}>{t('about_page.hero.description')}</p>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-12">
                            <div className="position-relative" style={{
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                aspectRatio: '16/9',
                                backgroundColor: '#f0f0f0'
                            }}>
                                <img src="/assets/img/bg/h4_video_bg.jpg" alt="Edunyte Platform" style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-60">
                        <div className="col-auto">
                            <Link to="/registration" className="btn about-btn" style={{
                                backgroundColor: '#ff6b8b',
                                color: '#fff',
                                padding: '18px 48px',
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: 700,
                                border: '2px solid #0a0a0a',
                                boxShadow: '4px 4px 0px #0a0a0a',
                                display: 'inline-block',
                                textTransform: 'none'
                            }}>
                                {t('about_page.hero.button')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Purpose Section (formerly Goals) */}
            <section className="goals-area section-pb-120" style={{ backgroundColor: '#f9f9f9', paddingTop: '100px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-8">
                            <span style={{ color: '#5751E1', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('about_page.purpose.subtitle')}</span>
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a' }}>{t('about_page.purpose.title')}</h2>
                            <p style={{ fontSize: '18px', color: '#666', marginTop: '15px' }}>
                                {t('about_page.purpose.description')}
                            </p>
                        </div>
                    </div>
                    <div className="row gutter-24 justify-content-center">
                        {/* Card 1 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#E0F2F1', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#009688', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>{t('about_page.purpose.cards.student_confidence.title')}</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{t('about_page.purpose.cards.student_confidence.description')}</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#EDE7F6', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#673AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>{t('about_page.purpose.cards.teacher_support.title')}</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{t('about_page.purpose.cards.teacher_support.description')}</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#FFF8E1', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#FFC107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>{t('about_page.purpose.cards.trusted_environment.title')}</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{t('about_page.purpose.cards.trusted_environment.description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Powering Platform Section */}
            <section className="platform-area section-pb-120" style={{ backgroundColor: '#fff', paddingTop: '100px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-50">
                        <div className="col-lg-8">
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '20px' }}>{t('about_page.platform.title')}</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                {t('about_page.platform.description')}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="row justify-content-center mb-40">
                        <div className="col-auto">
                            <div className="d-flex gap-4 p-2" style={{ borderBottom: '2px solid #eee' }}>
                                {Object.keys(tabData).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '20px',
                                            fontWeight: 700,
                                            padding: '10px 20px',
                                            color: activeTab === tab ? '#ff6b8b' : '#999',
                                            borderBottom: activeTab === tab ? '3px solid #ff6b8b' : '3px solid transparent',
                                            textTransform: 'capitalize',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t(`about_page.platform.tabs.${tab}.name`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-10">
                            <div className="row align-items-center" style={{ backgroundColor: '#F5F5F7', borderRadius: '30px', padding: '40px', minHeight: '400px' }}>
                                <div className="col-md-6 mb-4 mb-md-0">
                                    <div className="position-relative" style={{ borderRadius: '20px', overflow: 'hidden', height: '350px' }}>
                                        <img
                                            src={currentTab.image}
                                            alt={typeof currentTab.title === 'string' ? currentTab.title : 'Edunyte Image'}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            right: '20px',
                                            backgroundColor: '#fff',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            color: '#0a0a0a',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            <span style={{ color: currentTab.badgeColor, marginRight: '8px', fontSize: '20px' }}>●</span>
                                            {currentTab.badge}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 ps-md-5">
                                    <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px', textTransform: 'capitalize' }}>
                                        {currentTab.title}
                                    </h3>
                                    <div style={{ fontSize: '18px', lineHeight: '1.7', color: '#555', marginBottom: '30px' }}>
                                        {currentTab.text}
                                    </div>
                                    {activeTab !== 'values' && (
                                        <Link to="/registration" style={{
                                            fontWeight: 700,
                                            color: '#5751E1',
                                            fontSize: '16px',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center'
                                        }}>
                                            {t('about_page.platform.join_link', { role: activeTab === 'teachers' ? t('about_page.roles.teacher') : t('about_page.roles.student') })} <i className="fas fa-arrow-right ms-2" style={{ transition: 'transform 0.3s' }}></i>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Numbers Section */}
            <section className="numbers-area section-pb-120" style={{ backgroundColor: '#fff', paddingTop: '100px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-10">
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '15px' }}>{t('about_page.numbers.title')}</h2>
                            <p style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
                                {t('about_page.numbers.description')}
                            </p>
                        </div>
                    </div>

                    <div className="row justify-content-center gutter-24">
                        {[
                            { num: "50K", label: t('about_page.numbers.items.tutors.label'), desc: t('about_page.numbers.items.tutors.desc') },
                            { num: "500+", label: t('about_page.numbers.items.companies.label'), desc: t('about_page.numbers.items.companies.desc') },
                            { num: "4", label: t('about_page.numbers.items.global_hubs.label'), desc: t('about_page.numbers.items.global_hubs.desc') },
                            { num: "700+", label: t('about_page.numbers.items.employees.label'), desc: t('about_page.numbers.items.employees.desc') }
                        ].map((item, index) => (
                            <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                                <div className="number-card text-center" style={{
                                    padding: '40px 20px',
                                    borderRadius: '20px',
                                    border: '1px solid #eee',
                                    backgroundColor: '#fff',
                                    height: '100%',
                                    transition: 'transform 0.3s ease',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.03)'
                                }}>
                                    <h3 style={{ fontSize: '56px', fontWeight: 800, color: '#ff6b8b', marginBottom: '10px' }}>{item.num}</h3>
                                    <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0a0a0a', marginBottom: '15px', textTransform: 'capitalize' }}>{item.label}</h4>
                                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#666' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-area section-pb-120" style={{ backgroundColor: '#fff', paddingTop: '80px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-10">
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '15px' }}>{t('about_page.story.title')}</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                {t('about_page.story.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <div className="story-img" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                <img src="/assets/img/others/h8_about_img01.jpg" alt="Story" className="img-fluid w-100" style={{ objectFit: 'cover', minHeight: '500px' }} />
                            </div>
                        </div>
                        <div className="col-lg-6 ps-lg-5">
                            <div className="story-content">
                                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '30px' }}>
                                    {t('about_page.story.p1')}
                                </p>
                                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '40px' }}>
                                    {t('about_page.story.p2')}
                                </p>

                                <div className="mission-card" style={{ backgroundColor: '#F9F9F9', padding: '40px', borderRadius: '24px' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: '#0a0a0a' }}>{t('about_page.story.box_title')}</h3>
                                    <ul style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', paddingLeft: '20px', marginBottom: '0', listStyleType: 'decimal' }}>
                                        <li style={{ marginBottom: '10px' }}><strong>{t('about_page.story.list.1')}</strong></li>
                                        <li style={{ marginBottom: '10px' }}><strong>{t('about_page.story.list.2')}</strong></li>
                                        <li style={{ marginBottom: '10px' }}><strong>{t('about_page.story.list.3')}</strong></li>
                                        <li><strong>{t('about_page.story.list.4')}</strong></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .about-btn:hover {
                    transform: translate(2px, 2px);
                    box-shadow: 2px 2px 0px #0a0a0a !important;
                }
                .about-btn:active {
                    transform: translate(4px, 4px);
                    box-shadow: none !important;
                }
                .goal-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                }
            `}</style>
        </>
    )
}

export default About
