"use client";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const InstructorSettingPassword = () => {
   const { token } = useAuth();
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [reTypePassword, setReTypePassword] = useState("");

   const handleUpdatePassword = async () => {
      if (newPassword !== reTypePassword) {
         toast.error("New passwords do not match");
         return;
      }
      try {
         const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
         });

         const data = await response.json();
         if (response.ok) {
            toast.success(data.message);
            setCurrentPassword("");
            setNewPassword("");
            setReTypePassword("");
         } else {
            toast.error(data.message || "Failed to update password");
         }
      } catch (error) {
         toast.error("An error occurred");
      }
   };

   return (
      <div className="instructor__profile-form-wrap">
         <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="instructor__profile-form">
            <div className="form-grp">
               <label htmlFor="currentpassword">Current Password</label>
               <input 
                  id="currentpassword" 
                  type="password" 
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} 
               />
            </div>
            <div className="form-grp">
               <label htmlFor="newpassword">New Password</label>
               <input 
                  id="newpassword" 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="repassword">Re-Type New Password</label>
               <input 
                  id="repassword" 
                  type="password" 
                  placeholder="Re-Type New Password" 
                  value={reTypePassword}
                  onChange={(e) => setReTypePassword(e.target.value)}
               />
            </div>
            <div className="submit-btn mt-25">
               <button type="submit" className="btn">Update Password</button>
            </div>
         </form>
      </div>
   )
}

export default InstructorSettingPassword;
