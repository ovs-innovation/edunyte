
import Count from "../../common/Count";
import { useTranslation } from 'react-i18next';

const Counter = () => {
   const { t } = useTranslation();
   // @ts-ignore
   const count_data = t('counter', { returnObjects: true });
   return (
      <section className="fact__area">
         <div className="container">
            <div className="fact__inner-wrap">
               <div className="row">
                  {count_data.map((item: any, idx: number) => (
                     <div key={idx} className="col-lg-3 col-6">
                        <div className="fact__item">
                           <h2 className="count"><Count number={item.count} />{item.count_text}</h2>
                           <p>{item.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Counter
