import DashboardBannerTwo from "../../dashboard-common/DashboardBannerTwo"
import DashboardSidebarTwo from "../../dashboard-common/DashboardSidebarTwo"
import StudentHistoryContent from "./StudentHistoryContent"

const StudentHistoryArea = () => {
   return (
      <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBannerTwo />
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
