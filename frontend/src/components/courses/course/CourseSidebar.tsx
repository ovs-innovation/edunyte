import { useState, useEffect } from "react";
import { fetchCategories, type Category } from "../../../services/categoryService";
import { useTranslation } from "react-i18next";

interface CourseSidebarProps {
   setSelectedCategory: (categorySlug: string | null) => void;
   selectedCategory: string | null;
}

const CourseSidebar = ({ setSelectedCategory, selectedCategory }: CourseSidebarProps) => {
   const { t } = useTranslation();
   const [categories, setCategories] = useState<Category[]>([]);
   const [showMoreCategory, setShowMoreCategory] = useState(false);

   useEffect(() => {
      const loadCategories = async () => {
         try {
            const response = await fetchCategories('active');
            setCategories(response.categories);
         } catch (err) {
            console.error('Failed to load categories:', err);
         }
      };
      loadCategories();
   }, []);

   const handleCategory = (categorySlug: string | null) => {
      setSelectedCategory(categorySlug);
   };

   const categoriesToShow = showMoreCategory ? categories : categories.slice(0, 8);

   return (
      <div className="col-xl-3 col-lg-4">
         <aside className="courses__sidebar">
            <div className="courses-widget">
               <h4 className="widget-title">{t('common.categories')}</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     <li>
                        <div onClick={() => handleCategory(null)} className="form-check">
                           <input className="form-check-input" type="checkbox" checked={!selectedCategory} readOnly id="cat_all" />
                           <label className="form-check-label" htmlFor="cat_all" onClick={() => handleCategory(null)}>{t('common.all_courses')}</label>
                        </div>
                     </li>
                     {categoriesToShow.map((category) => (
                        <li key={category._id}>
                           <div onClick={() => handleCategory(category.slug || category._id)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={selectedCategory === (category.slug || category._id)} readOnly id={`cat_${category._id}`} />
                              <label className="form-check-label" htmlFor={`cat_${category._id}`} onClick={() => handleCategory(category.slug || category._id)}>{category.name}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  {categories.length > 8 && (
                     <div className="show-more">
                        <a className={`show-more-btn ${showMoreCategory ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreCategory(!showMoreCategory)}>
                           {showMoreCategory ? t('common.show_less') : t('common.show_more')}
                        </a>
                     </div>
                  )}
               </div>
            </div>
         </aside>
      </div>
   );
}

export default CourseSidebar;
