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

  const getStudentName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email?.split('@')[0] || t('dashboard.student')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || 'S';
  }

  const getProfilePicture = () => {
    const photo = user?.photo || user?.profile?.photo || user?.avatar || user?.image;
    if (photo && typeof photo === 'string') {
      if (photo.startsWith('/uploads/')) {
        const origin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8096/api').replace(/\/api\/?$/, '');
        return `${origin}${photo}`;
      }
      return photo;
    }
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB.");
      return;
    }

    setUploading(true);

    try {
      const { uploadStudentPhoto } = await import("../../services/authService");
      const res = await uploadStudentPhoto(file);
      if (res.photo) {
        await updateUserProfile({ photo: res.photo });
      }
    } catch (err: any) {
      console.error("Upload failed", err);

      // Fallback: If backend endpoint fails, attempt Cloudinary if credentials are provided
      const cloudName = import.meta.env.VITE_APP_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;
      let fallbackSuccess = false;

      if (cloudName && uploadPreset) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);
          formData.append("folder", "student-profiles");
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.secure_url) {
            await updateUserProfile({ photo: data.secure_url });
            fallbackSuccess = true;
          }
        } catch (cErr) {
          console.error("Cloudinary fallback failed", cErr);
        }
      }

      if (!fallbackSuccess) {
        alert(err.message || "Failed to upload photo. Please try again.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
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
            {getProfilePicture() ? (
              <img
                src={getProfilePicture()!}
                alt={getStudentName()}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="default-avatar-placeholder"
              style={{
                display: getProfilePicture() ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
                letterSpacing: '1px',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                userSelect: 'none'
              }}
            >
              {getInitials(getStudentName())}
            </div>
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
