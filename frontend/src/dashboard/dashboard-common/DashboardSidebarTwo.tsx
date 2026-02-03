import React from "react";
import { Link } from "react-router-dom";

interface DataType {
   id: number;
   title: string;
   class_name?: string;
   sidebar_details: {
      id: number;
      link: string;
      icon: string;
      title: string;
   }[];
};

const sidebar_data: DataType[] = [
   {
      id: 1,
      title: "Welcome, Emily Hannah",
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
            link: "/",
            icon: "skillgro-logout",
            title: "Logout",
         },
      ],
   },
];

const DashboardSidebarTwo = () => {

   return (
      <div className="col-lg-3">
         <div className="dashboard__sidebar-wrap">
            {sidebar_data.map((item) => (
               <React.Fragment key={item.id}>
                  <div className={`dashboard__sidebar-title mb-20 ${item.class_name}`}>
                     <h6 className="title">{item.title}</h6>
                  </div>
                  <nav className="dashboard__sidebar-menu">
                     <ul className="list-wrap">
                        {item.sidebar_details.map((list) => (
                           <li key={list.id}>
                              <Link to={list.link}>
                                 <i className={list.icon}></i>
                                 {list.title}
                              </Link>
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