import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import AdminLayout from '../components/AdminLayout';
import { COLORS } from '../constants/themes';
import { ButtonAction } from '../components/ButtonAction';
import { IoEyeOutline, IoPencilSharp, IoTrashBinOutline } from 'react-icons/io5';
import { ButtonCreateEntity } from '../components/ButtonCreateEntity';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleDeleteCategory = async (slug) => {
          if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
  
          try {
              await categoryService.delete(slug);
              // Mettre à jour la liste localement
              setCategories(categories.filter(c => c.slug !== slug));
          } catch (err) {
              alert('Erreur lors de la suppression');
          }
      };

  if (loading) return <AdminLayout><div>Chargement...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: 'red' }}>{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Catégories</h2>
          <ButtonCreateEntity title="+ Nouvelle catégorie" onClick={() => navigate('/admin/categories/create')} />
        </div>

        {categories.length === 0 ? (
          <p>Aucune catégorie</p>
        ) : (
          <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Icône</th>
                <th style={styles.th}>Nb articles</th>
                <th style={styles.th}>Derniers articles</th>
                <th style={{ ...styles.th, width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.idCategory} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{cat.title}</td>
                  <td style={{ ...styles.td, color: COLORS.neutral.gray }}>-</td>
                  <td style={styles.td}></td>
                  <td style={{ ...styles.td, color: COLORS.neutral.gray }}>-</td>
                  <td style={styles.actionsCell}>
                    <ButtonAction
                      bgColor={COLORS.backgroundVisible}
                      onClick={() => navigate(`/admin/categories/${cat.slug}`)}
                      icon={<IoEyeOutline size={20} color={COLORS.accent} />}
                    />
                    <ButtonAction
                      bgColor={COLORS.accent}
                      onClick={() => navigate(`/admin/categories/${cat.slug}/edit`)}
                      icon={<IoPencilSharp size={20} />}
                    />
                    <ButtonAction
                      bgColor={COLORS.backgroundDelete}
                      onClick={() => handleDeleteCategory(cat.slug)}
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
};

export default Categories;
