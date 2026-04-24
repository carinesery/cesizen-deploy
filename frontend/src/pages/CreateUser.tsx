import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { createUserSchema } from '../schemas/userSchema';
import { userService } from '../services/userService';
import AdminLayout from '../components/AdminLayout';

const CreateUser = () => {
    const navigate = useNavigate();
    
    // ========== STATE ==========
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Les données du formulaire
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER'
    });

    // Les erreurs de validation
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Message de succès
    const [successMessage, setSuccessMessage] = useState('');

    // ========== VALIDATION ==========
    // Valide UN champ à la fois (quand tu quittes le champ - onBlur)
    const validateField = (name, value) => {
        try {
            // On crée un schéma partiel juste pour ce champ
            const fieldSchema = (createUserSchema as any).pick({ [name]: true });
            fieldSchema.parse({ [name]: value });
            
            // Si password ou confirmPassword, valider aussi que les deux correspondent
            if (name === 'password' || name === 'confirmPassword') {
                createUserSchema.parse({
                    ...formData,
                    [name]: value
                });
            }

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
    // Quand tu cliques "Créer l'utilisateur"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        try {
            // 1. Valider TOUT le formulaire avec Zod
            const validatedData = createUserSchema.parse(formData);
            setErrors({});
            
            setLoading(true);

            // 2. Créer FormData pour envoyer fichier + données
            const formDataToSend = new FormData();
            formDataToSend.append('username', validatedData.username);
            formDataToSend.append('email', validatedData.email);
            formDataToSend.append('password', validatedData.password);
            formDataToSend.append('confirmPassword', validatedData.confirmPassword);
            formDataToSend.append('role', validatedData.role);

            if (selectedFile) {
                formDataToSend.append('profilPictureUrl', selectedFile);
            }

            // 3. Appeler le service backend
            const newUser = await userService.create(formDataToSend);
            
            // 4. Afficher succès
            setSuccessMessage(`✅ Utilisateur ${newUser.username} créé avec succès !`);
            
            // 5. Réinitialiser le formulaire
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'USER'
            });
            setSelectedFile(null);

            // 6. Rediriger après 2 secondes
            setTimeout(() => {
                navigate('/admin/users');
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
                <h2>Créer un utilisateur</h2>

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

                    {/* ===== PASSWORD ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="password">Mot de passe *</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Min 8 caractères"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.password ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.password && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.password}
                            </span>
                        )}
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            Doit contenir: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                        </small>
                    </div>

                    {/* ===== CONFIRM PASSWORD ===== */}
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Réentrer le mot de passe"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: errors.confirmPassword ? '2px solid #dc3545' : '1px solid #ddd',
                                boxSizing: 'border-box',
                                marginTop: '5px'
                            }}
                        />
                        {errors.confirmPassword && (
                            <span style={{ color: '#dc3545', fontSize: '12px' }}>
                                {errors.confirmPassword}
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
                        {loading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateUser;