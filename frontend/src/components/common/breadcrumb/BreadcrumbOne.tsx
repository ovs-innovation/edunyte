import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface BreadcrumbOneProps {
   title: string;
   sub_title: string;
   description?: string;
   image?: string | null | boolean;
   showImage?: boolean;
   hideImage?: boolean;
   overlayItems?: string[];
   features?: string[];
   sub_title_2?: string;
   style?: boolean;
   children?: React.ReactNode;
}

const BreadcrumbOne = ({ title, sub_title, description, image, showImage, hideImage, overlayItems, features, children }: BreadcrumbOneProps) => {
   const { t } = useTranslation();

   const isImageHidden = hideImage || showImage === false || image === null || image === false || image === "";
   const defaultImage = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=900";
   const heroImage = (typeof image === 'string' && image) ? image : defaultImage;

   const heroDescription = description === undefined ? "Empower your journey with our world-class resources. Connect with experts, expand your horizons, and achieve your learning goals." : description;
   const heroFeatures = features === undefined ? ["Expert-led guidance", "Interactive learning", "24/7 Support access"] : features;
   const heroOverlayItems = overlayItems === undefined ? ["Verified Instructors", "Global Community"] : overlayItems;

   return (
      <section
         className="breadcrumb__area position-relative overflow-hidden"
         style={{
            background: '#F8FAFF',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            padding: '60px 0 60px',
         }}
      >
         {/* Soft background blobs */}
         <div className="position-absolute" style={{
            top: '-80px', right: '-80px', width: '450px', height: '450px',
            background: 'radial-gradient(circle, rgba(87,81,225,0.07) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(50px)', zIndex: 0,
         }} />
         <div className="position-absolute" style={{
            bottom: '-120px', left: '-60px', width: '350px', height: '350px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)', zIndex: 0,
         }} />

         <div className="container position-relative" style={{ zIndex: 1 }}>
            <div className="row align-items-center g-5">

               {/* ── LEFT: Text Content ── */}
               <div className={isImageHidden ? "col-lg-10 col-xl-9" : "col-lg-6"}>
                  {/* Breadcrumb pill */}
                  <nav className="mb-4">
                     <div className="d-inline-flex align-items-center gap-2 px-4 py-2 bg-white shadow-sm rounded-pill border">
                        <Link to="/" className="small fw-bold text-muted text-decoration-none" style={{ transition: 'color .2s' }}
                           onMouseEnter={e => (e.currentTarget.style.color = '#5751E1')}
                           onMouseLeave={e => (e.currentTarget.style.color = '')}
                        >{t('common.home')}</Link>
                        <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.65rem', opacity: 0.4 }} />
                        <span className="small fw-bold" style={{ color: '#5751E1' }}>{sub_title}</span>
                     </div>
                  </nav>

                  {/* Title */}
                  <h1 className="fw-900 mb-3" style={{
                     fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                     color: '#1B1B1B',
                     lineHeight: 1.1,
                     letterSpacing: '-0.02em',
                  }}>
                     {title}
                  </h1>

                  {/* Description */}
                  {heroDescription && (
                     <p className="text-muted mb-0" style={{ maxWidth: isImageHidden ? '720px' : '520px', fontSize: '1.1rem', lineHeight: 1.7 }}>
                        {heroDescription}
                     </p>
                  )}

                  {/* Feature pills */}
                  {heroFeatures && heroFeatures.length > 0 && (
                     <div className="d-flex flex-wrap gap-2 mt-4">
                        {heroFeatures.map((f, i) => (
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
                  )}

                  {children && <div className="mt-4">{children}</div>}
               </div>

               {/* ── RIGHT: Image Block ── */}
               {!isImageHidden && (
                  <div className="col-lg-6 mt-5 mt-lg-0">
                     <div className="position-relative" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        {/* Main Image */}
                        <img
                           src={heroImage}
                           alt={title}
                           style={{
                              width: '100%',
                              minHeight: '180px',
                              maxHeight: '280px',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: '20px',
                           }}
                        />

                        {/* Gradient Overlay — blends bottom for legibility */}
                        <div style={{
                           position: 'absolute', inset: 0,
                           background: 'linear-gradient(to top, rgba(10,10,40,0.65) 0%, rgba(10,10,40,0.1) 55%, transparent 100%)',
                           borderRadius: '20px',
                        }} />

                        {/* Overlay content bottom-left */}
                        {heroOverlayItems && heroOverlayItems.length > 0 && (
                           <div style={{
                              position: 'absolute', bottom: '24px', left: '24px',
                              display: 'flex', flexDirection: 'column', gap: '8px',
                           }}>
                              {heroOverlayItems.map((item, i) => (
                                 <div key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    padding: '6px 14px',
                                 }}>
                                    <i className="fas fa-check-circle" style={{ color: '#7EE8A2', fontSize: '0.85rem' }} />
                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{item}</span>
                                 </div>
                              ))}
                           </div>
                        )}

                        {/* Top-right subtle badge */}
                        <div style={{
                           position: 'absolute', top: '16px', right: '16px',
                           background: 'rgba(255,255,255,0.15)',
                           backdropFilter: 'blur(10px)',
                           border: '1px solid rgba(255,255,255,0.25)',
                           borderRadius: '50px',
                           padding: '6px 14px',
                           display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7EE8A2', display: 'inline-block' }} />
                           <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>Edunyte Platform</span>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </section>
   )
}

export default BreadcrumbOne
