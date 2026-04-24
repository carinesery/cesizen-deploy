import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import AdminLayout from '../components/AdminLayout';

const ViewCategory = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // ========== STATE ==========
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // ========== CHARGEMENT DES DONNÉES ==========
    useEffect(() => {
        fetchCategory();
    }, [slug]); // Recharge si le slug change

    const fetchCategory = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await categoryService.getBySlug(slug);
            setCategory(data);
        } catch (err) {
            setError('Erreur lors du chargement de la catégorie');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ========== ACTIONS POUR AMELIORER L'UX ========== //

    const handleDeleteCategory = async (slug) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            setActionLoading(true);
            await categoryService.delete(slug);
            navigate('/admin/categories');
        } catch (err) {
            alert('Erreur lors de la suppression');
        } finally {
            setActionLoading(false);
        }
    };

    // ========== RENDER ==========
    if (loading) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Chargement...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error || !category) {
        return (
            <AdminLayout>
                <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                    {error || 'Catégorie non trouvée'}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h2>Détails de la catégorie</h2>

                {/* Message d'erreur des actions */}
                {error && (
                    <div style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {/* ===== INFOS DE LA CATÉGORIE ===== */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {/* Nom */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Nom</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {category.title}
                        </p>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Description</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {category.description || '-'}
                        </p>
                    </div>

                    {/* Icon */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Icon</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {category.iconUrl ? <img src={`http://localhost:3000${category.iconUrl}`} alt="Icon" style={{ maxWidth: '100px', maxHeight: '100px' }} /> : '-'}
                        </p>
                    </div>
                </div>

                {/* ===== ACTIONS =====*/}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                }}>
                    {/* Bouton Retour */}
                    <button
                        onClick={() => navigate('/admin/categories')}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ← Retour
                    </button>

                    {/* Bouton Modifier */}
                    <button
                        onClick={() => navigate(`/admin/categories/${slug}/edit`)}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ✏️ Modifier
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                        onClick={() => handleDeleteCategory(slug)}
                        disabled={actionLoading}
                        style={{
                            flex: 1,
                            padding: '10px 20px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: actionLoading ? 0.7 : 1
                        }}
                    >
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ViewCategory;
