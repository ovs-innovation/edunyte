import { Link } from "react-router-dom";

interface DataType {
   id: number;
   name: string;
   enroll: number;
   rating: number;
};

const table_data: DataType[] = [
   { id: 1, name: "Advanced Accounting Principles", enroll: 50, rating: 5 },
   { id: 2, name: "Digital Marketing Mastery", enroll: 43, rating: 4 },
   { id: 3, name: "Modern Web Design 2024", enroll: 36, rating: 5 },
   { id: 4, name: "Graphic Design Fundamentals", enroll: 22, rating: 4 },
];

const DashboardReviewTable = () => {
   return (
      <div className="table-responsive glass-panel p-4 border-0 shadow-sm" style={{ background: 'white' }}>
         <table className="table table-borderless align-middle m-0">
            <thead>
               <tr className="border-bottom">
                  <th className="pb-3 fw-bold opacity-50 small text-uppercase" style={{ letterSpacing: '1px' }}>Course Name</th>
                  <th className="pb-3 fw-bold opacity-50 small text-uppercase" style={{ letterSpacing: '1px' }}>Enrolled</th>
                  <th className="pb-3 fw-bold opacity-50 small text-uppercase" style={{ letterSpacing: '1px' }}>Average Rating</th>
               </tr>
            </thead>
            <tbody>
               {table_data.map((list) => (
                  <tr key={list.id}>
                     <td className="py-4">
                        <Link to="/course-details" className="text-dark fw-bold text-decoration-none hover-text-primary transition-all">
                            {list.name}
                        </Link>
                     </td>
                     <td className="py-4">
                        <span className="badge px-3 py-2 rounded-3 text-dark" style={{ background: 'rgba(0,0,0,0.03)', fontWeight: 700 }}>
                            {list.enroll} Students
                        </span>
                     </td>
                     <td className="py-4">
                        <div className="d-flex align-items-center gap-1 text-warning">
                           {[...Array(5)].map((_, i) => (
                              <i key={i} className={`${i < list.rating ? 'fas' : 'far'} fa-star`} style={{ fontSize: '0.85rem' }}></i>
                           ))}
                           <span className="ms-2 text-dark small fw-bold">({list.rating}.0)</span>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   )
}

export default DashboardReviewTable
