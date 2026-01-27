import { useState } from "react";
import { Link } from "react-router-dom";
import VideoPopup from "../../../modals/VideoPopup";
import BtnArrow from "../../../svg/BtnArrow";
import { useTranslation } from "react-i18next";

const About = () => {

  const { t } = useTranslation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section className="about-area tg-motion-effects section-py-120">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 col-md-9">
              <div className="about__images">
                <img src="/assets/img/others/about_img.png" alt="img" className="main-img" />
                <img src="/assets/img/others/about_shape.svg" alt="img" className="shape alltuchtopdown" />
                <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="popup-video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28" fill="none">
                    <path d="M0.19043 26.3132V1.69421C0.190288 1.40603 0.245303 1.12259 0.350273 0.870694C0.455242 0.6188 0.606687 0.406797 0.79027 0.254768C0.973854 0.10274 1.1835 0.0157243 1.39936 0.00193865C1.61521 -0.011847 1.83014 0.0480663 2.02378 0.176003L20.4856 12.3292C20.6973 12.4694 20.8754 12.6856 20.9999 12.9535C21.1245 13.2214 21.1904 13.5304 21.1904 13.8456C21.1904 14.1608 21.1245 14.4697 20.9999 14.7376C20.8754 15.0055 20.6973 15.2217 20.4856 15.3619L2.02378 27.824C1.83056 27.9517 1.61615 28.0116 1.40076 27.9981C1.18536 27.9847 0.97607 27.8983 0.792638 27.7472C0.609205 27.596 0.457661 27.385 0.352299 27.1342C0.246938 26.8833 0.191236 26.6008 0.19043 26.3132Z" fill="currentcolor" />
                  </svg>
                </a>
                <div className="about__enrolled" data-aos="fade-right" data-aos-delay="200">
                  <p className="title"><span>36K+</span> {t('about.enrolled_students')}</p>
                  <img src="/assets/img/others/student_grp.png" alt="img" />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about__content">
                <div className="section__title">
                  <span className="sub-title">{t('about.get_more_about_us')}</span>
                  <h2 className="title">
                    {t('about.thousand_of_top')}
                  </h2>
                </div>
                <p className="desc">{t('about.desc')}</p>
                <ul className="about__info-list list-wrap">
                  <li className="about__info-list-item">
                    <i className="flaticon-angle-right"></i>
                    <p className="content">{t('about.world_class_instructors')}</p>
                  </li>
                  <li className="about__info-list-item">
                    <i className="flaticon-angle-right"></i>
                    <p className="content">{t('about.access_class_anywhere')}</p>
                  </li>
                  <li className="about__info-list-item">
                    <i className="flaticon-angle-right"></i>
                    <p className="content">{t('about.flexible_course_plan')}</p>
                  </li>
                </ul>
                <div className="tg-button-wrap">
                  <Link to="/about-us" className="btn arrow-btn">{t('about.start_free_trial')} <BtnArrow /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* video modal start */}
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={"Ml4XCF-JS0k"}
      />
      {/* video modal end */}
    </>
  )
}

export default About
