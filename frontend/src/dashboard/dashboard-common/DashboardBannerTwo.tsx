import { Link } from "react-router-dom"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import BtnArrow from "../../svg/BtnArrow"
import InjectableSvg from "../../hooks/InjectableSvg"

interface DashboardBannerTwoProps {
  totalLessons?: number
  completedLessons?: number
}

const DashboardBannerTwo = ({ totalLessons = 0, completedLessons = 0 }: DashboardBannerTwoProps) => {

  const { user, updateUserProfile } = useAuth() as any
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)

  console.log("user", user)

  const getStudentName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email?.split('@')[0] || t('dashboard.student')
  }

  const getProfilePicture = () => {
    if (user?.photo) return user.photo;
    return "assets/img/courses/details_instructors02.jpg"
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cloudinary generic upload
    const cloudName = import.meta.env.VITE_APP_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary config missing");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "student-profiles");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        await updateUserProfile({ photo: data.secure_url });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard__top-wrap">
      <div
        className="dashboard__top-bg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="dashboard__instructor-info">
        <div className="dashboard__instructor-info-left">
          <div className="thumb" style={{ position: 'relative' }}>
            <img src={getProfilePicture()} alt={getStudentName()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <label
              htmlFor="profile-upload"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {uploading ? (
                <div className="spinner-border text-primary" role="status" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <i className="fas fa-camera text-primary" style={{ fontSize: '14px' }}></i>
              )}
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          <div className="content">
            <h4 className="title">{getStudentName()}</h4>
            <ul className="list-wrap">
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon03.svg" alt="img" className="injectable" />
                {totalLessons} {t('dashboard.lesson_booked')}
              </li>
              <li>
                <InjectableSvg src="/assets/img/icons/course_icon05.svg" alt="img" className="injectable" />
                {completedLessons} {t('dashboard.completed')}
              </li>
            </ul>
          </div>
        </div>
        <div className="dashboard__instructor-info-right">
          <Link to="/courses" className="btn btn-two arrow-btn">{t('dashboard.book_lesson')} <BtnArrow /></Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardBannerTwo

