import { Link } from "react-router-dom";
import menu_data from "../../../data/home-data/MenuData";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const NavMenu = () => {
   const [navClick, setNavClick] = useState<boolean>(false);
   const { t } = useTranslation();

   const tt = (item: { title: string; titleKey?: string }) => (item.titleKey ? t(item.titleKey) : item.title);
   const hasChildren = (menu: any) =>
      (menu?.home_sub_menu && menu.home_sub_menu.length > 0) || (menu?.sub_menus && menu.sub_menus.length > 0);

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [navClick]);

   return (
      <ul className="navigation">
         {menu_data.map((menu) => (
            <li key={menu.id} className={hasChildren(menu) ? "menu-item-has-children" : ""}>
               <Link onClick={() => setNavClick(!navClick)} to={menu.link}>{tt(menu)}</Link>
               {hasChildren(menu) && (
                  <ul className={`sub-menu ${menu.menu_class}`}>
                     {menu.home_sub_menu ? (
                        <>
                           {menu.home_sub_menu.map((h_menu_details: any, i: number) => (
                              <li key={i}>
                                 <ul className="list-wrap mega-sub-menu">
                                    {h_menu_details.menu_details.map((h_menu: any, index: number) => (
                                       <li key={index}>
                                          <Link onClick={() => setNavClick(!navClick)} to={h_menu.link}>
                                             {tt(h_menu)} <span className={h_menu.badge_class}>{h_menu.badge}</span>
                                          </Link>
                                       </li>
                                    ))}
                                 </ul>
                              </li>
                           ))}

                           <li>
                              <div className="mega-menu-img">
                                 <Link onClick={() => setNavClick(!navClick)} to="/courses">
                                    <img src="/assets/img/others/mega_menu_img.jpg" alt="img" />
                                 </Link>
                              </div>
                           </li>
                        </>
                     ) : (
                        menu.sub_menus?.map((sub_m: any, index: number) => (
                           <li key={index} className={sub_m.mega_menus ? "menu-item-has-children" : ""}>
                              <Link onClick={() => setNavClick(!navClick)} to={sub_m.link}>{tt(sub_m)}</Link>
                              {sub_m.mega_menus && (
                                 <ul className="sub-menu">
                                    {sub_m.mega_menus?.map((mega_m: any, i: number) => (
                                       <li key={i}>
                                          <Link onClick={() => setNavClick(!navClick)} to={mega_m.link}>{tt(mega_m)}</Link>
                                       </li>
                                    ))}
                                 </ul>
                              )}
                           </li>
                        ))
                     )}
                  </ul>
               )}
            </li>
         ))}
      </ul>
   );
};

export default NavMenu;
