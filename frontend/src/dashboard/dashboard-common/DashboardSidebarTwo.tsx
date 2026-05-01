import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface DataType {
   id: number;
   title: string;
   class_name?: string;
   sidebar_details: {
      id: number;
      link: string;
      icon: string;
      title: string;
      action?: string;
   }[];
};

const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "dashboard.welcome",
      sidebar_details: [
         {
            id: 1,
            link: "/my-dashboard",
            icon: "fas fa-home",
            title: "dashboard.dashboard",
         },
         {
            id: 4,
            link: "/my-wishlist",
            icon: "skillgro-label",
            title: "dashboard.wishlist",
         },
         {
            id: 7,
            link: "/my-history",
            icon: "skillgro-satchel",
            title: "dashboard.order_history",
         },
      ],
   },
   {
      id: 2,
      title: "common.my_account",
      class_name: "mt-30",
      sidebar_details: [
         {
            id: 1,
            link: "/my-profile-setting",
            icon: "skillgro-settings",
            title: "dashboard.profile_settings",
         },
         {
            id: 2,
            link: "#",
            icon: "skillgro-logout",
            title: "dashboard.logout",
            action: "logout"
         },
      ],
   },
];

const DashboardSidebarTwo = () => {
   const { user, logout } = useAuth();
   const { t } = useTranslation();

   const handleLogout = (e: React.MouseEvent) => {
      e.preventDefault();
      logout();
   };

   return (
      <div className="col-lg-3">
         <div className="dashboard__sidebar-wrap">
            {sidebar_data.map((item) => (
               <React.Fragment key={item.id}>
                  <div className={`dashboard__sidebar-title mb-20 ${item.class_name}`}>
                     <h6 className="title">
                        {item.id === 1 ? `${t('dashboard.welcome')}, ${user?.name || t('dashboard.student')}` : t(item.title)}
                     </h6>
                  </div>
                  <nav className="dashboard__sidebar-menu">
                     <ul className="list-wrap">
                        {item.sidebar_details.map((list) => (
                           <li key={list.id}>
                              {list.action === 'logout' ? (
                                 <Link to={list.link} onClick={handleLogout}>
                                    <i className={list.icon}></i>
                                    {t(list.title)}
                                 </Link>
                              ) : (
                                 <Link to={list.link}>
                                    <i className={list.icon}></i>
                                    {t(list.title)}
                                 </Link>
                              )}
                           </li>
                        ))}
                     </ul>
                  </nav>
               </React.Fragment>
            ))}
         </div>
      </div>
   )
}

export default DashboardSidebarTwo