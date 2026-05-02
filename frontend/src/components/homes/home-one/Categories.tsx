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
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        return `${baseUrl.replace(/\/api$/, '')}/${imagePath.replace(/^\//, '')}`;
    };

    return (
        <section className="glow-bg" style={{ padding: '80px 0' }}>
            <div className="container position-relative z-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                    <div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '15px' }} className="text-gradient">Learn a Category</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>Discover online tutors for any subject</p>
                    </div>
                </div>

                <div className="row g-4">
                    {categories.map((cat, index) => (
                        <div key={cat._id} className="col-lg-3 col-md-4 col-sm-6">
                            <Link to={`/courses?category=${cat.slug || cat._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', height: '100%' }}>
                                    <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: cat.image ? 'transparent' : 'rgba(255,255,255,0.05)', borderRadius: '16px', border: cat.image ? 'none' : '1px solid var(--glass-border)', flexShrink: 0 }}>
                                        {cat.image ? (
                                            <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '16px' }} />
                                        ) : (
                                            <i className={getCategoryIcon(index)} style={{ fontSize: '1.5rem', color: 'var(--neon-blue)' }}></i>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</h4>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View courses</div>
                                    </div>
                                    <i className="fas fa-chevron-right" style={{ marginLeft: '12px', color: 'var(--neon-purple)', fontSize: '0.9rem', opacity: 0.5 }}></i>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link to="/courses" className="btn-neon-outline">
                        Explore all subjects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Categories;
