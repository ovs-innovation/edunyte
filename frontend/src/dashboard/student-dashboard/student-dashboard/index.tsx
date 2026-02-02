import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import StudentDashboardArea from './StudentDashboardArea'
import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'



const StudentDashboard = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <StudentDashboardArea />
         </main>
         <FooterOne />
      </>
   )
}

export default StudentDashboard
