import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emotionService } from '../services/emotionService';
import AdminLayout from '../components/AdminLayout';
import { LevelEmotionEnum } from '../schemas/emotionSchema';
import { ButtonAction } from '../components/ButtonAction';
import { COLORS, SPACING } from '../constants/themes';
import { required } from 'zod/mini';
import { IoEyeOutline, IoPencilSharp, IoTrashBinOutline } from 'react-icons/io5';
import { ButtonCreateEntity } from '../components/ButtonCreateEntity';

const Emotions = () => {
  const [emotions, setEmotions] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LEVEL_1' | 'LEVEL_2'>('ALL');

  useEffect(() => {
    fetchEmotions();
  }, []);

  const fetchEmotions = async () => {
    try {
      setLoading(true);
      const data = await emotionService.getAll();
      setEmotions(data);
    } catch (err) {
      setError('Erreur lors du chargement des émotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmotion = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette émotion ?')) return;

    try {
      await emotionService.delete(id);
      // Mettre à jour la liste localement
      setEmotions(emotions.filter(e => e.idEmotion !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // Aplatir + trier : parents A→Z, chaque parent suivi de ses enfants A→Z
  const allEmotions = [...emotions]
    .sort((a, b) => a.title.localeCompare(b.title))
    .flatMap((parent) => [
      parent,
      ...(parent.childEmotions || []).sort((a, b) => a.title.localeCompare(b.title))
    ]);

  if (loading) return <AdminLayout><div>Chargement...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: 'red' }}>{error}</div></AdminLayout>;

  const LevelLabels = {
    [LevelEmotionEnum.LEVEL_1]: 1,
    [LevelEmotionEnum.LEVEL_2]: 2,
  };

  const filteredEmotions = filter === 'ALL'
    ? allEmotions
    : allEmotions.filter(e => e.level === filter);


  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Emotions</h2>
          <div style={styles.headerRight}>
            <select style={styles.select} value={filter} onChange={(e) => setFilter(e.target.value as 'ALL' | 'LEVEL_1' | 'LEVEL_2')}>
              <option value="ALL">Toutes les émotions</option>
              <option value="LEVEL_1">Emotion principale (niveau 1)</option>
              <option value="LEVEL_2">Emotion secondaire (niveau 2)</option>
            </select>
            <ButtonCreateEntity title="+ Nouvelle émotion" onClick={() => navigate('/admin/emotions/create')} />
          </div>
        </div>

        {filteredEmotions.length === 0 ? (
          <p>Aucune émotion</p>
        ) : (
          <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <colgroup>
              <col style={{ width: '200px' }} />
              <col style={{ width: '100px' }} />
              <col />
              <col style={{ width: '200px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={styles.titleTable}>Titre</th>
                <th style={styles.titleTable}>Niveau</th>
                <th style={styles.titleTable}>Émotions enfants</th>
                <th style={{ ...styles.titleTable, width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmotions.map((emotion) => (
                <tr key={emotion.idEmotion} style={{ borderBottom: `1px solid ${COLORS.neutral.borderGray}` }}>
                  <td style={{
                    ...styles.emotionInput,
                    fontWeight: emotion.level === LevelEmotionEnum.LEVEL_1 ? 700 : 400,
                  }}>{emotion.title}</td>
                  <td style={styles.emotionInput}>{LevelLabels[emotion.level]}</td>
                  <td style={styles.descriptionInput}>
                    {emotion.childEmotions && emotion.childEmotions.length > 0
                      ? emotion.childEmotions.map((c: any) => c.title).join(', ')
                      : '-'}
                  </td>
                  <td style={styles.actionsCell}>
                    <ButtonAction
                      bgColor={COLORS.backgroundVisible}
                      onClick={() => navigate(`/admin/emotions/${emotion.idEmotion}`)}
                      icon={<IoEyeOutline size={20} color={COLORS.accent}/>} />
                    <ButtonAction
                      bgColor={COLORS.accent}
                      onClick={() => navigate(`/admin/emotions/${emotion.idEmotion}/edit`)}
                      icon={<IoPencilSharp size={20}/>} />
                    {(!emotion.childEmotions || emotion.childEmotions.length === 0) ?
                     (
                      <ButtonAction
                        bgColor={COLORS.backgroundDelete}
                        onClick={() => handleDeleteEmotion(emotion.idEmotion)}
                        icon={<IoTrashBinOutline size={20} color={COLORS.delete}/>} />
                    ) : <div style={styles.noAction}></div>}
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
  optionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  select: {
    padding: `${SPACING.sm}px`,
    borderRadius: `${SPACING.sm}px`,
    border: `1px solid ${COLORS.neutral.borderGray}`,
    fontSize: '14px',
    color: COLORS.text,
  },
  titleTable: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: COLORS.neutral.gray,
    borderBottom: `2px solid ${COLORS.neutral.borderGray}`,
  },
  emotionInput: {
    padding: '14px 16px',
    fontSize: '14px',
    color: COLORS.text,
    fontWeight: 500,
    verticalAlign: 'middle',
  },
  descriptionInput: {
    padding: '14px 16px',
    fontSize: '14px',
    color: COLORS.neutral.gray,
    verticalAlign: 'middle',
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    width: '200px',
    boxSizing: 'border-box' as const,
  },
  noAction: {
    width: '32px',
    height: '32px',
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    scrollbarGutter: 'stable',
  },
  btnSmall: {
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
};

export default Emotions;
