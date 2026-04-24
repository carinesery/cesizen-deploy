import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emotionService } from '../services/emotionService';
import AdminLayout from '../components/AdminLayout';
import { LevelEmotionEnum } from '../schemas/emotionSchema';

const ViewEmotion = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ========== STATE ==========
    const [emotion, setEmotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // ========== CHARGEMENT DES DONNÉES ==========
    useEffect(() => {
        fetchEmotion();
    }, [id]); // Recharge si le slug change

    const fetchEmotion = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await emotionService.getById(id);
            setEmotion(data);
        } catch (err) {
            setError('Erreur lors du chargement de l\'émotion');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ========== ACTIONS POUR AMELIORER L'UX ========== //

    const handleDeleteEmotion = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette émotion ?')) return;

        try {
            setActionLoading(true);
            await emotionService.delete(id);
            navigate('/admin/emotions');
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

    if (error || !emotion) {
        return (
            <AdminLayout>
                <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                    {error || 'Émotion non trouvée'}
                </div>
            </AdminLayout>
        );
    }

    const LevelLabels = {
        [LevelEmotionEnum.LEVEL_1]: "Principale (niveau 1)",
        [LevelEmotionEnum.LEVEL_2]: "Secondaire (niveau 2 = sentiment)"
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h2>Détails de l'émotion</h2>

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

                {/* ===== INFOS DE L'ÉMOTION ===== */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {/* Titre */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Titre</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {emotion.title}
                        </p>
                    </div>
                     {/* Niveau */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Niveau</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {LevelLabels[emotion.level]}
                        </p>
                    </div>

                      {/* Emotion parent */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Emotion principale associée</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {emotion.parentEmotionId || '-'}
                        </p>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Description</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {emotion.description || '-'}
                        </p>
                    </div>

                    {/* Icon */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Icon</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {emotion.iconUrl ? <img src={`http://localhost:3000${emotion.iconUrl}`} alt="Icon" style={{ maxWidth: '100px', maxHeight: '100px' }} /> : '-'}
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
                        onClick={() => navigate('/admin/emotions')}
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
                        onClick={() => navigate(`/admin/emotions/${id}/edit`)}
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
                     {emotion.childEmotions.length === 0 && (
                    <button
                        onClick={() => handleDeleteEmotion(id)}
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
                     )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ViewEmotion;
