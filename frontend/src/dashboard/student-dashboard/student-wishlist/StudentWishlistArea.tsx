import { useStudentStats } from "../../../hooks/useStudentStats"
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo"
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo"
import StudentWishlistContent from "./StudentWishlistContent"

const StudentWishlistArea = () => {
   const { totalLessons, completedLessons } = useStudentStats()
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBannerTwo totalLessons={totalLessons} completedLessons={completedLessons} />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebarTwo />
                  <StudentWishlistContent />
               </div>
            </div>
         </div>
      </section>
   )
}

export default StudentWishlistArea
