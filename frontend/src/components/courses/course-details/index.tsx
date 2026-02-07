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

const CourseSkeleton = () => (
   <>
      <HeaderOne />
      <main className="main-area fix">
         <section className="courses__details-area pt-100 pb-100">
            <div className="container">
               {/* Top section mock */}
               <div className="row mb-4">
                  <div className="col-12">
                     <div className="bg-secondary rounded mb-2 placeholder-glow" style={{ height: '20px', width: '200px', opacity: 0.2 }}></div>
                     <div className="bg-secondary rounded placeholder-glow" style={{ height: '40px', width: '400px', opacity: 0.2 }}></div>
                  </div>
               </div>

               <div className="row g-4">
                  {/* Left column (teachers) */}
                  <div className="col-lg-8">
                     {/* Filter mockup */}
                     <div className="bg-secondary rounded mb-4 placeholder-glow" style={{ height: '60px', width: '100%', opacity: 0.1 }}></div>

                     {/* Teacher cards */}
                     {[1, 2, 3].map((item) => (
                        <div key={item} className="card border rounded p-4 mb-3 border-0 shadow-sm">
                           <div className="d-flex gap-4 align-items-start">
                              {/* Avatar */}
                              <div className="bg-secondary rounded-circle placeholder-glow" style={{ width: '80px', height: '80px', opacity: 0.2, flexShrink: 0 }}></div>
                              <div className="flex-grow-1 w-100">
                                 {/* Name */}
                                 <div className="bg-secondary rounded mb-2 placeholder-glow" style={{ height: '24px', width: '40%', opacity: 0.2 }}></div>
                                 {/* Badges */}
                                 <div className="d-flex gap-2 mb-3">
                                    <div className="bg-secondary rounded placeholder-glow" style={{ height: '20px', width: '80px', opacity: 0.2 }}></div>
                                    <div className="bg-secondary rounded placeholder-glow" style={{ height: '20px', width: '80px', opacity: 0.2 }}></div>
                                 </div>
                                 {/* Bio */}
                                 <div className="d-flex flex-column gap-2 w-100">
                                    <div className="bg-secondary rounded placeholder-glow" style={{ height: '14px', width: '95%', opacity: 0.2 }}></div>
                                    <div className="bg-secondary rounded placeholder-glow" style={{ height: '14px', width: '85%', opacity: 0.2 }}></div>
                                    <div className="bg-secondary rounded placeholder-glow" style={{ height: '14px', width: '60%', opacity: 0.2 }}></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                  {/* Right column (sidebar) */}
                  <div className="col-lg-4">
                     <div className="bg-secondary rounded placeholder-glow" style={{ height: '250px', width: '100%', opacity: 0.2 }}></div>
                  </div>
               </div>
            </div>
         </section>
      </main>
      <FooterOne style={false} style_2={true} />
   </>
);

   if (loading) {
      return <CourseSkeleton />;
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
         <main >
            <CourseDetailsArea />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   );
};

export default CourseDetails;
