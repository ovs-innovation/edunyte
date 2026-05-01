import faq_data from "../../../data/home-data/FaqData";
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next";

interface faqItem {
   id: number;
   page: string;
   question: string;
   answer: string;
   showAnswer: boolean;
};

const FaqArea = () => {
   const { t } = useTranslation();

   const [faqData, setFaqData] = useState<faqItem[]>([]);

   useEffect(() => {
      const initialFaqData: faqItem[] = faq_data.map((faq, index) => ({
         ...faq,
         showAnswer: index === 0,
      }));
      setFaqData(initialFaqData);
   }, []);

   const toggleAnswer = (index: number) => {
      setFaqData((prevFaqData) => {
         const updatedFaqData = prevFaqData.map((faq, i) => ({
            ...faq,
            showAnswer: i === index ? !faq.showAnswer : false,
         }));
         return updatedFaqData;
      });
   };

   return (
      <section className="faq__area py-5">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-8 col-lg-10">
                  <div className="text-center mb-60">
                     <span className="sub-title mb-20 text-primary fw-bold" style={{ letterSpacing: '2px' }}>SUPPORT CENTER</span>
                     <h2 className="title fw-900" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Frequently Asked <span className="text-grad">Questions</span></h2>
                     <p className="mt-3 opacity-70">Find answers to the most common questions about the Edunyte platform.</p>
                  </div>
                  
                  <div className="faq__wrap">
                     <div className="accordion" id="accordionExample">
                        {faqData.map((item, index) => (
                           <div key={item.id} className="glass-panel mb-3 border-0 shadow-sm overflow-hidden" style={{ background: 'white', borderRadius: '16px' }}>
                              <div className="accordion-item border-0 bg-transparent">
                                 <h2 className="accordion-header">
                                    <button 
                                        className={`accordion-button shadow-none bg-transparent py-4 px-4 fw-bold text-dark ${item.showAnswer ? "" : "collapsed"}`}
                                        type="button" 
                                        onClick={() => toggleAnswer(index)}
                                        style={{ fontSize: '1.1rem' }}
                                    >
                                       {t(item.question)}
                                    </button>
                                 </h2>
                                 {item.showAnswer && (
                                    <div className="accordion-collapse collapse show">
                                       <div className="accordion-body pt-0 px-4 pb-4 opacity-70" style={{ lineHeight: 1.7 }}>
                                          <p className="m-0">{t(item.answer)}</p>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="text-center mt-60">
                     <p className="opacity-60 mb-0">Still have questions? <a href="/contact" className="fw-bold text-primary">Contact our team</a></p>
                  </div>
               </div>
            </div>
         </div>
         <style>{`
            .text-grad {
                background: var(--grad-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .accordion-button:after {
                background-size: 1rem;
                transition: transform 0.3s;
            }
            .accordion-button:not(.collapsed):after {
                filter: hue-rotate(240deg);
            }
         `}</style>
      </section>
   )
}

export default FaqArea
