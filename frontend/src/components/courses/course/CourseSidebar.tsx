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
                      <li style={{ marginBottom: '8px' }}>
                        <div 
                           onClick={() => handleCategory(null)} 
                           className={`form-check ${!selectedCategory ? 'active-category-item' : ''}`} 
                           style={{ 
                              cursor: 'pointer', 
                              padding: '10px 15px', 
                              borderRadius: '12px', 
                              transition: 'all 0.3s ease',
                              background: !selectedCategory ? 'var(--grad-primary)' : 'rgba(255,255,255,0.4)',
                              boxShadow: !selectedCategory ? '0 8px 20px rgba(87, 81, 225, 0.3)' : 'none',
                              border: '1px solid var(--glass-border)'
                           }}
                        >
                           <input className="form-check-input d-none" type="checkbox" checked={!selectedCategory} readOnly id="cat_all" />
                           <label 
                              className="form-check-label w-100" 
                              htmlFor="cat_all" 
                              style={{ 
                                 cursor: 'pointer', 
                                 color: !selectedCategory ? '#fff' : 'var(--text-primary)',
                                 fontWeight: !selectedCategory ? '800' : '500',
                                 margin: 0
                              }}
                           >
                              {t('common.all_courses')}
                           </label>
                        </div>
                      </li>
                     {categoriesToShow.map((category) => (
                         <li key={category._id} style={{ marginBottom: '8px' }}>
                            <div 
                               onClick={() => handleCategory(category.slug || category._id)} 
                               className={`form-check ${selectedCategory === (category.slug || category._id) ? 'active-category-item' : ''}`}
                               style={{ 
                                  cursor: 'pointer', 
                                  padding: '10px 15px', 
                                  borderRadius: '12px', 
                                  transition: 'all 0.3s ease',
                                  background: selectedCategory === (category.slug || category._id) ? 'var(--grad-primary)' : 'rgba(255,255,255,0.4)',
                                  boxShadow: selectedCategory === (category.slug || category._id) ? '0 8px 20px rgba(87, 81, 225, 0.3)' : 'none',
                                  border: '1px solid var(--glass-border)'
                               }}
                            >
                               <input className="form-check-input d-none" type="checkbox" checked={selectedCategory === (category.slug || category._id)} readOnly id={`cat_${category._id}`} />
                               <label 
                                  className="form-check-label w-100" 
                                  htmlFor={`cat_${category._id}`}
                                  style={{ 
                                     cursor: 'pointer', 
                                     color: selectedCategory === (category.slug || category._id) ? '#fff' : 'var(--text-primary)',
                                     fontWeight: selectedCategory === (category.slug || category._id) ? '800' : '500',
                                     margin: 0
                                  }}
                               >
                                  {category.name}
                               </label>
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
