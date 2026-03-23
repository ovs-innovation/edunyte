import { Link } from "react-router-dom";
import InjectableSvg from "../../../hooks/InjectableSvg";
import SvgAnimation from "../../../hooks/SvgAnimation";
import BtnArrow from "../../../svg/BtnArrow";
import { useTranslation } from "react-i18next";

interface InstructorTwoProps {
   style: boolean;
}

const InstructorTwo = ({ style }: InstructorTwoProps) => {
   const { t } = useTranslation();

   const svgIconRef = SvgAnimation('/assets/img/instructor/instructor_shape02.svg');
   const svgIconRef2 = SvgAnimation('/assets/img/instructor/instructor_shape02.svg');

   return (
      <section className={`${style ? "instructor__area-four" : ""}`}>
         <div className="container">
            <div className="instructor__item-wrap-two">
               <div className="row mt-4">
                  <div className="col-xl-6">
                     <div className="instructor__item-two tg-svg" ref={svgIconRef}>
                        <div className="instructor__thumb-two">
                           <img src="/assets/img/instructor/instructor_two01.png" alt="img" />
                           <div className="shape-one">
                              <InjectableSvg src="/assets/img/instructor/instructor_shape01.svg" alt="img" className="injectable" />
                           </div>
                           <div className="shape-two">
                              <span className="svg-icon"></span>
                           </div>
                        </div>
                        <div className="instructor__content-two">
                           <h3 className="title"><Link to="/contact">{t('home.join_section.join_as_instructor_title')}</Link></h3>
                           <p>{t('home.join_section.join_as_instructor_description')}</p>
                           <div className="tg-button-wrap">
                              <Link to="/instructor" className="btn arrow-btn">{t('home.join_section.apply_now')} <BtnArrow /></Link>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="col-xl-6">
                     <div className="instructor__item-two tg-svg" ref={svgIconRef2}>
                        <div className="instructor__thumb-two">
                           <img src="/assets/img/instructor/instructor_two02.png" alt="img" />
                           <div className="shape-one">
                              <InjectableSvg src="/assets/img/instructor/instructor_shape01.svg" alt="img" className="injectable" />
                           </div>
                           <div className="shape-two">
                              <span className="svg-icon"></span>
                           </div>
                        </div>
                        <div className="instructor__content-two">
                           <h3 className="title"><Link to="/contact">{t('home.join_section.join_as_student_title')}</Link></h3>
                           <p>{t('home.join_section.join_as_student_description')}</p>
                           <div className="tg-button-wrap">
                              <Link to="/registration" className="btn arrow-btn">{t('home.join_section.apply_now')} <BtnArrow /></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default InstructorTwo
