import { Link } from "react-router-dom"
import MobileMenu from "./MobileMenu"
import LanguageCurrencySwitcher from "../../../components/common/LanguageCurrencySwitcher"
import { useAuth } from "../../../contexts/AuthContext"
import { useTranslation } from "react-i18next"

interface MobileSidebarProps {
   isActive: boolean;
   setIsActive: (isActive: boolean) => void;
}
const MobileSidebar = ({ isActive, setIsActive }: MobileSidebarProps) => {
   const { isAuthenticated, user, logout } = useAuth()
   const { t } = useTranslation()

   return (
      <div className={isActive ? "mobile-menu-visible" : ""}>
         <div className="tgmobile__menu">
            <nav className="tgmobile__menu-box">
               <div onClick={() => setIsActive(false)} className="close-btn"><i className="tg-flaticon-close-1"></i></div>
               <div className="nav-logo">
                  <Link to="/"><img src="/assets/img/logo/edunyte-light.png" height="100" width="100" alt="Logo" /></Link>
               </div>
               <div className="tgmobile__search">
                  <form onSubmit={(e) => e.preventDefault()}>
                     <input type="text" placeholder="Search here..." />
                     <button><i className="fas fa-search"></i></button>
                  </form>
               </div>
               <div className="tgmobile__language-currency">
                  <LanguageCurrencySwitcher />
               </div>
               <div className="tgmobile__menu-outer">
                  <MobileMenu />
               </div>
               {isAuthenticated ? (
                  <div className="mobile-auth-section">
                     <div className="mobile-user-info">
                        <p className="user-name">{user?.name || t("common.my_account")}</p>
                        <p className="user-email">{user?.email}</p>
                     </div>
                     <div className="mobile-auth-buttons">
                        <Link to="/student-dashboard" className="btn" onClick={() => setIsActive(false)}>
                           {t("common.dashboard")}
                        </Link>
                        <button onClick={() => { logout(); setIsActive(false); }} className="btn btn-outline">
                           {t("common.logout")}
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="mobile-auth-section">
                     <Link to="/login" className="btn" onClick={() => setIsActive(false)}>
                        {t("common.login")}
                     </Link>
                     <Link to="/registration" className="btn btn-outline" onClick={() => setIsActive(false)}>
                        {t("common.sign_up")}
                     </Link>
                  </div>
               )}
               <div className="social-links">
                  <ul className="list-wrap">
                     <li><Link to="#"><i className="fab fa-facebook-f"></i></Link></li>
                     <li><Link to="#"><i className="fab fa-twitter"></i></Link></li>
                     <li><Link to="#"><i className="fab fa-instagram"></i></Link></li>
                     <li><Link to="#"><i className="fab fa-linkedin-in"></i></Link></li>
                     <li><Link to="#"><i className="fab fa-youtube"></i></Link></li>
                  </ul>
               </div>
            </nav>
         </div>
         <div className="tgmobile__menu-backdrop"></div>
      </div>
   )
}

export default MobileSidebar
