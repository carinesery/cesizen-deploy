import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import AdminLayout from '../components/AdminLayout';
import { COLORS } from '../constants/themes';
import { ButtonAction } from '../components/ButtonAction';
import { IoEyeOutline, IoPencilSharp, IoTrashBinOutline } from 'react-icons/io5';
import { ButtonCreateEntity } from '../components/ButtonCreateEntity';

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getAll();
      setArticles(data);
    } catch (err) {
      setError('Erreur lors du chargement des articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log(articles);

  const handleDeleteArticle = async (slug) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }
    try {
      await articleService.delete(slug);
      setArticles(articles.filter(a => a.slug !== slug));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'article');
      console.error(err);
    }
  };

  const statusLabels = {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    ARCHIVED: "Archivé"
  };

  if (loading) return <AdminLayout><div>Chargement...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: 'red' }}>{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Articles</h2>
          <ButtonCreateEntity title="+ Nouvel article" onClick={() => navigate('/admin/articles/create')} />
        </div>

        {articles.length === 0 ? (
          <p>Aucun article</p>
        ) : (
          <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Catégories</th>
                <th style={styles.th}>Création</th>
                <th style={styles.th}>Mise à jour</th>
                <th style={{ ...styles.th, width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.idArticle} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{article.title}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: article.status === 'PUBLISHED' ? '#CCF0E8' : article.status === 'DRAFT' ? '#FED95D33' : '#E2E7FF',
                      color: article.status === 'PUBLISHED' ? '#06909A' : article.status === 'DRAFT' ? '#996B00' : '#4A4A8A',
                    }}>
                      {statusLabels[article.status]}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: COLORS.neutral.gray }}>{article.categories.map(cat => cat.title).join(', ')}</td>
                  <td style={styles.td}>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('fr-FR') : '-'}</td>
                  <td style={styles.actionsCell}>
                    <ButtonAction
                      bgColor={COLORS.backgroundVisible}
                      onClick={() => navigate(`/admin/articles/${article.slug}`)}
                      icon={<IoEyeOutline size={20} color={COLORS.accent} />}
                    />
                    <ButtonAction
                      bgColor={COLORS.accent}
                      onClick={() => navigate(`/admin/articles/${article.slug}/edit`)}
                      icon={<IoPencilSharp size={20} />}
                    />
                    <ButtonAction
                      bgColor={COLORS.backgroundDelete}
                      onClick={() => handleDeleteArticle(article.slug)}
                      icon={<IoTrashBinOutline size={20} color={COLORS.delete} />}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px 16px 0 16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexShrink: 0,
    overflowY: 'auto',
    scrollbarGutter: 'stable',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    scrollbarGutter: 'stable',
  },
  btn: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    width: '200px',
    boxSizing: 'border-box' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: COLORS.neutral.gray,
    borderBottom: `2px solid ${COLORS.neutral.borderGray}`,
  },
  tr: {
    borderBottom: `1px solid ${COLORS.neutral.borderGray}`,
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: COLORS.text,
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
};

export default Articles;
