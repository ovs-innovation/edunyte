// import HeaderTopOne from "./menu/HeaderTopOne"
import NavMenu from "./menu/NavMenu"
import React, { useState } from "react"
import MobileSidebar from "./menu/MobileSidebar"
import UseSticky from "../../hooks/UseSticky"
import { Link } from "react-router-dom"
import InjectableSvg from "../../hooks/InjectableSvg"
import CustomSelect from "../../ui/CustomSelect"
import TotalWishlist from "../../components/common/TotalWishlist"
import LanguageCurrencySwitcher from "../../components/common/LanguageCurrencySwitcher"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const HeaderOne = () => {

   const [selectedOption, setSelectedOption] = React.useState(null);

   const handleSelectChange = (option: React.SetStateAction<null>) => {
      setSelectedOption(option);
   };

   const { sticky } = UseSticky();
   const [isActive, setIsActive] = useState<boolean>(false);
   const { t } = useTranslation();
   const { isAuthenticated, user, logout } = useAuth();
   const navigate = useNavigate();

   const handleUserClick = (e: React.MouseEvent) => {
      if (!isAuthenticated) {
         e.preventDefault();
         navigate('/login');
      }
   };



   const getUserAvatar = () => {
      // if (user?.photo || user?.avatar || user?.image) {
      //    return user.photo || user.avatar || user.image;
      // }
      return null;
   };

   const renderAvatar = () => {
      const avatarUrl = getUserAvatar();

      if (avatarUrl) {
         return (
            <img
               src={avatarUrl}
               alt={user?.name || 'User'}
               style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
               }}
               onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
               }}
            />
         );
      }

      return (
         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InjectableSvg src="/assets/img/icons/user.svg" alt="User" className="injectable" />
         </div>
      );
   };

   return (
      <>
         <header>
            {/* <HeaderTopOne style={false} /> */}
            <div id="header-fixed-height" className={`${sticky ? "active-height" : ""}`}></div>
            <div id="sticky-header" className={`tg-header__area ${sticky ? "sticky-menu" : ""}`} style={{ zIndex: 99999999 }}>
               <div className="container custom-container">
                  <div className="row">
                     <div className="col-12">
                        <div className="tgmenu__wrap">
                           <nav className="tgmenu__nav">
                              <div className="logo">
                                 <Link to="/">
                                    <img src="/logo.png" alt="Edunyte logo" style={{ height: '90px', width: 'auto', objectFit: 'contain', filter: 'brightness(1) contrast(1.9)',  transform: "scale(1.15)",  }} />
                                 </Link>
                              </div>
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                 <NavMenu />
                              </div>
                              <div className="tgmenu__search d-none d-md-block">
                                 <CustomSelect value={selectedOption} onChange={handleSelectChange} />
                              </div>
                              <div className="tgmenu__action">
                                 <ul className="list-wrap">
                                    <li>
                                       <LanguageCurrencySwitcher />
                                    </li>
                                    <li className="wishlist-icon">
                                       <Link
                                          to="/my-wishlist"
                                          className="cart-count"
                                          onClick={(e) => {
                                             if (!isAuthenticated) {
                                                e.preventDefault();
                                                navigate('/login');
                                             }
                                          }}
                                       >
                                          <InjectableSvg src="/assets/img/icons/heart.svg" className="injectable" alt="img" />
                                          <TotalWishlist />
                                       </Link>
                                    </li>
                                    <li className="header-btn login-btn">
                                       {isAuthenticated ? (
                                          <div className="user-menu dropdown">
                                             <a
                                                href="#"
                                                className="user-avatar dropdown-toggle"
                                                id="userDropdown"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                style={{
                                                   display: 'block',
                                                   width: '45px',
                                                   height: '45px',
                                                   borderRadius: '50%',
                                                   overflow: 'hidden',
                                                   border: '2px solid var(--tg-theme-primary)',
                                                   padding: '2px'
                                                }}
                                             >
                                                {renderAvatar()}
                                             </a>
                                             <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" aria-labelledby="userDropdown" style={{ borderRadius: '12px', minWidth: '200px' }}>
                                                <li className="p-3 border-bottom mb-2">
                                                   <span className="d-block fw-bold small text-dark">{user?.name}</span>
                                                   <span className="d-block small text-muted">{user?.email}</span>
                                                </li>
                                                <li>
                                                   <Link className="dropdown-item py-2 rounded-2" to={user?.role === 'teacher' ? "/instructor-dashboard" : "/my-dashboard"}>
                                                      <i className="fas fa-th-large me-2"></i> {t("common.dashboard")}
                                                   </Link>
                                                </li>
                                                <li>
                                                   <Link className="dropdown-item py-2 rounded-2" to="/my-profile">
                                                      <i className="fas fa-user me-2"></i> {t("common.profile")}
                                                   </Link>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                   <button
                                                      className="dropdown-item py-2 rounded-2 text-danger"
                                                      onClick={logout}
                                                   >
                                                      <i className="fas fa-sign-out-alt me-2"></i> {t("common.logout")}
                                                   </button>
                                                </li>
                                             </ul>
                                          </div>
                                       ) : (
                                          <Link to="/login">{t("common.login")}</Link>
                                       )}
                                    </li>
                                 </ul>
                              </div>
                              <div className="mobile-login-btn">
                                 {isAuthenticated ? (
                                    <Link
                                       to={user?.role === 'teacher' ? "/instructor-dashboard" : "/my-dashboard"}
                                       style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '50px',
                                          height: '50px',
                                          borderRadius: '50%',
                                          background: 'transparent',
                                          color: 'var(--tg-theme-primary)',
                                          textDecoration: 'none',
                                          fontSize: '14px',
                                          fontWeight: '600',
                                          overflow: 'hidden'
                                       }}
                                       title={user?.name || t("common.my_account")}
                                    >
                                       {renderAvatar()}
                                    </Link>
                                 ) : (
                                    <Link to="/login" onClick={handleUserClick}><InjectableSvg src="/assets/img/icons/user.svg" alt="" className="injectable" /></Link>
                                 )}
                              </div>
                              <div onClick={() => setIsActive(true)} className="mobile-nav-toggler"><i className="tg-flaticon-menu-1"></i></div>
                           </nav>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>
         <MobileSidebar isActive={isActive} setIsActive={setIsActive} />
      </>
   )
}

export default HeaderOne
