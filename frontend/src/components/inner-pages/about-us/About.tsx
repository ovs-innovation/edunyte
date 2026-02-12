import { useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
    const [activeTab, setActiveTab] = useState('teachers');

    const tabData = {
        teachers: {
            image: "/assets/img/others/h7_testimonial_img.png",
            badge: "Teach",
            badgeColor: "#4CAF50",
            title: "Teach With Freedom. Grow With Purpose. Inspire With Impact.",
            text: "Teachers are the foundation of Edunyte. We empower educators by giving them a platform where their skills are valued and their growth matters. Whether you’re an experienced professional or a passionate educator, Edunyte offers the flexibility, support, and respect you deserve. We provide flexible teaching schedules, access to motivated students, fair earnings, and long-term growth opportunities."
        },
        students: {
            image: "/assets/img/others/h6_testimonial_img.jpg",
            badge: "Learn",
            badgeColor: "#FFC107",
            title: "Learn Smarter. Progress Faster. Succeed Confidently.",
            text: "Edunyte is designed around students — your pace, your goals, your future. We connect learners with expert educators who focus on understanding, not just syllabus completion. Whether you’re improving grades, preparing for exams, or building skills, Edunyte ensures learning feels clear, supportive, and effective with personalized learning paths and verified teachers."
        },
        values: {
            image: "/assets/img/others/h5_about_img02.jpg",
            badge: "Values",
            badgeColor: "#2196F3",
            title: "Our Core Values",
            text: (
                <>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '0' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Student-First Learning</strong> – Every learner deserves personal attention.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Teacher Empowerment</strong> – Great teaching deserves great support.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Trust & Transparency</strong> – Clear communication at every step.</li>
                        <li style={{ marginBottom: '0' }}><strong>Growth Mindset</strong> – Continuous learning for everyone.</li>
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
                            }}>Where Students Learn Better & Teachers Grow Stronger</h2>
                            <p className="desc" style={{
                                fontSize: '20px',
                                marginBottom: '60px',
                                color: '#4a4a4a',
                                maxWidth: '800px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                lineHeight: '1.6'
                            }}>Edunyte is a modern education platform built to bring students and educators together in one meaningful learning ecosystem. We believe education works best when it’s personal, flexible, and human-led.</p>
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
                                Join the Edunyte Community
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
                            <span style={{ color: '#5751E1', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Purpose</span>
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a' }}>Education that works for real people</h2>
                            <p style={{ fontSize: '18px', color: '#666', marginTop: '15px' }}>
                                We are shaping education with real goals, real support, and real results.
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
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Student Confidence</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Help students learn with confidence and clarity through personalized attention and verified educators.</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#EDE7F6', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#673AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Teacher Support</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Support teachers with opportunities, tools, and flexibility to focus on what they do best: teaching.</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#FFF8E1', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#FFC107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Trusted Environment</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Create a trusted learning environment driven by quality, transparency, and results.</p>
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
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '20px' }}>One Platform for Everyone</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                Whether you’re here to learn, teach, or grow — Edunyte welcomes you.
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
                                        {tab === 'values' ? 'Our Values' : tab}
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
                                            Join as a {activeTab.slice(0, -1)} <i className="fas fa-arrow-right ms-2" style={{ transition: 'transform 0.3s' }}></i>
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
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '15px' }}>Edunyte by numbers</h2>
                            <p style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
                                We’re proud to be a leading platform in the global online education market.
                            </p>
                        </div>
                    </div>

                    <div className="row justify-content-center gutter-24">
                        {[
                            { num: "50K", label: "Tutors", desc: "from 120 countries, teaching 90 languages and 100+ subjects." },
                            { num: "500+", label: "Companies", desc: "trust us to upskill their employees with our corporate training." },
                            { num: "4", label: "Global Hubs", desc: "in New York, London, Kyiv, and Barcelona." },
                            { num: "700+", label: "Employees", desc: "united by one mission: to power people’s progress." }
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
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '15px' }}>Building the Future of Learning</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                Edunyte is more than a platform — it’s a growing community of learners and educators.
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
                                    Edunyte is a modern education platform built to bring students and educators together in one meaningful learning ecosystem. We believe education works best when it’s personal, flexible, and human-led.
                                </p>
                                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '40px' }}>
                                    Whether you’re here to learn, teach, or grow — Edunyte welcomes you. Success at Edunyte is built together.
                                </p>

                                <div className="mission-card" style={{ backgroundColor: '#F9F9F9', padding: '40px', borderRadius: '24px' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: '#0a0a0a' }}>How Edunyte Works</h3>
                                    <ul style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', paddingLeft: '20px', marginBottom: '0', listStyleType: 'decimal' }}>
                                        <li style={{ marginBottom: '10px' }}><strong>Students choose subjects and goals</strong></li>
                                        <li style={{ marginBottom: '10px' }}><strong>Teachers bring expertise and guidance</strong></li>
                                        <li style={{ marginBottom: '10px' }}><strong>Learning happens through structured, engaging sessions</strong></li>
                                        <li><strong>Progress is tracked, supported, and celebrated</strong></li>
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
