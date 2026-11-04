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
   const [regError, setRegError] = useState<string | null>(null);

   const schema = yup
      .object({
         fname: yup.string().required().label(t("common.first_name")),
         lname: yup.string().required().label(t("common.last_name")),
         email: yup.string().required().email().label(t("common.email")),
         password: yup.string().required().min(6).label(t("common.password")),
         cpassword: yup.string()
            .required()
            .oneOf([yup.ref('password')], t("common.password_must_match"))
            .label(t("common.confirm_password")),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const onSubmit = async (data: FormData) => {
      setIsLoading(true);
      setRegError(null);
      try {
         await registerUser({
            name: `${data.fname} ${data.lname}`,
            email: data.email,
            password: data.password,
            role: (role === 'tutor' || role === 'instructor') ? 'teacher' : 'student',
         });
         toast.success((role === 'tutor' || role === 'instructor')
            ? t("common.registration_success_pending", "Registration successful. Please wait for admin approval.")
            : t("common.registration_success"),
            { position: 'top-center' }
         );
         reset();
      } catch (error: any) {
         const message = error.message || t("common.registration_failed");
         setRegError(message);
         toast.error(message, { position: 'top-center' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="account__form">
         {regError && (
            <div
               className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-3 border-0 shadow-sm"
               role="alert"
               style={{
                  borderRadius: '12px',
                  background: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  color: '#991b1b',
                  fontSize: '0.9rem'
               }}
            >
               <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-exclamation-circle flex-shrink-0 text-danger" style={{ fontSize: '1.1rem' }}></i>
                  <span className="fw-medium">{regError}</span>
               </div>
               <button
                  type="button"
                  className="btn-close shadow-none"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setRegError(null)}
                  aria-label="Close"
               ></button>
            </div>
         )}
         <div className="row g-3">
            <div className="col-md-6">
               <div className="form-grp mb-2">
                  <label htmlFor="fast-name" className="fw-bold small opacity-50 mb-2">{t("common.first_name")}</label>
                  <input type="text" {...register("fname")} id="fast-name" placeholder="John" style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.9rem' }} />
                  <p className="form_error text-danger small mt-1">{errors.fname?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp mb-2">
                  <label htmlFor="last-name" className="fw-bold small opacity-50 mb-2">{t("common.last_name")}</label>
                  <input type="text" {...register("lname")} id="last-name" placeholder="Doe" style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.9rem' }} />
                  <p className="form_error text-danger small mt-1">{errors.lname?.message}</p>
               </div>
            </div>
         </div>
         <div className="form-grp mb-2">
            <label htmlFor="email" className="fw-bold small opacity-50 mb-2">{t("common.email")}</label>
            <input type="email" {...register("email")} id="email" placeholder="name@example.com" style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.9rem' }} />
            <p className="form_error text-danger small mt-1">{errors.email?.message}</p>
         </div>
         <div className="form-grp mb-2">
            <label htmlFor="password" className="fw-bold small opacity-50 mb-2">{t("common.password")}</label>
            <input type="password" {...register("password")} id="password" placeholder="••••••••" style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.9rem' }} />
            <p className="form_error text-danger small mt-1">{errors.password?.message}</p>
         </div>
         <div className="form-grp mb-20">
            <label htmlFor="confirm-password" className="fw-bold small opacity-50 mb-2">{t("common.confirm_password")}</label>
            <input type="password" {...register("cpassword")} id="confirm-password" placeholder="••••••••" style={{ width: '100%', padding: '12px 18px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.9rem' }} />
            <p className="form_error text-danger small mt-1">{errors.cpassword?.message}</p>
         </div>
         <button type="submit" className="btn-neon-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2" disabled={isLoading} style={{ borderRadius: '12px' }}>
            {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
                <>
                    {t("common.sign_up")}
                    <i className="fas fa-arrow-right"></i>
                </>
            )}
         </button>
      </form>
   )
}

export default RegistrationForm
