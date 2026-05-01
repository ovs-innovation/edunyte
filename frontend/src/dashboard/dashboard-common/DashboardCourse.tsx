import student_dashboard_data from "../../data/dashboard-data/StudentDashboardData"
import { Link } from "react-router-dom"

const DashboardCourse = () => {
   return (
      <div className="progress__courses-wrap mt-40">
         <div className="dashboard__content-title mb-30">
            <h4 className="title fw-900">In Progress Courses</h4>
         </div>
         <div className="row g-4">
            {student_dashboard_data.map((item) => (
               <div key={item.id} className="col-xl-4 col-md-6">
                  <div className="glass-panel h-100 shadow-sm overflow-hidden border-0 bg-white hover-scale">
                     <div className="position-relative">
                        <Link to="/course-details">
                           <img src={item.thumb} alt="img" className="w-100" style={{ height: '180px', objectFit: 'cover' }} />
                        </Link>
                        <div className="position-absolute top-0 start-0 m-3">
                           <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold">{item.tag}</span>
                        </div>
                     </div>
                     <div className="p-4">
                        <h5 className="title mb-3 fw-800" style={{ fontSize: '1.1rem' }}>
                           <Link to="/course-details" className="text-dark text-decoration-none">{item.title}</Link>
                        </h5>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                           <div className="author d-flex align-items-center gap-2">
                              <img src={item.avatar_thumb} alt="img" className="rounded-circle" style={{ width: '30px', height: '30px' }} />
                              <span className="small fw-bold opacity-70">{item.avatar_name}</span>
                           </div>
                           <div className="rating small">
                              <i className="fas fa-star text-warning"></i> {item.review}
                           </div>
                        </div>
                        <div className="progress-wrap">
                           <div className="d-flex justify-content-between mb-2">
                              <span className="small fw-bold opacity-50">COMPLETED</span>
                              <span className="small fw-bold text-primary">{item.progress}%</span>
                           </div>
                           <div className="progress" style={{ height: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }}>
                              <div className="progress-bar" style={{ width: `${item.progress}%`, background: 'var(--grad-primary)', borderRadius: '10px' }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default DashboardCourse
