import { useState } from "react";
import ReactPaginate from "react-paginate";
import BlogSidebar from "../blog-common/BlogSidebar";
import inner_blog_data from "../../../data/inner-data/BlogData";
import { Link } from "react-router-dom";

interface BlogProps {
   style_1: boolean;
}

const BlogArea = ({ style_1 }: BlogProps) => {

   const blog = inner_blog_data;

   const itemsPerPage = 6;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = blog.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(blog.length / itemsPerPage);
   
   const handlePageClick = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % blog.length;
      setItemOffset(newOffset);
   };

   return (
      <section className="blog-area section-pt-120 pb-120 glow-bg">
         <div className="container">
            <div className="row">
               <div className={`col-xl-9 col-lg-8 ${style_1 ? "order-0 order-lg-2" : ""}`}>
                  <div className="row g-4">
                     {currentItems.map((item) => (
                        <div key={item.id} className="col-xl-6 col-md-6">
                           <div className="glass-panel h-100 shadow-sm overflow-hidden border-0 bg-white hover-scale">
                              <div className="position-relative">
                                 <Link to="/blog-details">
                                    <img src={item.thumb} alt="img" className="w-100" style={{ height: '250px', objectFit: 'cover' }} />
                                 </Link>
                                 <div className="position-absolute bottom-0 start-0 m-3">
                                    <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold shadow-sm">{item.tag}</span>
                                 </div>
                              </div>
                              <div className="p-4">
                                 <div className="d-flex align-items-center gap-3 mb-3 small opacity-60 fw-bold">
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="far fa-calendar-alt"></i> {item.date}
                                    </span>
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="far fa-user"></i> by Admin
                                    </span>
                                 </div>
                                 <h4 className="title mb-3 fw-900" style={{ fontSize: '1.4rem', lineHeight: 1.3 }}>
                                    <Link to="/blog-details" className="text-dark text-decoration-none hover-text-primary transition-all">{item.title}</Link>
                                 </h4>
                                 <Link to="/blog-details" className="fw-bold text-primary small text-uppercase" style={{ letterSpacing: '1px', textDecoration: 'none' }}>
                                    Read Article <i className="fas fa-arrow-right ms-2"></i>
                                 </Link>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                  
                  {pageCount > 1 && (
                     <div className="pagination-wrap mt-50 d-flex justify-content-center">
                        <ReactPaginate
                           breakLabel="..."
                           onPageChange={handlePageClick}
                           pageRangeDisplayed={3}
                           pageCount={pageCount}
                           renderOnZeroPageCount={null}
                           className="pagination d-flex gap-2 p-0 m-0"
                           pageClassName="page-item"
                           pageLinkClassName="page-link rounded-3 border-0 shadow-sm fw-bold px-4 py-2"
                           activeClassName="active"
                           activeLinkClassName="bg-primary text-white"
                           previousLabel="<"
                           nextLabel=">"
                        />
                     </div>
                  )}
               </div>
               <BlogSidebar style_1={style_1} />
            </div>
         </div>
      </section>
   )
}

export default BlogArea
