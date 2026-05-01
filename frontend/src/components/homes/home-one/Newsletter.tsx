import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Newsletter = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            toast.success(t('common.newsletter_success') || "Subscribed successfully!", { position: 'top-center' });
            setEmail('');
        } else {
            toast.error("Please enter a valid email.", { position: 'top-center' });
        }
    };

    return (
        <section className="glow-bg" style={{ padding: '80px 0' }}>
            <div className="container position-relative z-1">
                <div className="glass-panel" style={{ padding: '60px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'var(--grad-primary)', opacity: 0.2, filter: 'blur(50px)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-80px', left: '10%', width: '200px', height: '200px', background: 'var(--neon-blue)', opacity: 0.15, filter: 'blur(50px)', borderRadius: '50%' }}></div>

                    <div className="row align-items-center position-relative z-1">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '20px', color: 'var(--text-primary)' }}>{t('common.newsletter_ready_to_learn')}</h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0', maxWidth: '400px' }}>{t('common.newsletter_desc')}</p>
                        </div>
                        <div className="col-lg-6">
                            <form style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }} onSubmit={handleSubmit}>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('common.newsletter_placeholder_email')} 
                                    style={{ flex: 1, minWidth: '250px', padding: '16px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                                />
                                <button type="submit" className="btn-neon-primary">
                                    {t('common.newsletter_subscribe')}
                                </button>
                            </form>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '15px' }}>{t('common.newsletter_terms')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
