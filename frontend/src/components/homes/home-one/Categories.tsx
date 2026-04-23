import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories, type Category } from '../../../services/categoryService';
import { Link } from 'react-router-dom';

const Categories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const response = await fetchCategories('active');
                setCategories(response.categories.slice(0, 8));
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const getCategoryIcon = (index: number) => {
        const icons = [
            "flaticon-graphic-design",
            "flaticon-investment",
            "flaticon-coding",
            "flaticon-email",
            "flaticon-fashion",
            "flaticon-interaction",
            "flaticon-web-design",
        ];
        return icons[index % icons.length];
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        return `${baseUrl.replace(/\/api$/, '')}/${imagePath.replace(/^\//, '')}`;
    };

    return (
        <section style={{ backgroundColor: '#fcfaf8', padding: '50px 0' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '10px' }}>Learn a Category</h2>
                        <p style={{ fontSize: '1.1rem', color: '#6d6d6d', margin: 0 }}>Discover online tutors for any subject</p>
                    </div>
                </div>

                <div className="row">
                    {categories.map((cat, index) => (
                        <div key={cat._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                            <Link to={`/courses?category=${cat.slug || cat._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%' }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; }}
                                >
                                    <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: cat.image ? 'transparent' : '#eef6f6', borderRadius: '50%' }}>
                                        {cat.image ? (
                                            <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            <i className={getCategoryIcon(index)} style={{ fontSize: '1.5rem', color: '#3bb3bd' }}></i>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</h4>
                                        <div style={{ fontSize: '0.9rem', color: '#6d6d6d' }}>View courses</div>
                                    </div>
                                    <i className="fas fa-chevron-right" style={{ marginLeft: '10px', color: '#c4c4c4', fontSize: '0.9rem' }}></i>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Link to="/courses" style={{ display: 'inline-block', backgroundColor: 'transparent', color: '#1a1a1a', border: '2px solid #eaeaea', borderRadius: '8px', padding: '12px 30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s', textDecoration: 'none' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#eaeaea'; }}
                    >
                        Explore all subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Categories;
