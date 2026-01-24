import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import CourseDetailsArea from "./CourseDetailsArea";
import { fetchCourse } from "../../../services/courseService";
import { useTranslation } from "react-i18next";

const CourseDetails = () => {
   const { slug } = useParams<{ slug: string }>();
   const { t } = useTranslation();
   const [course, setCourse] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadCourse = async () => {
         if (!slug) return;
         try {
            setLoading(true);
            const response = await fetchCourse(slug);
            setCourse(response.course);
         } catch (error) {
            console.error("Failed to load course:", error);
         } finally {
            setLoading(false);
         }
      };
      loadCourse();
   }, [slug]);

   if (loading) {
      return (
         <>
            <HeaderOne />
            <main className="main-area fix">
               <div className="container">
                  <div className="row justify-content-center">
                     <div className="col-12 text-center">
                        <p>{t('common.loading')}</p>
                     </div>
                  </div>
               </div>
            </main>
            <FooterOne style={false} style_2={true} />
         </>
      );
   }

   if (!course) {
      return (
         <>
            <HeaderOne />
            <main className="main-area fix">
               <div className="container">
                  <div className="row justify-content-center">
                     <div className="col-12 text-center">
                        <p>{t('common.course_not_found')}</p>
                     </div>
                  </div>
               </div>
            </main>
            <FooterOne style={false} style_2={true} />
         </>
      );
   }

   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <CourseDetailsArea single_course={course} />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   );
};

export default CourseDetails;
