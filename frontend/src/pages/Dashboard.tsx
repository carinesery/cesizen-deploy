import React from 'react';
import AdminLayout from '../components/AdminLayout';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div style={styles.container}>
        <h2>Dashboard</h2>
        <p>Bienvenue dans le panneau d'administration.</p>
        
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>📄 Articles</h3>
            <p>Gérer les articles</p>
          </div>
          <div style={styles.card}>
            <h3>🏷️ Catégories</h3>
            <p>Gérer les catégories</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '30px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

export default Dashboard;
