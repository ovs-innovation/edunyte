const HowItWorks = () => {
    return (
        <section className="glow-bg" style={{ padding: '80px 0' }}>
            <div className="container position-relative z-1">
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 className="text-gradient" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '15px' }}>How it works</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Learn a language online with 1-on-1 lessons tailored specifically to your needs.</p>
                </div>

                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="glass-panel" style={{ padding: '40px 30px', textAlign: 'center', height: '100%' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', color: 'var(--neon-blue)' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-primary)' }}>1. Find the best tutor</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Choose from over 32,000 online tutors. Use filters to narrow your search and find the perfect fit.</p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="glass-panel" style={{ padding: '40px 30px', textAlign: 'center', height: '100%' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                <i className="far fa-calendar-check" style={{ fontSize: '2rem', color: 'var(--neon-purple)' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-primary)' }}>2. Take lessons anytime</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>Find the perfect time for your busy schedule. Book lessons in seconds via desktop or mobile.</p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="glass-panel" style={{ padding: '40px 30px', textAlign: 'center', height: '100%' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                <i className="fas fa-video" style={{ fontSize: '2rem', color: 'var(--neon-cyan)' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-primary)' }}>3. Enter virtual classroom</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>When it's lesson time, connect with your tutor through our comprehensive video platform.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
