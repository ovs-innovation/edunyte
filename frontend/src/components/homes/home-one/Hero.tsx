import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section style={{ backgroundColor: '#fcfaf8', padding: '100px 0', borderBottom: '1px solid #eaeaea' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-5 mb-lg-0">
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, marginBottom: '20px' }}>
                            {t('home.one.hero.title')}
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#4d4d4d', marginBottom: '40px', maxWidth: '500px' }}>
                            {t('home.one.hero.description')}
                        </p>

                        <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <i key={s} className="fas fa-star" style={{ color: '#ffb300', fontSize: '1.2rem' }}></i>
                                ))}
                            </div>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{t('home.one.hero.trustpilot_rating')}</span>
                            <span style={{ color: '#6d6d6d' }}>{t('home.one.hero.trustpilot_reviews')}</span>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div style={{ position: 'relative', textAlign: 'right' }}>
                            <img src="/assets/img/banner/banner_img.png" alt="Happy student" style={{ maxWidth: '100%', borderRadius: '16px' }} />
                            {/* Decorative badge */}
                            <div style={{ position: 'absolute', bottom: '10%', left: '-10%', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: '#eef6f6', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-check" style={{ color: '#3bb3bd', fontSize: '1.5rem' }}></i>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t('home.one.hero.experienced_tutors_count')}</div>
                                    <div style={{ color: '#6d6d6d', fontSize: '0.9rem' }}>{t('home.one.hero.experienced_tutors_label')}</div>
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
