import ContactForm from "../../../forms/ContactForm"
import { useTranslation } from "react-i18next";

const ContactArea = () => {
    const { t } = useTranslation();
    return (
        <section className="contact-area section-pt-120 section-pb-120 glow-bg">
            <div className="container">
                <div className="row g-4 justify-content-between">
                    <div className="col-lg-4">
                        <div className="glass-panel p-5 h-100 shadow-sm" style={{ border: '1px solid var(--glass-border)' }}>
                            <h3 className="title mb-4" style={{ fontWeight: 800, fontSize: '1.8rem' }}>Get in Touch</h3>
                            <p className="opacity-70 mb-40">Have questions about our platform? Our team is here to help you navigate your educational journey.</p>
                            
                            <div className="contact-info-list">
                                <div className="d-flex align-items-start gap-4 mb-30">
                                    <div className="icon-wrap d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', flexShrink: 0 }}>
                                        <i className="fas fa-user-graduate"></i>
                                    </div>
                                    <div className="content">
                                        <h5 className="mb-1" style={{ fontWeight: 700 }}>Student Support</h5>
                                        <a href="mailto:support@edunyte.com" className="text-primary fw-bold" style={{ textDecoration: 'none' }}>support@edunyte.com</a>
                                        <p className="small opacity-60 m-0 mt-1">24/7 Academic Assistance</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-4 mb-30">
                                    <div className="icon-wrap d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', flexShrink: 0 }}>
                                        <i className="fas fa-chalkboard-teacher"></i>
                                    </div>
                                    <div className="content">
                                        <h5 className="mb-1" style={{ fontWeight: 700 }}>Tutor Support</h5>
                                        <a href="mailto:careers@edunyte.com" className="text-primary fw-bold" style={{ textDecoration: 'none' }}>careers@edunyte.com</a>
                                        <p className="small opacity-60 m-0 mt-1">Join our expert faculty</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-4">
                                    <div className="icon-wrap d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', flexShrink: 0 }}>
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                    <div className="content">
                                        <h5 className="mb-1" style={{ fontWeight: 700 }}>Partnerships</h5>
                                        <a href="mailto:partnerships@edunyte.com" className="text-primary fw-bold" style={{ textDecoration: 'none' }}>partnerships@edunyte.com</a>
                                        <p className="small opacity-60 m-0 mt-1">Corporate & School Collabs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="glass-panel p-5 shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
                            <div className="section-title mb-40">
                                <h2 className="title" style={{ fontWeight: 900, fontSize: '2.2rem' }}>Send us a Message</h2>
                                <p className="opacity-70 mt-2">We typically respond within 2-4 hours during business days.</p>
                            </div>
                            <ContactForm />
                        </div>
                    </div>
                </div>

                <div className="contact-map mt-80 overflow-hidden shadow-sm" style={{ borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48409.69813174607!2d-74.05163325136718!3d40.68264649999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25bae694479a3%3A0xb9949385da52e69e!2sBarclays%20Center!5e0!3m2!1sen!2sbd!4v1684309529719!5m2!1sen!2sbd" 
                        style={{ border: '0', width: '100%', height: '450px', display: 'block' }} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </section>
    )
}

export default ContactArea
