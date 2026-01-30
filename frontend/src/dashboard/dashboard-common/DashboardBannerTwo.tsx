import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import BtnArrow from "../../svg/BtnArrow"
import InjectableSvg from "../../hooks/InjectableSvg"

interface DashboardBannerTwoProps {
  totalLessons?: number
  completedLessons?: number
}

const DashboardBannerTwo = ({ totalLessons = 0, completedLessons = 0 }: DashboardBannerTwoProps) => {
  const { user } = useAuth() as any

  const getStudentName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email?.split('@')[0] || 'Student'
  }

  const getProfilePicture = () => {
    if (user?.profilePicture) {
      return user.profilePicture
    }
    return "assets/img/courses/details_instructors02.jpg"
  }

  return (
    <div className="dashboard__top-wrap">
      <div className="dashboard__top-bg"></div>
      <div className="dashboard__instructor-info">
        <div className="dashboard__instructor-info-left">
          <div className="thumb">
            <img src={getProfilePicture()} alt={getStudentName()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="content">
            <h4 className="title">{getStudentName()}</h4>
            <ul className="list-wrap">
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'} Booked
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon05.svg" alt="img" className="injectable" />
                {completedLessons} Completed
              </li>
            </ul>
          </div>
        </div>
        <div className="dashboard__instructor-info-right">
          <Link to="/courses" className="btn btn-two arrow-btn">Book a Lesson <BtnArrow /></Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardBannerTwo

