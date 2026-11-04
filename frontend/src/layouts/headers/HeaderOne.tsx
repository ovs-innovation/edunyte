// import HeaderTopOne from "./menu/HeaderTopOne"
import NavMenu from "./menu/NavMenu"
import React, { useState, useRef, useEffect } from "react"
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
   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
   const userDropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
            setUserDropdownOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

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
                                    <img src="/logo.png" alt="Edunyte logo" className="site-main-logo" />
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
                                          <div className="user-menu dropdown position-relative" ref={userDropdownRef}>
                                              <button
                                                 type="button"
                                                 className="user-avatar dropdown-toggle border-0 p-0"
                                                 id="userDropdown"
                                                 aria-expanded={userDropdownOpen}
                                                 onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setUserDropdownOpen(prev => !prev);
                                                 }}
                                                 style={{
                                                    display: 'block',
                                                    width: '45px',
                                                    height: '45px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    border: '2px solid var(--tg-theme-primary)',
                                                    padding: '2px',
                                                    background: 'transparent',
                                                    cursor: 'pointer'
                                                 }}
                                                 title={user?.name || "User Account"}
                                              >
                                                 {renderAvatar()}
                                              </button>
                                              <ul
                                                 className={`dropdown-menu dropdown-menu-end shadow border-0 p-2 ${userDropdownOpen ? 'show' : ''}`}
                                                 aria-labelledby="userDropdown"
                                                 style={{
                                                    borderRadius: '12px',
                                                    minWidth: '220px',
                                                    display: userDropdownOpen ? 'block' : 'none',
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 'calc(100% + 8px)',
                                                    zIndex: 999999999,
                                                    backgroundColor: '#ffffff',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                                                 }}
                                              >
                                                 <li className="p-3 border-bottom mb-2" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                                    <span className="d-block fw-bold small text-dark">{user?.name || 'User'}</span>
                                                    <span className="d-block small text-muted text-truncate" style={{ maxWidth: '190px' }}>{user?.email}</span>
                                                    {user?.role && (
                                                       <span
                                                          className={`badge mt-1 ${user.role === 'teacher' ? 'bg-info' : 'bg-primary'}`}
                                                          style={{ fontSize: '10px', textTransform: 'capitalize' }}
                                                       >
                                                          {user.role === 'teacher' ? 'Instructor' : 'Student'}
                                                       </span>
                                                    )}
                                                 </li>
                                                 <li>
                                                    <Link
                                                       className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center"
                                                       to={user?.role === 'teacher' ? "/instructor-dashboard" : "/my-dashboard"}
                                                       onClick={() => setUserDropdownOpen(false)}
                                                       style={{ fontWeight: 500 }}
                                                    >
                                                       <i className="fas fa-th-large me-2 text-primary" style={{ width: '18px' }}></i> {t("common.dashboard")}
                                                    </Link>
                                                 </li>
                                                 <li>
                                                    <Link
                                                       className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center"
                                                       to="/my-profile"
                                                       onClick={() => setUserDropdownOpen(false)}
                                                       style={{ fontWeight: 500 }}
                                                    >
                                                       <i className="fas fa-user me-2 text-primary" style={{ width: '18px' }}></i> {t("common.profile")}
                                                    </Link>
                                                 </li>
                                                 {user?.role !== 'teacher' && (
                                                    <li>
                                                       <Link
                                                          className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center"
                                                          to="/my-lessions"
                                                          onClick={() => setUserDropdownOpen(false)}
                                                          style={{ fontWeight: 500 }}
                                                       >
                                                          <i className="fas fa-book-reader me-2 text-primary" style={{ width: '18px' }}></i> My Lessons
                                                       </Link>
                                                    </li>
                                                 )}
                                                 <li><hr className="dropdown-divider my-2" /></li>
                                                 <li>
                                                    <button
                                                       type="button"
                                                       className="dropdown-item py-2 px-3 rounded-2 text-danger d-flex align-items-center w-100 border-0 bg-transparent text-start"
                                                       onClick={() => {
                                                          setUserDropdownOpen(false);
                                                          logout();
                                                       }}
                                                       style={{ fontWeight: 500 }}
                                                    >
                                                       <i className="fas fa-sign-out-alt me-2" style={{ width: '18px' }}></i> {t("common.logout")}
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
