import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ViewArticle from './pages/ViewArticle';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import Categories from './pages/Categories';
import Users from './pages/Users';
import ViewUser from './pages/ViewUser';
import CreateUser from './pages/CreateUser';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import EditUser from './pages/EditUser';
import CreateCategory from './pages/CreateCategory';
import ViewCategory from './pages/ViewCategory';
import EditCategory from './pages/EditCategory';
import Emotions from './pages/Emotions';
import ViewEmotion from './pages/ViewEmotion';
import CreateEmotion from './pages/CreateEmotion';
import EditEmotion from './pages/EditEmotion';
import Page403 from './pages/Page403';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Page403 />} />
          <Route path="/admin/users/confirm-email" element={<ConfirmEmailPage />} />

          {/* Protected routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>}/>

          {/* Routes Articles */}
          <Route path="/admin/articles" element={<ProtectedRoute requiredRole="admin"><Articles /></ProtectedRoute>} />
          <Route path="/admin/articles/:slug" element={<ProtectedRoute requiredRole="admin"><ViewArticle /></ProtectedRoute>} />
          <Route path="/admin/articles/create" element={<ProtectedRoute requiredRole="admin"><CreateArticle /></ProtectedRoute>} />
          <Route path="/admin/articles/:slug/edit" element={<ProtectedRoute requiredRole="admin"><EditArticle /></ProtectedRoute>} />

          {/* Routes Categories */}
          <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><Categories /></ProtectedRoute>} />
          <Route path="/admin/categories/create" element={<ProtectedRoute requiredRole="admin"><CreateCategory /></ProtectedRoute>} />
          <Route path="/admin/categories/:slug" element={<ProtectedRoute requiredRole="admin"><ViewCategory /></ProtectedRoute>} />
          <Route path="/admin/categories/:slug/edit" element={<ProtectedRoute requiredRole="admin"><EditCategory /></ProtectedRoute>} />

          {/* Routes Users */}
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute requiredRole="admin"><ViewUser /></ProtectedRoute>} />
          <Route path="/admin/users/create" element={<ProtectedRoute requiredRole="admin"><CreateUser /></ProtectedRoute>} />
          <Route path="/admin/users/:id/edit" element={<ProtectedRoute requiredRole="admin"><EditUser /></ProtectedRoute>} />

          {/* Routes Emotions */}
          <Route path="/admin/emotions" element={<ProtectedRoute requiredRole="admin"><Emotions /></ProtectedRoute>} />
          <Route path="/admin/emotions/:id" element={<ProtectedRoute requiredRole="admin"><ViewEmotion /></ProtectedRoute>} />
          <Route path="/admin/emotions/create" element={<ProtectedRoute requiredRole="admin"><CreateEmotion /></ProtectedRoute>} />
          <Route path="/admin/emotions/:id/edit" element={<ProtectedRoute requiredRole="admin"><EditEmotion /></ProtectedRoute>} />


          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
