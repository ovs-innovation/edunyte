import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('teachers');

    const tabData = {
        teachers: {
            image: "/assets/img/others/educational_collaboration.png",
            badge: "Expert Faculty",
            badgeColor: "#5751E1",
            title: "Empowering Educators",
            text: "We provide tutors with the tools and global reach they need to transform lives. Our platform handles the logistics, so experts can focus on what they do best: teaching."
        },
        students: {
            image: "/assets/img/others/student_success_celebration.png",
            badge: "Success Driven",
            badgeColor: "#FFC107",
            title: "Student-Centric Learning",
            text: "Personalized education tailored to individual goals. From K-12 to professional development, we connect students with the perfect mentor for their unique path."
        },
        values: {
            image: "/assets/img/others/global_education_network.png",
            badge: "Core Values",
            badgeColor: "#009688",
            title: "Our Guiding Principles",
            text: "Integrity, innovation, and inclusivity are at the heart of everything we do. We believe education should be accessible, high-quality, and borderless."
        }
    };

    const currentTab = tabData[activeTab as keyof typeof tabData];

    return (
        <>
            {/* Hero Section */}
            <section className="about-area section-pt-120 section-pb-120 glow-bg overflow-hidden">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-50 mb-lg-0">
                            <div className="about-content">
                                <div className="section-title mb-30">
                                    <span className="sub-title text-primary fw-bold mb-2 d-block">OUR MISSION</span>
                                    <h2 className="title" style={{ fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
                                        Revolutionizing <span className="text-grad">Education</span> for a Global Future.
                                    </h2>
                                </div>
                                <p className="opacity-70 mb-40" style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
                                    Edunyte is more than a platform; it's a movement to bridge the gap between world-class expertise and ambitious learners, regardless of geography.
                                </p>
                                <div className="d-flex flex-wrap gap-4">
                                    <Link to="/registration" className="btn-neon-primary py-3 px-5">Join our Journey</Link>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="rounded-circle border border-white" style={{ width: '40px', height: '40px', marginLeft: i === 1 ? 0 : '-15px', background: `var(--grad-primary)`, overflow: 'hidden' }}>
                                                    <img src={`/assets/img/banner/banner_author0${i % 2 + 1}.png`} alt="" className="w-100" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="small fw-bold">Joined by 50k+ Members</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <div className="glass-panel p-3 shadow-lg rotate-3" style={{ borderRadius: '30px', transform: 'rotate(2deg)' }}>
                                    <img src="/assets/img/others/mission_vision_hero.png" alt="Mission" className="w-100 rounded-4" style={{ minHeight: '400px', objectFit: 'cover' }} />
                                </div>
                                <div className="position-absolute top-0 start-0 glass-panel p-4 shadow-sm translate-middle-x" style={{ marginTop: '20%', marginLeft: '-5%' }}>
                                    <h4 className="m-0 fw-900">98%</h4>
                                    <p className="m-0 small opacity-60">Satisfaction Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Purpose Section */}
            <section className="purpose-area section-pb-120">
                <div className="container">
                    <div className="row g-4">
                        {[
                            { icon: 'fa-user-graduate', title: 'Student Confidence', text: 'Building self-assurance through personalized, 1-on-1 mentorship.', bg: 'rgba(87, 81, 225, 0.05)' },
                            { icon: 'fa-chalkboard-teacher', title: 'Teacher Autonomy', text: 'Giving educators the platform to build their brand and reach.', bg: 'rgba(255, 107, 139, 0.05)' },
                            { icon: 'fa-shield-alt', title: 'Global Trust', text: 'A secure environment verified by thousands of success stories.', bg: 'rgba(0, 150, 136, 0.05)' }
                        ].map((item, idx) => (
                            <div key={idx} className="col-lg-4">
                                <div className="glass-panel p-5 h-100 hover-scale shadow-sm" style={{ border: '1px solid var(--glass-border)' }}>
                                    <div className="icon-wrap mb-4 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '16px', background: item.bg, color: 'var(--text-primary)' }}>
                                        <i className={`fas ${item.icon} fa-2x`}></i>
                                    </div>
                                    <h3 className="fw-800 mb-3">{item.title}</h3>
                                    <p className="opacity-70 m-0">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Innovation */}
            <section className="innovation-area section-pb-120">
                <div className="container">
                    <div className="glass-panel p-5 shadow-lg overflow-hidden position-relative">
                        <div className="row align-items-center">
                            <div className="col-lg-5 mb-40 mb-lg-0">
                                <h2 className="fw-900 mb-4" style={{ fontSize: '2.5rem' }}>Powering the <span className="text-primary">Next Generation</span> of Learning.</h2>
                                <div className="d-flex flex-column gap-3 mb-40">
                                    {Object.keys(tabData).map((tab) => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`text-start p-3 rounded-3 border-0 transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-dark hover-bg-light'}`}
                                            style={{ fontWeight: 700, fontSize: '1.1rem' }}
                                        >
                                            {tab === 'teachers' ? 'For Educators' : tab === 'students' ? 'For Learners' : 'Our Legacy'}
                                        </button>
                                    ))}
                                </div>
                                <Link to="/registration" className="fw-bold text-primary">Explore the platform <i className="fas fa-arrow-right ms-2"></i></Link>
                            </div>
                            <div className="col-lg-7">
                                <div className="ps-lg-5">
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-6">
                                            <div className="rounded-4 overflow-hidden shadow-sm">
                                                <img src={currentTab.image} alt="" className="w-100" style={{ height: '350px', objectFit: 'cover' }} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: currentTab.badgeColor, color: 'white' }}>{currentTab.badge}</span>
                                            <h4 className="fw-800 mb-3">{currentTab.title}</h4>
                                            <p className="opacity-70 m-0">{currentTab.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .rotate-3 { transform: rotate(3deg); }
                .hover-bg-light:hover { background: rgba(0,0,0,0.05); }
                .text-grad {
                    background: var(--grad-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </>
    )
}

export default About
