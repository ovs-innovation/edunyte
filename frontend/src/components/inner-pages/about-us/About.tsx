import { useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
    const [activeTab, setActiveTab] = useState('tutors');
    // const [activeMilestone, setActiveMilestone] = useState('2012-2015');

    // const milestoneData = {
    //     '2012-2015': {
    //         year: '2012–2015',
    //         title: "Laying the foundation",
    //         desc: "Edunyte was founded with a simple mission. After launching the first version of the platform, the co-founders began hiring the initial team, expanded into international markets, and reached our first 3,000 tutors.",
    //         image1: "/assets/img/others/h5_about_img02.jpg",
    //         image2: "/assets/img/others/student_grp.png"
    //     },
    //     '2016-2018': {
    //         year: '2016–2018',
    //         title: "Expanding globally",
    //         desc: "Edunyte scaled rapidly into a truly global marketplace for learners and tutors. The platform evolved beyond discovery, launching core tutor tools including scheduling and an integrated video classroom.",
    //         image1: "/assets/img/others/h7_choose_img03.jpg",
    //         image2: "/assets/img/others/h8_about_img01.jpg"
    //     },
    //     '2019-2023': {
    //         year: '2019–2023',
    //         title: "Leading the category",
    //         desc: "Edunyte raised significant funding to double down on product innovation. We opened hubs in Barcelona and New York, becoming the global leader in online language tutoring.",
    //         image1: "/assets/img/bg/h4_video_bg.jpg",
    //         image2: "/assets/img/others/h6_testimonial_img.jpg"
    //     },
    //     '2024-2026+': {
    //         year: '2024–2026+',
    //         title: "AI & The Future",
    //         desc: "Continuing to innovate with AI-powered lesson plans and smart matching. We are committed to powering the future of personalized learning for everyone, everywhere.",
    //         image1: "/assets/img/others/h4_choose_img.jpg",
    //         image2: "/assets/img/others/h7_testimonial_img.png"
    //     }
    // };

    // const currentMilestone = milestoneData[activeMilestone as keyof typeof milestoneData];

    const tabData = {
        tutors: {
            image: "/assets/img/others/h7_testimonial_img.png",
            badge: "Teach",
            badgeColor: "#4CAF50",
            title: "Tutors",
            text: "Passionate experts who want to share their knowledge and help others grow. Our tutors are the heart of Edunyte, bringing real-world experience to the virtual classroom."
        },
        learners: {
            image: "/assets/img/others/h6_testimonial_img.jpg",
            badge: "Learn",
            badgeColor: "#FFC107",
            title: "Learners",
            text: "Curious minds seeking new skills and personal development opportunities. Our learners come from all walks of life, united by a desire to reach their full potential."
        },
        employees: {
            image: "/assets/img/others/h5_about_img02.jpg",
            badge: "Build",
            badgeColor: "#2196F3",
            title: "Employees",
            text: "Dedicated professionals building the future of education together. From engineering to design, our team is committed to creating the best learning experience possible."
        }
    };

    // Helper for type safety if needed, but JS object access is fine here.
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
                            }}>Powering people’s progress.</h2>
                            <p className="desc" style={{
                                fontSize: '20px',
                                marginBottom: '60px',
                                color: '#4a4a4a',
                                maxWidth: '800px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                lineHeight: '1.6'
                            }}>Our mission is simple: connect people through learning, and help them go further than they thought possible.</p>
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
                                <img src="/assets/img/bg/h4_video_bg.jpg" alt="Powering progress" style={{
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
                                Try Edunyte
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Goals Section */}
            <section className="goals-area section-pb-120" style={{ backgroundColor: '#f9f9f9', paddingTop: '100px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-8">
                            <span style={{ color: '#5751E1', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Features</span>
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a' }}>Achieve Your Goal With Edunyte</h2>
                            <p style={{ fontSize: '18px', color: '#666', marginTop: '15px' }}>
                                Education is the most powerful weapon which you can use to change the world.
                            </p>
                        </div>
                    </div>
                    <div className="row gutter-24 justify-content-center">
                        {/* Card 1 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#E0F2F1', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#009688', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Expert Tutors</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Our tutors are highly qualified and experienced professionals who are passionate about teaching.</p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#EDE7F6', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#673AB7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-book-open"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Effective Courses</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Our courses are designed to be engaging, interactive, and effective, helping you achieve your learning goals.</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="col-lg-4 col-md-6">
                            <div className="goal-card" style={{ backgroundColor: '#FFF8E1', padding: '40px 30px', borderRadius: '20px', transition: 'all 0.3s ease', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div className="icon mb-30" style={{ width: '70px', height: '70px', backgroundColor: '#FFC107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px' }}>
                                    <i className="fas fa-certificate"></i>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '15px' }}>Earn Certificate</h3>
                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>Earn a certificate upon completion of your course, validating your new skills and knowledge.</p>
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
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '20px' }}>Powering our platform</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                Pages and videos are personal for everyone, every time. See how we help everyone find their place.
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="row justify-content-center mb-40">
                        <div className="col-auto">
                            <div className="d-flex gap-4 p-2" style={{ borderBottom: '2px solid #eee' }}>
                                {['tutors', 'learners', 'employees'].map((tab) => (
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
                                        {tab}
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
                                            alt={currentTab.title}
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
                                    <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px', textTransform: 'capitalize' }}>{currentTab.title}</h3>
                                    <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#555', marginBottom: '30px' }}>
                                        {currentTab.text}
                                    </p>
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
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '15px' }}>The story behind Edunyte</h2>
                            <p style={{ fontSize: '18px', color: '#666' }}>
                                It started with one learner. Now, millions are making real progress every day.
                            </p>
                        </div>
                    </div>

                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <div className="story-img" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                <img src="/assets/img/others/h8_about_img01.jpg" alt="Founder" className="img-fluid w-100" style={{ objectFit: 'cover', minHeight: '500px' }} />
                            </div>
                        </div>
                        <div className="col-lg-6 ps-lg-5">
                            <div className="story-content">
                                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '30px' }}>
                                    Growing up, our founder realized that traditional education often left students behind. He knew how important personalized learning would be, but the tools available didn't get him there. So he built something that would.
                                </p>
                                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '40px' }}>
                                    In 2024, Edunyte launched: A human-led, AI-enabled platform designed to support meaningful progress for millions of learners worldwide. What began as a single idea is now a global marketplace, the largest of its kind.
                                </p>

                                <div className="mission-card" style={{ backgroundColor: '#F9F9F9', padding: '40px', borderRadius: '24px' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: '#0a0a0a' }}>Our vision & mission</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#666', marginBottom: '0' }}>
                                        We combine the flexibility of online learning with personalized lessons from expert tutors to create life-changing experiences that power people’s progress.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Milestones Section */}
            {/* <section className="milestone-area section-pb-120" style={{ backgroundColor: '#fff', paddingTop: '50px' }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-50">
                        <div className="col-lg-10">
                            <h2 className="title" style={{ fontWeight: 800, fontSize: '42px', color: '#0a0a0a', marginBottom: '40px' }}>Edunyte milestones</h2>

                            {/* Milestone Tabs */}
                            {/* <div className="d-flex justify-content-center gap-4 flex-wrap mb-50 position-relative"> */}
                                {/* Line through - visual only, hidden on mobile if messy */}
                                {/* <div className="d-none d-md-block" style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    width: '100%',
                                    height: '2px',
                                    backgroundColor: '#eee',
                                    zIndex: 0
                                }}></div>

                                {Object.keys(milestoneData).map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => setActiveMilestone(year)}
                                        className="position-relative"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            fontWeight: 800,
                                            padding: '10px 20px',
                                            color: activeMilestone === year ? '#ff6b8b' : '#0a0a0a',
                                            borderBottom: activeMilestone === year ? '4px solid #ff6b8b' : '4px solid transparent',
                                            cursor: 'pointer',
                                            zIndex: 1,
                                            opacity: activeMilestone === year ? 1 : 0.5,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row align-items-center">
                        <div className="col-lg-5 mb-5 mb-lg-0">
                            <div className="milestone-content pe-lg-4">
                                <span style={{
                                    display: 'inline-block',
                                    fontSize: '32px',
                                    fontWeight: 800,
                                    color: '#0a0a0a',
                                    marginBottom: '10px'
                                }}>
                                    {currentMilestone.year}
                                </span>
                                <h3 style={{
                                    fontSize: '36px',
                                    fontWeight: 700,
                                    marginBottom: '20px',
                                    color: '#0a0a0a'
                                }}>
                                    {currentMilestone.title}
                                </h3>
                                <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#555' }}>
                                    {currentMilestone.desc}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row gutter-20">
                                <div className="col-6">
                                    <div style={{ borderRadius: '20px', overflow: 'hidden', height: '300px' }}>
                                        <img src={currentMilestone.image1} alt="Milestone 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={{ borderRadius: '20px', overflow: 'hidden', height: '300px', marginTop: '40px' }}>
                                        <img src={currentMilestone.image2} alt="Milestone 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            // </section> */}
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
