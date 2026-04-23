import React from 'react';
import { useTranslation } from 'react-i18next';

const Newsletter = () => {
    const { t } = useTranslation();

    return (
        <section style={{ backgroundColor: '#eef6f6', padding: '80px 0' }}>
            <div className="container">
                <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '60px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: '#3bb3bd', opacity: 0.1, borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-80px', left: '10%', width: '150px', height: '150px', backgroundColor: '#ffb300', opacity: 0.1, borderRadius: '50%' }}></div>

                    <div className="row align-items-center position-relative">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '20px' }}>{t('common.newsletter_ready_to_learn')}</h2>
                            <p style={{ fontSize: '1.2rem', color: '#6d6d6d', marginBottom: '0', maxWidth: '400px' }}>{t('common.newsletter_desc')}</p>
                        </div>
                        <div className="col-lg-6">
                            <form style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }} onSubmit={(e) => e.preventDefault()}>
                                <input type="email" placeholder={t('common.newsletter_placeholder_email')} style={{ flex: 1, minWidth: '250px', padding: '16px 24px', border: '1px solid #eaeaea', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
                                <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                >
                                    {t('common.newsletter_subscribe')}
                                </button>
                            </form>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '15px' }}>{t('common.newsletter_terms')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
