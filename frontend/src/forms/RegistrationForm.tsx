import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import BtnArrow from '../svg/BtnArrow';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface FormData {
   fname: string;
   lname: string;
   email: string;
   password: string;
   cpassword: string;
}

const RegistrationForm = ({ role }: { role?: string }) => {
   const { t } = useTranslation();
   const { register: registerUser } = useAuth();
   const [isLoading, setIsLoading] = useState(false);

   const schema = yup
      .object({
         fname: yup.string().required().label(t("common.first_name")),
         lname: yup.string().required().label(t("common.last_name")),
         email: yup.string().required().email().label(t("common.email")),
         password: yup.string().required().min(6).label(t("common.password")),
         cpassword: yup.string()
            .required()
            .oneOf([yup.ref('password')], t("common.password") + ' must match')
            .label(t("common.confirm_password")),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });
   
   const onSubmit = async (data: FormData) => {
      setIsLoading(true);
      try {
         await registerUser({
            name: `${data.fname} ${data.lname}`,
            email: data.email,
            password: data.password,
            role: role === 'tutor' ? 'teacher' : 'student',
         });
         toast.success(role === 'tutor' 
            ? t("common.registration_success_pending", "Registration successful. Please wait for admin approval.") 
            : t("common.registration_success"), 
            { position: 'top-center' }
         );
         reset();
      } catch (error: any) {
         toast.error(error.message || 'Registration failed', { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="account__form">
         <div className="row gutter-20">
            <div className="col-md-6">
               <div className="form-grp">
                  <label htmlFor="fast-name">{t("common.first_name")}</label>
                  <input type="text" {...register("fname")} id="fast-name" placeholder={t("common.first_name")} />
                  <p className="form_error">{errors.fname?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <label htmlFor="last-name">{t("common.last_name")}</label>
                  <input type="text" {...register("lname")} id="last-name" placeholder={t("common.last_name")} />
                  <p className="form_error">{errors.lname?.message}</p>
               </div>
            </div>
         </div>
         <div className="form-grp">
            <label htmlFor="email">{t("common.email")}</label>
            <input type="email" {...register("email")} id="email" placeholder={t("common.email")} />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-grp">
            <label htmlFor="password">{t("common.password")}</label>
            <input type="password" {...register("password")} id="password" placeholder={t("common.password")} />
            <p className="form_error">{errors.password?.message}</p>
         </div>
         <div className="form-grp">
            <label htmlFor="confirm-password">{t("common.confirm_password")}</label>
            <input type="password" {...register("cpassword")} id="confirm-password" placeholder={t("common.confirm_password")} />
            <p className="form_error">{errors.cpassword?.message}</p>
         </div>
         <button type="submit" className="btn btn-two arrow-btn" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : t("common.sign_up")}
            <BtnArrow />
         </button>
      </form>
   )
}

export default RegistrationForm
