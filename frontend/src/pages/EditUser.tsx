import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminUpdateUserBodySchema } from '../schemas/userSchema';
import { userService } from '../services/userService';
import AdminLayout from '../components/AdminLayout';

const EditUser = () => {

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        profilPictureUrl: undefined, // ? attention, il faut ce champ pour supprimer une photo de profil ... alors on laisse en undefined ? je ne sais pas ! et les champs sont optionnels alors faut-il le noter qq part ? + si ce champ ne peut pas être undefined ou null et qu'il y ait un file ...  
        role: ''
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removePicture, setRemovePicture] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [successMessage, setSuccessMessage] = useState('');

     const hasChanges = () => {
        if (!initialData) return false;

        return (
            formData.username !== initialData.username ||
            formData.email !== initialData.email ||
            formData.profilPictureUrl !== initialData.profilPictureUrl ||
            formData.role !== initialData.role ||
            selectedFile !== null ||
            removePicture
        );
    };


    // ===== EXISTING USER DATA LOAD ===== //
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const user = await userService.getById(id);
                setFormData({
                    username: user.username,
                    email: user.email,
                    profilPictureUrl: user.profilPictureUrl,
                    role: user.role
                })
                setInitialData({
                    username: user.username,
                    email: user.email,
                    profilPictureUrl: user.profilPictureUrl,
                    role: user.role
                })
            } catch (error) {
                console.error('Erreur lors du chargement des données utilisateur:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

    }, [id]);


    // ===== VALIDATION ===== //

    const validateField = (name, value) => {
        try {
            // Schéma partiel pour update
            const fieldSchema = (adminUpdateUserBodySchema as any).pick({ [name]: true });
            fieldSchema.parse({ [name]: value});

            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [name]: error.issues[0]?.message || 'Erreur de validation'
                }));
            }
        }
    }


    // === HANDLERS === //

    // ----- Form ----- //
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    }

    // ----- File ----- //
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, profilPicture: 'Seules les images sont acceptées' }));
                setSelectedFile(null);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profilPicture: 'Le fichier est trop volumineux (max 5MB)' }));
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.profilPicture;
                return newErrors;
            });
        }
    };

    // ===== SUBMIT ===== //

    // Normalement, on devrait faire un useEffect pour charger les données de l'utilisateur à modifier, pré-remplir le formData, etc. Mais pour l'instant, on se concentre sur le submit.
    // + je dois aussi vérifier que au moins un champs est modifié.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('')// est ce que ici j'ai besoin de mettre  vu qu'il est déjà défini plus haut ? 
        try {

            const validatedData = adminUpdateUserBodySchema.parse(formData);
            setErrors({});

            setLoading(true); // c'est déjà fait en haut, ai-je besoin de le remettre ici ?

            const formDataToSend = new FormData(); // Ah oui c'est une instance ?
            formDataToSend.append('username', validatedData.username);
            formDataToSend.append('email', validatedData.email);
            formDataToSend.append('role', validatedData.role);

            if (selectedFile) {
                formDataToSend.append('profilPictureUrl', selectedFile);
            }

            if (removePicture) {
                formDataToSend.append('removePicture', 'true');
            }

             if (!hasChanges()) {
                setErrors({ submit: 'Aucune modification détectée' });
                return;
            }

            const updatedUser = await userService.update(id, formDataToSend);
            setSuccessMessage(`✅ Utilisateur ${updatedUser.username} créé avec succès !`);

            setFormData({
                'username': '',
                'email': '',
                'role': '',
                'profilPictureUrl': undefined
            })
            setSelectedFile(null);

            setTimeout(() => {
                navigate('/admin/users'); // Rediriger vers la liste des utilisateurs après 3 secondes   
            }, 2000);

        } catch (error) {
            if (error instanceof z.ZodError) {
                const zodErrors = {};
                error.issues.forEach(err => {
                    const fieldName = err.path?.[0];
                    if (fieldName && !zodErrors[fieldName]) zodErrors[fieldName] = err.message;
                });
                setErrors(zodErrors);
            } else if (error?.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: error.message || 'Erreur inconnue' });
            }
        }
        finally {
            setLoading(false);
        }
    };


    // ===== RENDER ===== //

    return (
        <AdminLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h2>Modifier un utilisateur</h2>

                {/* Message de succès */}
                {successMessage && (
                    <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                        {successMessage}
                    </div>
                )}

                {/* Message d'erreur serveur */}
                {errors.submit && (
                    <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ===== USERNAME ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="username">Nom d'utilisateur *</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Min 3 caractères"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.username ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.username && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.username}
                            </span>
                        )}
                    </div>

                    {/* ===== EMAIL ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="user@example.com"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.email ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.email && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.email}
                            </span>
                        )}
                    </div>


                    {/* ===== ROLE ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="role">Rôle *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.role ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        >
                            <option value="USER">Utilisateur</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {errors.role && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.role}
                            </span>
                        )}
                    </div>

                    {/* ===== PROFILE PICTURE ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="profilePicture">Photo de profil (optionnel)</label>
                        <input
                            id="profilePicture"
                            type="file"
                            name="profilePicture"
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.profilPicture ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {selectedFile && (
                            <small style={{ display: 'block', marginTop: '5px', color: '#28a745' }}>
                                ✅ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}KB)
                            </small>
                        )}
                        {errors.profilPicture && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.profilPicture}
                            </span>
                        )}
                        {formData.profilPictureUrl && !selectedFile && (
                            <div>
                                <img src={`http://localhost:3000${formData.profilPictureUrl}`} width="100" />
                                <button type="button"
                                    onClick={() => {
                                        setRemovePicture(true);
                                        setSelectedFile(null);
                                        setFormData(prev => ({ ...prev, profilPictureUrl: null }));
                                    }}
                                >
                                    Supprimer la photo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ===== SUBMIT BUTTON ===== */}
                    <button
                        type="submit"
                        disabled={loading || !hasChanges()}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: loading || !hasChanges() ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading || !hasChanges() ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Modification en cours...' : 'Modifier l\'utilisateur'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )

};

export default EditUser;