import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DataType {
   id: number;
   thumb: string
   title: string;
   designation: string;
   rating: string;
};

const Instructor = () => {
   const { t } = useTranslation();

   const instructor_data: DataType[] = [
      {
         id: 1,
         thumb: "/assets/img/instructor/instructor01.png",
         title: t('home.how_it_works.step1_title'),
         designation: t('home.how_it_works.step1_description'),
         rating: "(4.8 Ratings)"
      },
      {
         id: 2,
         thumb: "/assets/img/instructor/instructor02.png",
         title: t('home.how_it_works.step2_title'),
         designation: t('home.how_it_works.step2_description'),
         rating: "(4.8 Ratings)"
      },
      {
         id: 3,
         thumb: "/assets/img/instructor/instructor03.png",
         title: t('home.how_it_works.step3_title'),
         designation: t('home.how_it_works.step3_description'),
         rating: "(4.8 Ratings)"
      },
      {
         id: 4,
         thumb: "/assets/img/instructor/instructor04.png",
         title: t('home.how_it_works.step4_title'),
         designation: t('home.how_it_works.step4_description'),
         rating: "(4.8 Ratings)"
      },
   ];

   return (
      <section className="instructor__area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-xl-4 -mt-20">
                  <div className="instructor__content-wrap ">
                     <div className="section__title mb-15 ">
                        <span className="sub-title">{t('home.how_it_works.subtitle')}</span>
                        <h2 className="title">{t('home.how_it_works.title')}</h2>
                     </div>
                     <p>{t('home.how_it_works.description')}</p>
                  </div>
               </div>

               <div className="col-xl-8">
                  <div className="instructor__item-wrap">
                     <div className="row">
                        {instructor_data.map((item) => (
                           <div key={item.id} className="col-sm-6">
                              <div className="instructor__item">
                                 <div className="instructor__thumb">
                                    <Link to="/instructor-datails"><img src={item.thumb} alt="img" /></Link>
                                 </div>
                                 <div className="instructor__content">
                                    <h2 className="title"><Link to="/instructor-datails">{item.title}</Link></h2>
                                    <span className="designation">{item.designation}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Instructor
