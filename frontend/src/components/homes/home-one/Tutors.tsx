const tutors = [
    { name: 'Sarah M.', country: 'United Kingdom', rating: 5.0, reviews: 142, price: 25, subject: 'English', activeStudents: 15, img: '/assets/img/instructor/instructor01.png' },
    { name: 'David L.', country: 'United States', rating: 4.9, reviews: 89, price: 30, subject: 'English', activeStudents: 12, img: '/assets/img/instructor/instructor02.png' },
    { name: 'Elena G.', country: 'Spain', rating: 4.8, reviews: 215, price: 20, subject: 'Spanish', activeStudents: 24, img: '/assets/img/instructor/instructor03.png' },
];

const Tutors = () => {
    return (
        <section style={{ backgroundColor: '#fff', padding: '50px 0' }}>
            <div className="container">
                <div style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '15px' }}>Meet our top tutors</h2>
                    <p style={{ fontSize: '1.1rem', color: '#6d6d6d', maxWidth: '600px' }}>Learn from the best. Our highest-rated tutors are ready to help you gain confidence.</p>
                </div>

                <div className="row">
                    {tutors.map((tutor, idx) => (
                        <div key={idx} className="col-lg-4 col-md-6 mb-4">
                            <div style={{ border: '1px solid #eaeaea', borderRadius: '16px', padding: '24px', transition: 'box-shadow 0.2s', backgroundColor: '#fff' }}
                                onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <img src={tutor.img} alt={tutor.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #eaeaea' }}
                                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/80?text=Tutor"; }}
                                    />
                                    <div style={{ marginLeft: '16px', flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 5px 0', color: '#1a1a1a' }}>{tutor.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#6d6d6d', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <i className="fas fa-graduation-cap" style={{ marginRight: '6px' }}></i> {tutor.subject}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <i className="fas fa-star" style={{ color: '#ffb300', fontSize: '1rem' }}></i>
                                            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{tutor.rating}</span>
                                            <span style={{ color: '#6d6d6d', fontSize: '0.9rem' }}>({tutor.reviews} reviews)</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a' }}>${tutor.price}</div>
                                        <div style={{ color: '#6d6d6d', fontSize: '0.8rem' }}>/lesson</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 500, marginBottom: '8px' }}>
                                        <i className="fas fa-user-graduate" style={{ color: '#3bb3bd' }}></i> {tutor.activeStudents} active students
                                    </div>
                                    <p style={{ color: '#4d4d4d', fontSize: '0.95rem', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        Hi! I'm {tutor.name}, an experienced {tutor.subject} teacher. Let's work together to improve your speaking, listening, reading and writing skills in a fun way!
                                    </p>
                                </div>

                                <button style={{ width: '100%', backgroundColor: '#fff', color: '#1a1a1a', border: '2px solid #1a1a1a', borderRadius: '8px', padding: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#1a1a1a'; }}
                                >
                                    Book trial lesson
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Tutors;
