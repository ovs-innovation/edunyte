import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="glow-bg" style={{ padding: '20px 0 0 0' }}>
            <div className="container position-relative z-1">
                <div className="row align-items-center" style={{ minHeight: '75vh' }}>
                    <div className="col-lg-6 mb-5 mb-lg-0">
                        <div className="hero-badge glass-panel" style={{
                            color: 'var(--neon-purple)',
                            padding: '10px 24px',
                            borderRadius: '50px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            marginBottom: '32px'
                        }}>
                            <i className="fas fa-star" style={{ color: '#fbbf24' }}></i> {t('home.one.hero.trustpilot_reviews', 'TRUSTED BY 100K+ LEARNERS WORLDWIDE')}
                        </div>

                        <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
                            {t('home.one.hero.title', 'Unlock your potential with the best tutors').split(' ').map((word: string, i: number) =>
                                i === 1 || i === 2 ? <span key={i} className="text-gradient"> {word} </span> : word + ' '
                            )}
                        </h1>
                        <p style={{ fontSize: '1.25rem', marginBottom: '40px', maxWidth: '550px', lineHeight: 1.6 }}>
                            {t('home.one.hero.description', 'Prepare to achieve your goals with private lessons from professional language tutors.')}
                        </p>

                        {/* Standardized Buttons */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                            <Link to="/courses" className="btn-neon-primary">
                                Find A Tutor <i className="fas fa-arrow-right"></i>
                            </Link>
                            <Link to="/courses" className="btn-neon-outline">
                                Explore Courses
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <i key={s} className="fas fa-star" style={{ color: '#fbbf24', fontSize: '1.2rem' }}></i>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{t('home.one.hero.trustpilot_rating', '4.8 on Trustpilot')}</span>
                                <span style={{ fontSize: '0.85rem' }}>{t('home.one.hero.trustpilot_reviews', '(Over 100k reviews)')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <img
                                src="/assets/images/boyhero.png"
                                alt="Edunyte Hero"
                                style={{
                                    width: '100%',
                                    maxWidth: '680px',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            />
                            {/* Decorative badge */}
                            <div className="glass-panel" style={{ position: 'absolute', bottom: '15%', left: '0%', padding: '24px 30px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 2 }}>
                                <div style={{ background: 'var(--grad-primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neon-shadow-purple)' }}>
                                    <i className="fas fa-check" style={{ color: '#fff', fontSize: '1.8rem' }}></i>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', lineHeight: 1 }}>{t('home.one.hero.experienced_tutors_count', '32,000+')}</div>
                                    <div style={{ fontSize: '1rem', marginTop: '4px' }}>{t('home.one.hero.experienced_tutors_label', 'Experienced Tutors')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
