import { Link } from "react-router-dom"
import BtnArrow from "../../svg/BtnArrow"
import { useAuth } from "../../contexts/AuthContext"

const DashboardBanner = ({ style }: any) => {
    const { user } = useAuth() as any;
    const photo = user?.photo || user?.profile?.photo || user?.avatar || user?.image;
    const name = user?.name || (style ? "Instructor" : "Teacher");

    const getInitials = (n: string) => {
        return n
            .split(' ')
            .filter(Boolean)
            .map((part: string) => part[0]?.toUpperCase())
            .slice(0, 2)
            .join('') || 'T';
    };

    return (
        <div className="dashboard__top-wrap">
            <div className="dashboard__top-bg" style={{ backgroundImage: `url(/assets/img/bg/instructor_dashboard_bg.jpg)` }}></div>
            <div className="dashboard__instructor-info">
                <div className="dashboard__instructor-info-left">
                    <div className="thumb">
                        {photo ? (
                            <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '36px',
                                    fontWeight: 700,
                                    border: '3px solid #ffffff'
                                }}
                            >
                                {getInitials(name)}
                            </div>
                        )}
                    </div>
                    <div className="content">
                        <h4 className="title">{name}</h4>
                        <div className="review__wrap review__wrap-two">
                            <div className="rating">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                            <span>(15 Reviews)</span>
                        </div>
                    </div>
                </div>
                <div className="dashboard__instructor-info-right">
                    <Link to="#" className="btn btn-two arrow-btn">Create a New Course <BtnArrow /></Link>
                </div>
            </div>
        </div>
    )
}

export default DashboardBanner
