import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [needsConsent, setNeedsConsent] = useState(false);
    const [legalToken, setLegalToken] = useState<string | null>(null);

    const [termsConsent, setTermsConsent] = useState(false);
    const [privacyConsent, setPrivacyConsent] = useState(false);

    const token = searchParams.get("token");

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                console.log('🔍 Token reçu de l\'URL:', token);
                const response = await userService.confirmEmail(token);

                console.log('✅ Réponse de confirmEmail:', response);

                setMessage(response.message);
                setNeedsConsent(response.needsTermsConsent);

                if (response.legalToken) {
                    console.log('✅ legalToken reçu:', response.legalToken);
                    setLegalToken(response.legalToken);
                } else {
                    console.warn('⚠️ Pas de legalToken dans la réponse');
                }
            } catch (err) {
                console.error('❌ Erreur lors de la confirmation email:', err);
                setMessage("Lien invalide ou expiré");
            } finally {
                setLoading(false);
            }
        };

        if (token) confirmEmail();
    }, [token]);

    const handleAccept = async () => {
        try {
            console.log('🚀 Envoi acceptLegal avec:');
            console.log('  - termsConsent:', termsConsent);
            console.log('  - privacyConsent:', privacyConsent);
            console.log('  - legalToken:', legalToken);

            if (!legalToken) {
                console.error('❌ ERROR: legalToken est undefined ou null!');
                setMessage("Erreur: token manquant");
                return;
            }

            const response = await userService.acceptLegal(termsConsent, privacyConsent, legalToken);

            console.log('✅ Réponse acceptLegal:', response);
            setMessage(response.message);
            setNeedsConsent(false);

            // ✅ Redirection vers login
            navigate("/login", { replace: true });
            // replace: true évite de revenir à cette page avec le bouton "back"

        } catch (err) {
            console.error('❌ Erreur acceptLegal:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Erreur lors de l'acceptation des conditions");
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <div>
            <h1>Confirmation email</h1>
            <p>{message}</p>

            {needsConsent && (
                <div>
                    <h2>Conditions d'utilisation</h2>

                    <label>
                        <input
                            type="checkbox"
                            checked={termsConsent}
                            onChange={(e) => setTermsConsent(e.target.checked)}
                        />
                        J'accepte les conditions d'utilisation
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={privacyConsent}
                            onChange={(e) => setPrivacyConsent(e.target.checked)}
                        />
                        J'accepte la politique de confidentialité
                    </label>

                    <button disabled={!termsConsent || !privacyConsent || !legalToken}
                        onClick={handleAccept}>
                        Valider
                    </button>
                </div>
            )}
        </div>
    );
}