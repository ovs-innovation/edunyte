import faq_data from "../../../data/home-data/FaqData";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Static FAQ content (avoids broken i18n keys) ───────────────────────────
const STATIC_FAQS = {
  general: [
    {
      id: 1,
      q: "What is Edunyte?",
      a: "Edunyte is an online learning platform that connects students with expert tutors. You can find the right tutor, book a session, and learn through live one-on-one classes.",
    },
    {
      id: 2,
      q: "How does the platform work?",
      a: "Simply sign up, browse verified tutors by subject or price, book a session at a time that suits you, and join the live class directly from your browser — no downloads needed.",
    },
    {
      id: 3,
      q: "Are the tutors verified?",
      a: "Yes. Every tutor on Edunyte goes through an identity and credential verification process before their profile becomes publicly visible.",
    },
    {
      id: 4,
      q: "How do I book a lesson?",
      a: "Go to the tutor's profile, pick an available time slot on their calendar, choose your session duration, and confirm your booking. You'll receive a confirmation email instantly.",
    },
    {
      id: 5,
      q: "Can I reschedule or cancel a session?",
      a: "Yes. You can reschedule or cancel a session up to 24 hours before the start time from your dashboard, free of charge.",
    },
    {
      id: 6,
      q: "What payment methods are available?",
      a: "We accept all major credit/debit cards, PayPal, and several regional payment options. All transactions are secured with industry-standard encryption.",
    },
  ],
  student: [
    {
      id: 10,
      q: "How do I find the right tutor for me?",
      a: "Use our smart search to filter by subject, language, availability, rating, and price. You can also read student reviews to help you decide.",
    },
    {
      id: 11,
      q: "What if I'm not happy with my first session?",
      a: "We offer a satisfaction guarantee on your first session. If you're not satisfied, contact support within 24 hours and we will arrange a full refund or a free replacement session.",
    },
    {
      id: 12,
      q: "Can I take a trial lesson before committing?",
      a: "Many tutors offer a discounted or free trial lesson. Look for the 'Trial Available' badge on tutor profiles.",
    },
    {
      id: 13,
      q: "How do I access my session recordings?",
      a: "If your tutor enables recording, the session replay will be available in your dashboard under 'My Sessions' within 1–2 hours of the class ending.",
    },
  ],
  tutor: [
    {
      id: 20,
      q: "How can I become a tutor on Edunyte?",
      a: "Click 'Become a Tutor', fill in your profile, upload your credentials, and submit for review. Our team typically responds within 2–3 business days.",
    },
    {
      id: 21,
      q: "How and when do tutors get paid?",
      a: "Earnings are transferred to your registered bank account or PayPal every Monday for the previous week's completed sessions, after the platform fee is deducted.",
    },
    {
      id: 22,
      q: "Can I manage my availability as a tutor?",
      a: "Yes. Your tutor dashboard has a full calendar where you can set recurring availability, block dates, and adjust your schedule at any time.",
    },
    {
      id: 23,
      q: "What is the platform's commission rate?",
      a: "Edunyte charges a 15 % service fee on each completed session. There are no monthly fees or hidden charges — you only pay when you earn.",
    },
  ],
};

type Category = "general" | "student" | "tutor";

const TABS: { id: Category; label: string; icon: string }[] = [
  { id: "general", label: "General Questions", icon: "fas fa-th-large" },
  { id: "student", label: "For Students",      icon: "fas fa-user-graduate" },
  { id: "tutor",   label: "For Tutors",         icon: "fas fa-user-tie" },
];

const THEME = "#5751e1";

