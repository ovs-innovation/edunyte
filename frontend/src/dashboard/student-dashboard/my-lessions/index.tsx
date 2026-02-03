import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import MyLessionsArea from './MyLessionsArea'

const MyLessons = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <MyLessionsArea />
         </main>
         <FooterOne />
      </>
   )
}

export default MyLessons
