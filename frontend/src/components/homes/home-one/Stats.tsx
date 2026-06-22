const statsData = [
    { title: '50+', subtitle: 'Experienced tutors' },
    { title: '500+', subtitle: '5-star tutor reviews' },
    { title: '50+', subtitle: 'Subjects taught' },
    { title: '25+', subtitle: 'Tutor nationalities' },
    // { title: '4.8', subtitle: 'on the App Store', isRating: true }
];

const Stats = () => {
    return (
        <section className="glow-bg" style={{ padding: '0 0 80px 0', position: 'relative', zIndex: 10 }}>
            <div className="container position-relative z-1" style={{ marginTop: '-20px' }}>
                <div className="glass-panel" style={{ padding: '40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', textAlign: 'center' }}>
                    {statsData.map((stat, index) => (
                        <div key={index} style={{ flex: '1 1 150px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}>
                                <h3 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                                    {stat.title}
                                </h3>
                                {stat.isRating && (
                                    <div style={{ display: 'flex', fontSize: '1.2rem', gap: '4px' }}>
                                        <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                                        <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                                        <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                                        <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                                        <i className="fas fa-star" style={{ color: '#fbbf24' }}></i>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                                {stat.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
