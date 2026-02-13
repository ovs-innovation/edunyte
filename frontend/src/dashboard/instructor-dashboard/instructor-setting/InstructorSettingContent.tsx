"use client"
import InstructorSettingProfile from "./InstructorSettingProfile"
import InstructorSettingPassword from "./InstructorSettingPassword"
import InstructorSettingSocialShare from "./InstructorSettingSocialShare"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const InstructorSettingContent = () => {
   const { t } = useTranslation()
   const [activeTab, setActiveTab] = useState(0);

   const tab_title: string[] = [t("common.profile"), t("common.password"), t("dashboard.social_share")];

   const handleTabClick = (index: any) => {
      setActiveTab(index);
   };

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">{t('dashboard.settings')}</h4>
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <div className="dashboard__nav-wrap">
                     <ul className="nav nav-tabs" id="myTab" role="tablist">
                        {tab_title.map((tab, index) => (
                           <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                              <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="tab-content" id="myTabContent">
                     <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="itemOne-tab-pane" role="tabpanel" aria-labelledby="itemOne-tab" >
                        <InstructorSettingProfile />
                     </div>
                     <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="itemTwo-tab-pane" role="tabpanel" aria-labelledby="itemTwo-tab" >
                        <InstructorSettingPassword />
                     </div>
                     <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`} id="itemThree-tab-pane" role="tabpanel" aria-labelledby="itemThree-tab" >
                        <InstructorSettingSocialShare />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default InstructorSettingContent
