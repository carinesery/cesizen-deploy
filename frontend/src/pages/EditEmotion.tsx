import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { updateEmotionBodySchema } from '../schemas/emotionSchema';
import { emotionService } from '../services/emotionService';
import AdminLayout from '../components/AdminLayout';
import { LevelEmotionEnum } from '../schemas/emotionSchema';

const EditEmotion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parentEmotions, setParentEmotions] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [removePicture, setRemovePicture] = useState(false);


    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: '',
        parentEmotionId: '',
        iconUrl: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    // Les erreurs de validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Message de succès
    const [successMessage, setSuccessMessage] = useState('');


    // Fonction pour vérifier s'il y a des changements dans le formulaire
    const hasChanges = () => {
        if (!initialData) return false;

        return (
            formData.title !== initialData.title ||
            formData.description !== initialData.description ||
            formData.parentEmotionId !== initialData.parentEmotionId ||
            formData.level !== initialData.level ||
            selectedFile !== null ||
            removePicture // si l'utilisateur a choisi de supprimer la photo
        );
    };


    // ========== CHARGEMENT DES ÉMOTIONS POUR LE SELECT ========== //
    useEffect(() => {
        const fetchEmotions = async () => {
            try {
                const data = await emotionService.getAll();
                console.log("Toutes les émotions:", data);
                setParentEmotions(data
                    .filter(emotion => emotion.level === LevelEmotionEnum.LEVEL_1)
                    .map(emotion => ({ title: emotion.title, id: emotion.idEmotion })));

                const emotion = await emotionService.getById(id);

                setFormData({
                    title: emotion.title,
                    description: emotion.description,
                    level: emotion.level,
                    parentEmotionId: emotion.parentEmotionId,
                    iconUrl: emotion.iconUrl
                });

                setInitialData({
                    title: emotion.title,
                    description: emotion.description,
                    level: emotion.level,
                    parentEmotionId: emotion.parentEmotionId,
                    iconUrl: emotion.iconUrl
                })

            } catch (error) {
                console.error('Erreur lors du chargement des émotions:', error);
            }
        };
        fetchEmotions();
    }, [id]);

    // ========= VALIDATION SCHEMA ======== //

    // ========== VALIDATION ==========
    // Valide UN champ à la fois (quand tu quittes le champ - onBlur)
    const validateField = (name, value) => {
        try {
            // On crée un schéma partiel juste pour ce champ
            const fieldSchema = (updateEmotionBodySchema as any).pick({ [name]: true });
            fieldSchema.parse({ [name]: value });


            // Si valide, enlever l'erreur pour ce champ
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Ajouter le message d'erreur Zod
                setErrors(prev => ({
                    ...prev,
                    [name]: error.issues[0]?.message || 'Erreur de validation'
                }));
            }
        }
    };

    // ========== HANDLERS ========== //
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Quand tu quittes un input (validation en temps réel)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    // Quand tu sélectionnes un fichier image
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérifier que c'est une image
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    iconUrl: 'Seules les images sont acceptées'
                }));
                setSelectedFile(null);
                return;
            }

            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    iconUrl: 'Le fichier est trop volumineux (max 5MB)'
                }));
                setSelectedFile(null);
                return;
            }

            // OK, on sauvegarde le fichier
            setSelectedFile(file);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.iconUrl;
                return newErrors;
            });
        }
    };


    // ========== SUBMISSION ========== //
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        try {

            setLoading(true);

            const validatedData = updateEmotionBodySchema.parse(formData);
            setErrors({});

            const formDataToSend = new FormData();
            formDataToSend.append('title', validatedData.title);
            formDataToSend.append('description', validatedData.description);
            formDataToSend.append('level', validatedData.level);


            if (validatedData.parentEmotionId) {
                formDataToSend.append('parentEmotionId', validatedData.parentEmotionId);
            }

            if (selectedFile) {
                formDataToSend.append('iconUrl', selectedFile);
            }

            if (removePicture) {
                formDataToSend.append('removeIcon', 'true');
                setRemovePicture(true); // reset du state
            }

            if (!hasChanges()) {
                setErrors({ submit: 'Aucune modification détectée' });
                return;
            }

            // 3. Appeler le service backend
            const updatedEmotion = await emotionService.update(id, formDataToSend);

            // 4. Afficher succès
            setLoading(false);
            setSuccessMessage(`✅ Émotion ${updatedEmotion.title} modifiée avec succès !`);

            // 5. Réinitialiser le formulaire
            setFormData({
                title: '',
                description: '',
                level: '',
                parentEmotionId: '',
                iconUrl: ''
            });
            setSelectedFile(null);

            // 6. Rediriger après 2 secondes
            setTimeout(() => {
                navigate('/admin/emotions');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div style={styles.container}>
                {successMessage && (
                    <div style={{
                        background: '#d4edda',
                        color: '#155724',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {successMessage}
                    </div>
                )}
                {errors.submit && (
                    <div style={styles.error}>
                        {errors.submit}
                    </div>
                )}
                <button
                    onClick={() => navigate('/admin/emotions')}
                    style={styles.backBtn}
                >
                    ← Retour
                </button>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2>Modifier l'émotion</h2>

                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label>Titre *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            onBlur={handleBlur}
                            placeholder="Titre de l'émotion"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={{ ...styles.input, minHeight: '80px' }}
                            onBlur={handleBlur}
                            placeholder="Décrivez l'émotion ici"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label>Niveau *</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                style={styles.input}
                                onBlur={handleBlur}
                            >
                                <option value={LevelEmotionEnum.LEVEL_1}>Emotion principale</option>
                                <option value={LevelEmotionEnum.LEVEL_2}>Emotion secondaire (sentiment)</option>
                            </select>
                        </div>

                       
                        <div style={styles.formGroup}>
                            <label>Émotion parente</label>
                            <select disabled={formData.level === LevelEmotionEnum.LEVEL_1} // Désactiver si c'est une émotion de niveau 1
                                name="parentEmotionId"
                                value={formData.parentEmotionId || ""}
                                onChange={handleChange}
                                style={styles.input}
                                onBlur={handleBlur}
                            >
                                <option value="">-- Choisir une émotion parente --</option>
                                {parentEmotions.map(emotion => (
                                    <option key={emotion.id} value={emotion.id}>
                                        {emotion.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.row}>
                        {/* ===== ICÔNE ===== */}
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="iconUrl">Icône de l'émotion</label>
                            <input
                                id="iconUrl"
                                type="file"
                                name="iconUrl"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: errors.iconUrl ? '2px solid #dc3545' : '1px solid #ddd',
                                    boxSizing: 'border-box',
                                    marginTop: '5px'
                                }}
                            />
                            {selectedFile && (
                                <small style={{ display: 'block', marginTop: '5px', color: '#28a745' }}>
                                    ✅ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}KB)
                                </small>
                            )}
                            {errors.iconUrl && (
                                <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                    {errors.iconUrl}
                                </span>
                            )}
                            {formData.iconUrl && !selectedFile && (
                                <div>
                                    <img src={`http://localhost:3000${formData.iconUrl}`} width="100" />
                                    <button type="button"
                                        onClick={() => {
                                            setRemovePicture(true);
                                            setSelectedFile(null);
                                            setFormData(prev => ({ ...prev, iconUrl: null }));
                                        }}
                                    >
                                        Supprimer la photo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/emotions')}
                            style={{ ...styles.btn, background: '#95a5a6' }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !hasChanges}
                            style={{ ...styles.btn, background: loading || !hasChanges() ? '#95a5a6' : '#27ae60' }}
                        >
                            {loading ? 'Modification' : 'Modifier l\'émotion'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: '800px',
    },
    backBtn: {
        backgroundColor: '#95a5a6',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
        fontSize: '14px',
    },
    form: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    formGroup: {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '5px',
        fontSize: '14px',
        fontFamily: 'inherit',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
    },
    btn: {
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        flex: 1,
    },
};

export default EditEmotion;