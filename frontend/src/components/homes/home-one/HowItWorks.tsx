const HowItWorks = () => {
    return (
        <section style={{ backgroundColor: '#fff', padding: '30px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a' }}>How it works</h2>
                    <p style={{ fontSize: '1.1rem', color: '#6d6d6d', maxWidth: '600px', margin: '0 auto' }}>Learn a language online with 1-on-1 lessons tailored specifically to your needs.</p>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#eef6f6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', color: '#3bb3bd' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>1. Find the best tutor</h3>
                            <p style={{ color: '#6d6d6d', lineHeight: 1.6 }}>Choose from over 32,000 online tutors. Use filters to narrow your search and find the perfect fit.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#eef6f6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="far fa-calendar-check" style={{ fontSize: '2rem', color: '#3bb3bd' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>2. Take lessons anytime</h3>
                            <p style={{ color: '#6d6d6d', lineHeight: 1.6 }}>Find the perfect time for your busy schedule. Book lessons in seconds via desktop or mobile.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#eef6f6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-video" style={{ fontSize: '2rem', color: '#3bb3bd' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>3. Enter virtual classroom</h3>
                            <p style={{ color: '#6d6d6d', lineHeight: 1.6 }}>When it's lesson time, connect with your tutor through our comprehensive video platform.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
