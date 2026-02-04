import HeaderTopOne from "./menu/HeaderTopOne"
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
   const { isAuthenticated, user } = useAuth();
   const navigate = useNavigate();

   const handleUserClick = (e: React.MouseEvent) => {
      if (!isAuthenticated) {
         e.preventDefault();
         navigate('/login');
      }
   };



   const getUserAvatar = () => {
      if (user?.photo || user?.avatar || user?.image) {
         return user.photo || user.avatar || user.image;
      }
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
            <HeaderTopOne style={false} />
            <div id="header-fixed-height"></div>
            <div id="sticky-header" className={`tg-header__area ${sticky ? "sticky-menu" : ""}`}>
               <div className="container custom-container">
                  <div className="row">
                     <div className="col-12">
                        <div className="tgmenu__wrap">
                           <nav className="tgmenu__nav">
                              <div className="logo">
                                 <Link to="/"><img src="/assets/img/logo/edunyte-light.png" height="100" width="100" alt="Logo" /></Link>
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
                                          <div className="user-menu">
                                             <Link 
                                                to="/my-dashboard" 
                                                className="user-avatar"
                                             >
                                                {renderAvatar()}
                                             </Link>

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
                                       to="/my-dashboard"
                                       style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center',
                                          width: '40px',
                                          height: '40px',
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
