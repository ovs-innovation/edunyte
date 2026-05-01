import Categories from "./Categories"
import LatestPost from "./LatestPost"
import Tags from "./Tags"

interface BlogProps {
   style_1: boolean;
}

const BlogSidebar = ({ style_1 }: BlogProps) => {
   return (
      <div className="col-xl-3 col-lg-4">
         <aside className={`blog-sidebar ${style_1 ? "blog-sidebar-two" : ""}`}>
            <div className="glass-panel p-4 mb-30 shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
               <div className="sidebar-search-form">
                  <form onSubmit={(e) => e.preventDefault()} className="position-relative">
                     <input 
                        type="text" 
                        placeholder="Search articles..." 
                        style={{ width: '100%', padding: '12px 20px', paddingRight: '50px', border: '1px solid #eee', borderRadius: '12px', outline: 'none', fontSize: '0.9rem' }}
                     />
                     <button className="position-absolute end-0 top-0 h-100 px-3 bg-transparent border-0 text-primary">
                        <i className="fas fa-search"></i>
                     </button>
                  </form>
               </div>
            </div>
            
            <div className="glass-panel p-4 mb-30 shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
               <Categories />
            </div>
            
            <div className="glass-panel p-4 mb-30 shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
               <LatestPost />
            </div>
            
            <div className="glass-panel p-4 shadow-sm" style={{ border: '1px solid var(--glass-border)', background: 'white' }}>
               <Tags />
            </div>
         </aside>
      </div>
   )
}

export default BlogSidebar
