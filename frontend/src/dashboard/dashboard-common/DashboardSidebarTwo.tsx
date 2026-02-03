import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
      title: "Welcome, User",
      sidebar_details: [
         {
            id: 1,
            link: "/my-dashboard",
            icon: "fas fa-home",
            title: "Dashboard",
         },
         // {
         //    id: 2,
         //    link: "/my-profile",
         //    icon: "skillgro-avatar",
         //    title: "My Profile",
         // },
         // {
         //    id: 3,
         //    link: "/my-lessions",
         //    icon: "skillgro-book",
         //    title: "My Lessions",
         // },
         {
            id: 4,
            link: "/my-wishlist",
            icon: "skillgro-label",
            title: "Wishlist",
         },
         // {
         //    id: 5,
         //    link: "/student-review",
         //    icon: "skillgro-book-2",
         //    title: "Reviews",
         // },
         {
            id: 7,
            link: "/my-history",
            icon: "skillgro-satchel",
            title: "Order History",
         },
      ],
   },
   {
      id: 2,
      title: "User",
      class_name: "mt-30",
      sidebar_details: [
         {
            id: 1,
            link: "/my-profile-setting",
            icon: "skillgro-settings",
            title: "Profile Settings",
         },
         {
            id: 2,
            link: "#",
            icon: "skillgro-logout",
            title: "Logout",
            action: "logout"
         },
      ],
   },
];

const DashboardSidebarTwo = () => {
   const { user, logout } = useAuth();

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
                        {item.id === 1 ? `Welcome, ${user?.name || 'Student'}` : item.title}
                     </h6>
                  </div>
                  <nav className="dashboard__sidebar-menu">
                     <ul className="list-wrap">
                        {item.sidebar_details.map((list) => (
                           <li key={list.id}>
                              {list.action === 'logout' ? (
                                 <Link to={list.link} onClick={handleLogout}>
                                    <i className={list.icon}></i>
                                    {list.title}
                                 </Link>
                              ) : (
                                 <Link to={list.link}>
                                    <i className={list.icon}></i>
                                    {list.title}
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