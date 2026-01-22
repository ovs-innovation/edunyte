import { useState } from "react";
import menu_data from "../../../data/home-data/MenuData";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MenuItem } from "../../../data/home-data/MenuData";

const MobileMenu = () => {
   const { t } = useTranslation();
   const tt = (item: { title: string; titleKey?: string }) => (item.titleKey ? t(item.titleKey) : item.title);
   const hasChildren = (menu: MenuItem) =>
      (menu.home_sub_menu && menu.home_sub_menu.length > 0) || (menu.sub_menus && menu.sub_menus.length > 0);

   const [openMenuId, setOpenMenuId] = useState<number | null>(null);
   const [openSubId, setOpenSubId] = useState<string | null>(null);

   // openMobileMenu
   const openMobileMenu = (menuId: number) => {
      setOpenMenuId(openMenuId === menuId ? null : menuId);
   };

   // openMobileSubMenu
   const openMobileSubMenu = (subId: string) => {
      setOpenSubId(openSubId === subId ? null : subId);
   };

   return (
      <ul className="navigation">
         {menu_data.map((menu: MenuItem) => (
            <li key={menu.id} className={hasChildren(menu) ? "menu-item-has-children" : ""}>
               <Link to={menu.link}>{tt(menu)}</Link>
               {hasChildren(menu) && (
                  <>
                     <ul
                        className={`sub-menu ${menu.menu_class}`}
                        style={{ display: openMenuId === menu.id ? "block" : "none" }}
                     >
                        {menu.home_sub_menu ? (
                           <>
                              {menu.home_sub_menu.map((h_menu_details, i) => (
                                 <li key={i}>
                                    <ul className="list-wrap mega-sub-menu">
                                       {h_menu_details.menu_details.map((h_menu, index) => (
                                          <li key={index}>
                                             <Link to={h_menu.link}>
                                                {tt(h_menu)}{" "}
                                                {h_menu.badge && (
                                                   <span className={h_menu.badge_class}>{h_menu.badge}</span>
                                                )}
                                             </Link>
                                          </li>
                                       ))}
                                    </ul>
                                 </li>
                              ))}

                              <li>
                                 <div className="mega-menu-img">
                                    <Link to="/courses">
                                       <img
                                          src="/assets/img/others/mega_menu_img.jpg"
                                          alt="img"
                                       />
                                    </Link>
                                 </div>
                              </li>
                           </>
                        ) : (
                           menu.sub_menus?.map((sub_m, index) => (
                              // stable sub id (not dependent on translations)
                              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                              ((subId) => (
                              <li
                                 key={index}
                                 className={`${sub_m.dropdown ? "menu-item-has-children" : ""
                                    }`}
                              >
                                 <Link to={sub_m.link}>{tt(sub_m)}</Link>
                                 {sub_m.mega_menus && (
                                    <ul
                                       className="sub-menu"
                                       style={{
                                          display: openSubId === subId ? "block" : "none",
                                       }}
                                    >
                                       {sub_m.mega_menus.map((mega_m, i) => (
                                          <li key={i}>
                                             <Link to={mega_m.link}>{tt(mega_m)}</Link>
                                          </li>
                                       ))}
                                    </ul>
                                 )}
                                 {sub_m.mega_menus && (
                                    <div
                                       className={`dropdown-btn ${openSubId === subId ? "open" : ""
                                          }`}
                                       onClick={() => openMobileSubMenu(subId)}
                                    >
                                       <span className="plus-line"></span>
                                    </div>
                                 )}
                              </li>
                              ))(`${menu.id}-${index}`)
                           ))
                        )}
                     </ul>
                     <div
                        className={`dropdown-btn ${openMenuId === menu.id ? "open" : ""}`}
                        onClick={() => openMobileMenu(menu.id)}
                     >
                        <span className="plus-line"></span>
                     </div>
                  </>
               )}
            </li>
         ))}
      </ul>
   );
};

export default MobileMenu;
