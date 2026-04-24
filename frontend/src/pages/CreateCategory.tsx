import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { categoryService } from '../services/categoryService';
import AdminLayout from '../components/AdminLayout';
import { createCategoryBodySchema } from '../schemas/categorySchema';

const CreateCategory = () => {
    const navigate = useNavigate();

    // ========== STATE ==========
    const [loading, setLoading] = useState(false);

    // Les données du formulaire + image
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Les erreurs de validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Message de succès
    const [successMessage, setSuccessMessage] = useState('');

    // ========== VALIDATION ==========
    // Valide UN champ à la fois (quand tu quittes le champ - onBlur)
    const validateField = (name, value) => {
        try {
            // On crée un schéma partiel juste pour ce champ
            const fieldSchema = (createCategoryBodySchema as any).pick({ [name]: true });
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

    // ========== HANDLERS ==========
    // Quand tu tapes dans un input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                    profilPicture: 'Seules les images sont acceptées'
                }));
                setSelectedFile(null);
                return;
            }

            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    profilPicture: 'Le fichier est trop volumineux (max 5MB)'
                }));
                setSelectedFile(null);
                return;
            }

            // OK, on sauvegarde le fichier
            setSelectedFile(file);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.profilPicture;
                return newErrors;
            });
        }
    };

    // ========== SUBMISSION ==========
    // Quand tu cliques "Créer une catégorie"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        try {
            // 1. Valider TOUT le formulaire avec Zod
            const validatedData = createCategoryBodySchema.parse(formData);
            setErrors({});

            setLoading(true);

            // 2. Créer FormData pour envoyer fichier + données
            const formDataToSend = new FormData();
            formDataToSend.append('title', validatedData.title);
            formDataToSend.append('description', validatedData.description || '');

            if (selectedFile) {
                formDataToSend.append('iconUrl', selectedFile);
            }

            // 3. Appeler le service backend
            const { category}  = await categoryService.create(formDataToSend);

            // 4. Afficher succès
            setSuccessMessage(`✅ Catégorie ${category.title} créée avec succès !`);

            // 5. Réinitialiser le formulaire
            setFormData({
                title: '',
                description: '',
            });
            setSelectedFile(null);

            // 6. Rediriger après 2 secondes
            setTimeout(() => {
                navigate('/admin/categories');
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

    // ========== RENDER ==========
    return (
        <AdminLayout>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h2>Créer une catégorie</h2>

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
                    {/* ===== TITLE ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="title">Titre *</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Min 1 caractère"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.title ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.title && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.title}
                            </span>
                        )}
                    </div>

                    {/* ===== DESCRIPTION ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="description">Description</label>
                        <input
                            id="description"
                            type="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Décrivez ici la catégorie"
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.description ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.description && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.description}
                            </span>
                        )}
                    </div>


                    {/* ===== ICON CATEGORIE ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="icon">Icône de la catégorie (optionnel)</label>
                        <input
                            id="icon"
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
                    </div>

                    {/* ===== SUBMIT BUTTON ===== */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: loading ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Création en cours...' : 'Créer la catégorie'}
                    </button>
                </form>
            </div>
        </AdminLayout>

    );
};
export default CreateCategory;