const FaqArea = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("general");
  const [openId, setOpenId] = useState<number | null>(1);

  const items = STATIC_FAQS[activeCategory];

  return (
    <div style={{ background: "#fff" }}>
      {/* ================================================================
          SECTION 1 – HERO
      ================================================================ */}
      <section
        style={{
          background: "linear-gradient(150deg,#eef1ff 0%,#f6f8ff 55%,#fff 100%)",
          padding: "88px 0 72px",
        }}
      >
        <div className="container">
          <div className="row align-items-center g-5">
            {/* ── Left copy ── */}
            <div className="col-lg-6">
              <span
                style={{
                  display: "block",
                  color: THEME,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Support &amp; Help Center
              </span>

              <h1
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(2.2rem,4vw,3.6rem)",
                  lineHeight: 1.18,
                  color: "#111",
                  marginBottom: 20,
                }}
              >
                How can we <br />
                <span
                  style={{
                    background: `linear-gradient(90deg,${THEME} 0%,#a78bfa 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  help you?
                </span>
              </h1>

              <p style={{ color: "#6c757d", fontSize: "1.02rem", maxWidth: 460, marginBottom: 20 }}>
                Find answers to common questions about learning, tutors, and bookings.
              </p>

              {/* Feature pills */}
              <div className="d-flex flex-wrap gap-2 mt-4">
                {['24/7 Support', 'Comprehensive Guides', 'Fast Resolutions'].map((f, i) => (
                  <span key={i} className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 small fw-bold" style={{
                    background: 'rgba(87,81,225,0.06)',
                    border: '1px solid rgba(87,81,225,0.12)',
                    color: '#3d3a7a',
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#5751E1', fontSize: '0.85rem' }} />
                    {f}
                  </span>
                ))}
              </div>

              <p style={{ color: "#adb5bd", fontSize: "0.85rem", marginBottom: 0, marginTop: 16 }}>
                Browse common questions below
              </p>

            </div>

            {/* ── Right – image block ── */}
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=900"
                  alt="Students learning"
                  style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(10,10,40,0.7) 0%, rgba(10,10,40,0.1) 55%, transparent 100%)',
                }} />
                {/* Overlay badges */}
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['1-on-1 Learning Sessions', 'Verified Expert Tutors', 'Flexible Scheduling'].map((item, i) => (
                    <div key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px 14px',
                    }}>
                      <i className="fas fa-check-circle" style={{ color: '#7EE8A2', fontSize: '0.85rem' }} />
                      <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{item}</span>
                    </div>
                  ))}
                </div>
                {/* Top badge */}
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50px',
                  padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7EE8A2', display: 'inline-block' }} />
                  <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>Support Center</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 – CATEGORY TABS  (normal flow, no overlap)
      ================================================================ */}
      <section style={{ background: "#fff", padding: "40px 0 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              background: "#fff",
              border: "1.5px solid #e8eaf0",
              borderRadius: 16,
              padding: "14px 20px",
              boxShadow: "0 4px 20px rgba(0,0,0,.05)",
            }}
          >
            {TABS.map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setOpenId(STATIC_FAQS[tab.id][0]?.id ?? null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 24px",
                    fontWeight: 700,
                    fontSize: "0.93rem",
                    cursor: "pointer",
                    minWidth: 190,
                    justifyContent: "center",
                    transition: "all .22s ease",
                    background: active
                      ? `linear-gradient(135deg,${THEME} 0%,#7c77f0 100%)`
                      : "#f6f7fb",
                    color: active ? "#fff" : "#6c757d",
                    boxShadow: active ? "0 6px 18px rgba(87,81,225,.28)" : "none",
                  }}
                >
                  <i className={tab.icon} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3 – FAQ ACCORDION
      ================================================================ */}
      <section style={{ padding: "48px 0 64px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9 col-xl-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  {items.length > 0 ? (
                    items.map((item) => {
                      const isOpen = openId === item.id;
                      return (
                        <div
                          key={item.id}
                          style={{
                            marginBottom: 14,
                            background: "#fff",
                            border: isOpen
                              ? `1.5px solid ${THEME}33`
                              : "1.5px solid #ebebf0",
                            borderRadius: 14,
                            boxShadow: isOpen
                              ? "0 4px 20px rgba(87,81,225,.10)"
                              : "0 2px 8px rgba(0,0,0,.04)",
                            overflow: "hidden",
                            transition: "border .2s,box-shadow .2s",
                          }}
                        >
                          {/* Question row */}
                          <button
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "18px 22px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              outline: "none",
                            }}
                          >
                            {/* Circle ? icon */}
                            <span
                              style={{
                                flexShrink: 0,
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: isOpen ? THEME : "#eef0fb",
                                color: isOpen ? "#fff" : THEME,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.78rem",
                                fontWeight: 800,
                                transition: "background .2s,color .2s",
                              }}
                            >
                              <i className="fas fa-question" />
                            </span>

                            <span
                              style={{
                                flex: 1,
                                fontWeight: 700,
                                color: "#1a1a2e",
                                fontSize: "0.97rem",
                                lineHeight: 1.45,
                              }}
                            >
                              {item.q}
                            </span>

                            <span
                              style={{
                                flexShrink: 0,
                                color: isOpen ? THEME : "#b0b4c0",
                                fontSize: "1.25rem",
                                transition: "color .2s",
                              }}
                            >
                              <i
                                className={
                                  isOpen ? "fas fa-minus-circle" : "fas fa-plus-circle"
                                }
                              />
                            </span>
                          </button>

                          {/* Answer */}
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.26 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div
                                  style={{
                                    margin: "0 22px 18px",
                                    background: "#f4f6ff",
                                    borderRadius: 10,
                                    padding: "16px 20px",
                                    color: "#5a5e75",
                                    fontSize: "0.93rem",
                                    lineHeight: 1.78,
                                  }}
                                >
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                      <i
                        className="fas fa-search"
                        style={{ fontSize: "2.5rem", marginBottom: 16, display: "block" }}
                      />
                      No questions found. Try a different keyword.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4 – STILL NEED HELP
      ================================================================ */}
      <section
        style={{
          background: "#f8f9ff",
          padding: "72px 0 88px",
          borderTop: "1px solid #eaecf5",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontWeight: 900,
                fontSize: "2rem",
                color: "#111",
                marginBottom: 10,
              }}
            >
              Still need help?
            </h2>
            <p style={{ color: "#6c757d", fontSize: "1rem" }}>
              Our support team is here for you.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Live Chat */}
            <div className="col-md-5">
              <SupportCard
                icon="fas fa-headset"
                iconBg="rgba(87,81,225,.12)"
                iconColor={THEME}
                title="Live Chat Support"
                desc="Chat with our support team in real-time and get instant assistance."
                btnLabel="Start Live Chat"
                btnColor={THEME}
                href="/contact"
              />
            </div>

            {/* Email */}
            <div className="col-md-5">
              <SupportCard
                icon="fas fa-envelope"
                iconBg="rgba(59,130,246,.12)"
                iconColor="#3b82f6"
                title="Email Support"
                desc="Prefer email? Send us your query and we'll get back to you within 24 hours."
                btnLabel="Send Email"
                btnColor="#3b82f6"
                href="mailto:support@edunyte.com"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─── Support Card sub-component ─────────────────────────────────────────── */
interface SupportCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  btnLabel: string;
  btnColor: string;
  href: string;
}

const SupportCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  btnLabel,
  btnColor,
  href,
}: SupportCardProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1.5px solid #eaecf5",
        borderRadius: 20,
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        height: "100%",
        transition: "transform .25s, box-shadow .25s",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,.10)"
          : "0 4px 16px rgba(0,0,0,.05)",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <i className={icon} style={{ fontSize: "2.2rem", color: iconColor }} />
      </div>

      <h4
        style={{ fontWeight: 800, color: "#111", fontSize: "1.1rem", marginBottom: 12 }}
      >
        {title}
      </h4>

      <p
        style={{
          color: "#6c757d",
          fontSize: "0.92rem",
          lineHeight: 1.65,
          marginBottom: 28,
          flex: 1,
        }}
      >
        {desc}
      </p>

      <a
        href={href}
        style={{
          background: btnColor,
          color: "#fff",
          border: "none",
          borderRadius: 50,
          padding: "11px 30px",
          fontWeight: 700,
          fontSize: "0.9rem",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {btnLabel} <i className="fas fa-arrow-right" style={{ fontSize: "0.75rem" }} />
      </a>
    </div>
  );
};

export default FaqArea;
