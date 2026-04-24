import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import AdminLayout from "../components/AdminLayout";
import { COLORS, SPACING } from "../constants/themes";
import { ButtonAction } from '../components/ButtonAction';
import { IoEyeOutline, IoPencilSharp, IoTrashBinOutline, IoCloseOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { ButtonCreateEntity } from '../components/ButtonCreateEntity';

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const avatarColors = ['#CCF0E8', '#F3E8FF', '#DBEAFE', '#FED95D', '#FCB1FC', '#E1FFDB', '#E2E7FF'];

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
};

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchUsers() }, []); // Un seul appel au montage du composant

    // Call à l'API 
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    }

    const handleToggleActive = async (user) => {
        const newStatus = !user.isActive;
        try {
            const updatedUser = await userService.setActiveStatus(user.idUser, newStatus);
            setUsers(users.map(u => u.idUser === updatedUser.id
                ? { ...u, isActive: updatedUser.isActive }
                : u
            ));
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleDeleteUser = async (idUser) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await userService.delete(idUser);
            // Mettre à jour la liste localement
            setUsers(users.filter(u => u.idUser !== idUser));
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };



    // Render conditionnel 
    if (loading) return <AdminLayout><div>Chargement...</div></AdminLayout>;
    if (error) return <AdminLayout><div style={{ color: 'red' }}>{error}</div></AdminLayout>;


    return (

        <AdminLayout>
          <div style={styles.container}>
            <div style={styles.header}>
              <h2>Utilisateurs</h2>
              <ButtonCreateEntity title="+ Nouvel utilisateur" onClick={() => navigate('/admin/users/create')} />
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Utilisateur</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Rôle</th>
                        <th style={styles.th}>Inscription</th>
                        <th style={styles.th}>Mise à jour</th>
                        <th style={styles.th}>Statut</th>
                        <th style={{ ...styles.th, width: '200px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.idUser} style={styles.tr}>
                            <td style={styles.td}>
                                <div style={styles.userCell}>
                                    <div style={{ ...styles.avatar, backgroundColor: getAvatarColor(user.username || user.email) }}>
                                        {getInitials(user.username || user.email)}
                                    </div>
                                    <span style={styles.username}>{user.username || '-'}</span>
                                </div>
                            </td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={styles.td}>{user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}</td>
                            <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                            <td style={styles.td}>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : '-'}</td>
                            <td style={styles.td}>
                                <span style={{
                                    ...styles.badge,
                                    backgroundColor: user.deletedAt ? COLORS.backgroundDelete : user.isActive ? COLORS.backgroundVisible : COLORS.backgroundExtraVisible,
                                    color: user.deletedAt ? COLORS.delete : user.isActive ? COLORS.activate : COLORS.desactivate,
                                }}>
                                    {user.deletedAt ? 'Supprimé' : user.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </td>
                            <td style={styles.actionsCell}>
                                <ButtonAction
                                    bgColor={COLORS.backgroundVisible}
                                    onClick={() => navigate(`/admin/users/${user.idUser}`)}
                                    icon={<IoEyeOutline size={20} color={COLORS.accent} />}
                                />
                                {/* <ButtonAction
                                    bgColor={COLORS.accent}
                                    onClick={() => navigate(`/admin/users/${user.idUser}/edit`)}
                                    icon={<IoPencilSharp size={20} />} /> */}
                                {!user.deletedAt ? (
                                    <ButtonAction
                                        bgColor={COLORS.accent}
                                        onClick={() => navigate(`/admin/users/${user.idUser}/edit`)}
                                        icon={<IoPencilSharp size={20} />} />
                                ) : <div style={styles.noAction}></div>}
                                {/* {!user.deletedAt ? (
                                    <ButtonAction
                                        bgColor={COLORS.backgroundDelete}
                                        onClick={() => handleToggleActive(user)}
                                        icon={<IoTrashBinOutline size={20} color={COLORS.delete} />} />
                                ) : <div style={styles.noAction}></div>} */}
                                {/* {!user.deletedAt && (
                                <button
                                    style={styles.btn}
                                    onClick={() => handleToggleActive(user)}
                                >{user.isActive ? 'Désactiver' : 'Activer'} */}
                                {/* </button>)} */}
                                <ButtonAction
                                    bgColor={user.isActive ? COLORS.desactivate : COLORS.activate}
                                    onClick={() => handleToggleActive(user)}
                                    icon={user.isActive ? <IoCloseOutline size={20} /> : <IoCheckmarkOutline size={20} />} />
                                {!user.deletedAt ? (
                                    <ButtonAction
                                        bgColor={COLORS.backgroundDelete}
                                        onClick={() => handleDeleteUser(user.idUser)}
                                        icon={<IoTrashBinOutline size={20} color={COLORS.delete} />} />
                                ) : <div style={styles.noAction}></div>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        </AdminLayout>


    )
}

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
    actionsCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 16px',
        width: '200px',
        boxSizing: 'border-box' as const,
    }, noAction: {
        width: '32px',
        height: '32px',
    },
    btn: {
        backgroundColor: '#f1b950',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
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
    actions: {
        display: 'flex',
        gap: '5px',
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
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        color: COLORS.primary,
        flexShrink: 0,
    },
    username: {
        fontWeight: 500,
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
    },
};


export default Users;