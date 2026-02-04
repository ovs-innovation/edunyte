import { useStudentStats } from "../../../hooks/useStudentStats"
import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo"
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo"
import StudentHistoryContent from "./StudentHistoryContent"

const StudentHistoryArea = () => {
   const { totalLessons, completedLessons } = useStudentStats()
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBannerTwo totalLessons={totalLessons} completedLessons={completedLessons} />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebarTwo />
                  <StudentHistoryContent />
               </div>
            </div>
         </div>
      </section>
   )
}

export default StudentHistoryArea
