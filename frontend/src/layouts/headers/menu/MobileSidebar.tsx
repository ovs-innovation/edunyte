import { Link, useNavigate } from "react-router-dom"
import MobileMenu from "./MobileMenu"
import LanguageCurrencySwitcher from "../../../components/common/LanguageCurrencySwitcher"
import { useTranslation } from "react-i18next"
import { useState } from "react"

interface MobileSidebarProps {
   isActive: boolean;
   setIsActive: (isActive: boolean) => void;
}
const MobileSidebar = ({ isActive, setIsActive }: MobileSidebarProps) => {
   const { t } = useTranslation()
   const navigate = useNavigate()
   const [searchText, setSearchText] = useState('')

   const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchText.trim()) {
         navigate(`/courses?search=${encodeURIComponent(searchText.trim())}`)
         setSearchText('')
         setIsActive(false)
      }
   }

   return (
      <div className={isActive ? "mobile-menu-visible" : ""}>
         <div className="tgmobile__menu">
            <nav className="tgmobile__menu-box">
               <div onClick={() => setIsActive(false)} className="close-btn"><i className="tg-flaticon-close-1"></i></div>
               <div className="nav-logo text-center">
                  <Link to="/">
                     <img src="/logo.png" alt="Edunyte logo" style={{ height: '85px', width: 'auto' }} />
                  </Link>
               </div>
               <div className="tgmobile__search">
                  <form onSubmit={handleSearchSubmit}>
                     <input
                        type="text"
                        placeholder={t("common.search_here")}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                     />
                     <button type="submit"><i className="fas fa-search"></i></button>
                  </form>
               </div>
               <div className="tgmobile__language-currency">
                  <LanguageCurrencySwitcher />
               </div>
               <div className="tgmobile__menu-outer">
                  <MobileMenu />
               </div>
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
