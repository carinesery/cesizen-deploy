import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { articleService } from '../services/articleService';
import AdminLayout from '../components/AdminLayout';

const ViewArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const data = await articleService.getBySlug(slug);
      setArticle(data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><div>Chargement...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: 'red' }}>{error}</div></AdminLayout>;
  if (!article) return <AdminLayout><div>Article non trouvé</div></AdminLayout>;

  const statusLabels = {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    ARCHIVED: "Archivé"
  };

  const handleDeleteArticle = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {   
      await articleService.delete(slug);
      navigate('/admin/articles');
      } catch (err) {
        setError('Erreur lors de la suppression de l\'article');
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <button onClick={() => navigate('/admin/articles')} style={styles.backBtn}>
          ← Retour
        </button>

        <article style={styles.article}>
          <h1>{article.title}</h1>

          {article.presentationImageUrl && (
            <img
              src={`http://localhost:3000${article.presentationImageUrl}`}
              alt={article.title}
              style={styles.image}
            />
          )}

          <div style={styles.meta}>
            <span>Statut: <strong>{statusLabels[article.status]}</strong></span>
            <span>Créé: {new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
            {article.updatedAt && (
              <span>Modifié: {new Date(article.updatedAt).toLocaleDateString('fr-FR')}</span>
            )}
          </div>

          
            <div style={styles.summary}>
              <h3>Résumé</h3>
              <p>{article.summary}</p>
            </div>
          

          <div style={styles.content}>
            <h3>Contenu</h3>
            <p>{article.content}</p>
          </div>

          {/* {article.categories && article.categories.length > 0 && ( */}
            <div style={styles.categories}>
              <h3>Catégories</h3>
              <div style={styles.categoryList}>
                {article.categories.map((cat) => (
                  <span key={cat.slug} style={styles.categoryTag}>
                    {cat.title}
                  </span>
                ))}
              </div>
            </div>
          {/* )} */}

          <div style={styles.actions}>
            <button
              onClick={() => navigate(`/admin/articles/${slug}/edit`)}
              style={{ ...styles.btn, background: '#3498db' }}
            >
              ✏️ Éditer
            </button>
            <button style={{ ...styles.btn, background: '#e74c3c' }}
            onClick={() => handleDeleteArticle()}>
              🗑️ Supprimer
            </button>
          </div>
        </article>
      </div>
    </AdminLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
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
  article: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    lineHeight: '1.6',
  },
  image: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    margin: '20px 0',
  },
  meta: {
    display: 'flex',
    gap: '20px',
    padding: '15px',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderLeft: '4px solid #3498db',
    marginBottom: '20px',
  },
  content: {
    marginBottom: '20px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  categories: {
    marginBottom: '20px',
  },
  categoryList: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#e8f4f8',
    color: '#2c3e50',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
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
  },
};

export default ViewArticle;
