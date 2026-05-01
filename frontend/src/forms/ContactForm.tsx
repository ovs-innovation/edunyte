import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import emailjs from '@emailjs/browser';
import { useTranslation } from "react-i18next";
import { useRef, useState } from 'react';

interface FormData {
   user_name: string;
   user_email: string;
   phone_number?: string;
   role: string;
   message: string;
}

const ContactForm = () => {
   const { t } = useTranslation();
   const [isSending, setIsSending] = useState(false);

   const schema = yup
      .object({
         user_name: yup.string().required().label("Name"),
         user_email: yup.string().required().email().label("Email"),
         phone_number: yup.string().label("Phone Number"),
         role: yup.string().required().label("Role"),
         message: yup.string().required().label("Message"),
      })
      .required();

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: yupResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         setIsSending(true);
         emailjs.sendForm('eaglesthemes', 'template_lojvsvb', form.current, 'mtLgOuG25NnIwGeKm')
            .then((result) => {
               toast.success(t('contact.form.success') || "Message sent successfully!", { position: 'top-center' });
               reset();
               setIsSending(false);
            }, (error) => {
               toast.error("Failed to send message. Please try again later.", { position: 'top-center' });
               setIsSending(false);
            });
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} id="contact-form" className="contact-form">
         <div className="row g-4">
            <div className="col-md-6">
               <div className="form-grp">
                  <label className="fw-bold small opacity-50 mb-2">Full Name</label>
                  <input 
                     {...register("user_name")} 
                     type="text" 
                     placeholder={t('contact.form.name')} 
                     style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                  />
                  <p className="form_error text-danger small mt-1">{errors.user_name?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <label className="fw-bold small opacity-50 mb-2">Email Address</label>
                  <input 
                     {...register("user_email")} 
                     type="email" 
                     placeholder={t('contact.form.email')} 
                     style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                  />
                  <p className="form_error text-danger small mt-1">{errors.user_email?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <label className="fw-bold small opacity-50 mb-2">Phone (Optional)</label>
                  <input 
                     {...register("phone_number")} 
                     type="tel" 
                     placeholder={t('contact.form.phone')} 
                     style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                  />
                  <p className="form_error text-danger small mt-1">{errors.phone_number?.message}</p>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <label className="fw-bold small opacity-50 mb-2">Your Role</label>
                  <select 
                     {...register("role")} 
                     className="form-select shadow-none" 
                     style={{ width: '100%', height: '56px', padding: '0 20px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#555' }}
                  >
                     <option value="">{t('contact.form.role_placeholder')}</option>
                     <option value="Student">{t('contact.form.role_student')}</option>
                     <option value="Teacher">{t('contact.form.role_teacher')}</option>
                     <option value="Partner">{t('contact.form.role_partner')}</option>
                  </select>
                  <p className="form_error text-danger small mt-1">{errors.role?.message}</p>
               </div>
            </div>
         </div>
         <div className="form-grp mt-4">
            <label className="fw-bold small opacity-50 mb-2">Message</label>
            <textarea 
               {...register("message")} 
               placeholder={t('contact.form.message')} 
               style={{ width: '100%', height: '150px', padding: '20px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', resize: 'none' }}
            ></textarea>
            <p className="form_error text-danger small mt-1">{errors.message?.message}</p>
         </div>
         <button type="submit" className="btn-neon-primary w-100 py-3 mt-4" disabled={isSending}>
            {isSending ? <div className="spinner-border spinner-border-sm" role="status"></div> : t('contact.form.submit')}
         </button>
      </form>
   )
}

export default ContactForm
