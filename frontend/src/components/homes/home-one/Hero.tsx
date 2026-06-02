import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="glow-bg" style={{ padding: '0 0 0 0', marginTop: '-15px', position: 'relative', zIndex: 1 }}>
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
                            <i className="fas fa-certificate" style={{ color: 'var(--neon-purple)' }}></i> {t('home.one.hero.badge_text', 'ELEVATING EDUCATION FOR EVERYONE')}
                        </div>

                        <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
  {t('home.one.hero.title', 'Unlock **your** **potential**  with the best tutors')
    .split(' ')
    .map((word: string, i: number) =>
      word.startsWith('**') && word.endsWith('**')
        ? <span key={i} className="text-gradient"> {word.replace(/\*\*/g, '')} </span>
        : word + ' '
    )}
</h1>
                        <p style={{ fontSize: '1.25rem', marginBottom: '40px', maxWidth: '550px', lineHeight: 1.6 }}>
                            {t('home.one.hero.description', 'Prepare to achieve your goals with private lessons from professional tutors.')}
                        </p>

                        {/* Standardized Buttons */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                            <Link to="/instructors" className="btn-neon-primary">
                                {t('home.one.hero.find_tutor', 'Find A Tutor')} <i className="fas fa-arrow-right"></i>
                            </Link>

                            <Link to="/courses" className="btn-neon-primary">
                                Explore Courses <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>

                        {/* Joined Members UI */}
                        <div className="d-flex align-items-center gap-3 mt-4">
                            <div className="d-flex">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="rounded-circle border border-white" style={{ width: '42px', height: '42px', marginLeft: i === 1 ? 0 : '-15px', background: `var(--grad-primary)`, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        <img src={`/assets/img/banner/banner_author0${i % 2 + 1}.png`} alt="Member" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                            <div className="small fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                                <span className="text-primary">150+</span> {t('home.one.hero.joined_learners', 'learners joined already')}
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
                                    <div style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-primary)', lineHeight: 1 }}>{t('home.one.hero.experienced_tutors_count', '50+')}</div>
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
