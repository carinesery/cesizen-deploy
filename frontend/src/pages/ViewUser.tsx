import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import AdminLayout from '../components/AdminLayout';

const ViewUser = () => {
    const { id } = useParams(); // Récupère l'ID de l'URL
    const navigate = useNavigate();

    // ========== STATE ==========
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // ========== CHARGEMENT DES DONNÉES ==========
    useEffect(() => {
        fetchUser();
    }, [id]); // Recharge si l'ID change

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await userService.getById(id);
            setUser(data);
        } catch (err) {
            setError('Erreur lors du chargement de l\'utilisateur');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ========== ACTIONS ==========
    const handleToggleStatus = async () => {
        if (!user) return;
        try {
            setActionLoading(true);
            await userService.setActiveStatus(id, !user.isActive);
            // Recharger les données après l'action
            fetchUser();
        } catch (err) {
            setError('Erreur lors de la mise à jour du statut');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }
        try {
            setActionLoading(true);
            await userService.delete(id);
            // Rediriger vers la liste des utilisateurs
            navigate('/admin/users');
        } catch (err) {
            setError('Erreur lors de la suppression');
            console.error(err);
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

    if (error || !user) {
        return (
            <AdminLayout>
                <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                    {error || 'Utilisateur non trouvé'}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h2>Détails de l'utilisateur</h2>

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

                {/* ===== INFOS DE L'UTILISATEUR ===== */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {/* Email */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Email</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {user.email}
                        </p>
                    </div>

                    {/* Username */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Nom d'utilisateur</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {user.username}
                        </p>
                    </div>

                    {/* Rôle */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Rôle</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px' }}>
                            {user.role === 'ADMIN' ? '👑 Administrateur' : '👤 Utilisateur'}
                        </p>
                    </div>

                    {/* Statut */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Statut</label>
                        <p style={{
                            margin: '5px 0 0 0',
                            padding: '8px',
                            background: user.isActive ? '#d4edda' : '#f8d7da',
                            color: user.isActive ? '#155724' : '#721c24',
                            borderRadius: '4px'
                        }}>
                            {user.isActive ? '✅ Actif' : '❌ Désactivé'}
                        </p>
                    </div>

                    {/* Dates */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Créé le</label>
                        <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px', fontSize: '12px' }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </p>
                    </div>
                    {user.disabledAt && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', color: '#333' }}>Modifié le</label>
                            <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px', fontSize: '12px' }}>
                                {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}
                    {user.disabledAt && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', color: '#333' }}>Désactivé le</label>
                            <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px', fontSize: '12px' }}>
                                {new Date(user.disabledAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}
                    {user.deletedAt && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', color: '#333' }}>Supprimé le</label>
                            <p style={{ margin: '5px 0 0 0', padding: '8px', background: 'white', borderRadius: '4px', fontSize: '12px' }}>
                                {new Date(user.deletedAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}
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
                        onClick={() => navigate('/admin/users')}
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
                    {!user.deletedAt && (
                        <button
                            onClick={() => navigate(`/admin/users/${id}/edit`)}
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
                    )}

                    {/* Bouton Désactiver / Activer */}
                    {!user.deletedAt && (
                        <button
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            style={{
                                flex: 1,
                                padding: '10px 20px',
                                background: user.isActive ? '#dc3545' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                opacity: actionLoading ? 0.7 : 1
                            }}
                        >

                            {user.isActive ? '🔴 Désactiver' : '🟢 Activer'}
                        </button>
                    )}

                    {/* Bouton Supprimer */}
                    {!user.deletedAt && (
                        < button
                            onClick={handleDelete}
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
        </AdminLayout >
    );
};

export default ViewUser;
