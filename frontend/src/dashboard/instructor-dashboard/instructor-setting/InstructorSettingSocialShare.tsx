"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const InstructorSettingSocialShare = () => {
   const { token } = useAuth();
   const [socialLinks, setSocialLinks] = useState({
      facebook: "",
      twitter: "",
      linkedin: "",
      website: "",
      github: ""
   });

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
            const response = await fetch(`${API_URL}/student-profiles/me`, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.profile?.socialLinks) {
               setSocialLinks(prev => ({ ...prev, ...data.profile.socialLinks }));
            }
         } catch (error) {
            console.error(error);
         }
      };
      if (token) fetchProfile();
   }, [token]);

   const handleUpdate = async () => {
      try {
         const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
         const response = await fetch(`${API_URL}/student-profiles/me`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ socialLinks })
         });
         if (response.ok) {
            toast.success("Social links updated successfully");
         } else {
            toast.error("Failed to update social links");
         }
      } catch (error) {
         toast.error("An error occurred");
      }
   };

   return (
      <div className="instructor__profile-form-wrap">
         <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="instructor__profile-form">
            <div className="form-grp">
               <label htmlFor="facebook">Facebook</label>
               <input 
                  id="facebook" type="url" placeholder="https://facebook.com/" 
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="twitter">Twitter</label>
               <input 
                   id="twitter" type="url" placeholder="https://twitter.com/" 
                   value={socialLinks.twitter}
                   onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="linkedin">Linkedin</label>
               <input 
                  id="linkedin" type="url" placeholder="https://linkedin.com/" 
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="website">Website</label>
               <input 
                  id="website" type="url" placeholder="https://website.com/" 
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="github">Github</label>
               <input 
                  id="github" type="url" placeholder="https://github.com/" 
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
               />
            </div>
            <div className="submit-btn mt-25">
               <button type="submit" className="btn">Update Profile</button>
            </div>
         </form>
      </div>
   )
}

export default InstructorSettingSocialShare
