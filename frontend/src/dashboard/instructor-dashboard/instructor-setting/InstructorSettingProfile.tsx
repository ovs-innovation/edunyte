"use client";
import { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const InstructorSettingProfile = () => {
   const { user, token } = useAuth();
   const [name, setName] = useState("");
   const [phone, setPhone] = useState("");
   const [selectedCountry, setSelectedCountry] = useState<any>(null);
   const [selectedState, setSelectedState] = useState<any>(null);
   const [selectedCity, setSelectedCity] = useState<any>(null);
   const [selectedTimezone, setSelectedTimezone] = useState<any>(null);

   const countries = useMemo(() => Country.getAllCountries().map(c => ({ label: c.name, value: c.isoCode })), []);
   const states = useMemo(() => {
       if (!selectedCountry) return [];
       return State.getStatesOfCountry(selectedCountry.value).map(s => ({ label: s.name, value: s.isoCode }));
   }, [selectedCountry]);
   const cities = useMemo(() => {
       if (!selectedState || !selectedCountry) return [];
       return City.getCitiesOfState(selectedCountry.value, selectedState.value).map(c => ({ label: c.name, value: c.name }));
   }, [selectedState, selectedCountry]);
   
   const timezones = useMemo(() => (Intl as any).supportedValuesOf('timeZone').map((tz: string) => ({ label: tz, value: tz })), []);

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/student-profiles/me`, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            });
            const data = await response.json();
            
            if (data.profile) {
               const profile = data.profile;
               
               // Set User Data
               setName(profile.userId?.name || user?.name || "");
               setPhone(profile.phone || "");
               
               // Set Location Data
               if (profile.country) {
                  const foundCountry = Country.getAllCountries().find(c => c.name === profile.country);
                  if (foundCountry) {
                     const countryOption = { label: foundCountry.name, value: foundCountry.isoCode };
                     setSelectedCountry(countryOption);
                     
                     if (profile.state) {
                        const foundState = State.getStatesOfCountry(foundCountry.isoCode).find(s => s.name === profile.state);
                        if (foundState) {
                           const stateOption = { label: foundState.name, value: foundState.isoCode };
                           setSelectedState(stateOption);
                           
                           if (profile.city) {
                              // City value is name in our options
                              setSelectedCity({ label: profile.city, value: profile.city });
                           }
                        }
                     }
                  }
               }
               
               if (profile.timezone) {
                  setSelectedTimezone({ label: profile.timezone, value: profile.timezone });
               }
            }
         } catch (error) {
            console.error("Failed to fetch profile:", error);
         }
      };

      if (user?.id && token) {
         fetchProfile();
      } else if (user?.name) {
         setName(user.name);
      }
   }, [user, token]);

   const handleUpdate = async () => {
      try {
         const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const payload = {
            phone,
            country: selectedCountry?.label,
            state: selectedState?.label,
            city: selectedCity?.label,
            timezone: selectedTimezone?.value
         };

         const response = await fetch(`${API_URL}/student-profiles/me`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
         });

         if (response.ok) {
            toast.success("Profile updated successfully");
         } else {
            const error = await response.json();
            toast.error(error.message || "Failed to update profile");
         }
      } catch (error) {
         console.error(error);
         toast.error("An error occurred while updating profile");
      }
   };

   return (
      <div className="instructor__profile-form-wrap">
         <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="instructor__profile-form">
            <div className="row">
               <div className="col-md-6">
                  <div className="form-grp">
                     <label htmlFor="name">Full Name</label>
                     <input 
                        id="name" 
                        type="text" 
                        placeholder="Full Name" 
                        readOnly 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="form-grp">
                     <label htmlFor="phonenumber">Phone Number</label>
                     <input 
                        id="phonenumber" 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="form-grp">
                     <label>Country</label>
                     <Select
                        options={countries}
                        value={selectedCountry}
                        onChange={(option) => {
                           setSelectedCountry(option);
                           setSelectedState(null);
                           setSelectedCity(null);
                        }}
                        classNamePrefix="react-select"
                        placeholder="Select Country"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="form-grp">
                     <label>State</label>
                     <Select
                        options={states}
                        value={selectedState}
                        onChange={(option) => {
                           setSelectedState(option);
                           setSelectedCity(null);
                        }}
                        isDisabled={!selectedCountry}
                        classNamePrefix="react-select"
                        placeholder="Select State"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="form-grp">
                     <label>City</label>
                     <Select
                        options={cities}
                        value={selectedCity}
                        onChange={setSelectedCity}
                        isDisabled={!selectedState}
                        classNamePrefix="react-select"
                        placeholder="Select City"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="form-grp">
                     <label>Timezone</label>
                     <Select
                        options={timezones}
                        value={selectedTimezone}
                        onChange={setSelectedTimezone}
                        classNamePrefix="react-select"
                        placeholder="Select Timezone"
                     />
                  </div>
               </div>
            </div>
            <div className="submit-btn mt-25">
               <button type="submit" className="btn">
                  Update Info
               </button>
            </div>
         </form>
      </div>
   );
};

export default InstructorSettingProfile;
