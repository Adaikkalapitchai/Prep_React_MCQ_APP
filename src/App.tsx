import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/useStore';

// Components & Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestDetails from './pages/TestDetails';
import AddQuestions from './pages/AddQuestions';
import PreviewPublish from './pages/PreviewPublish';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route wrapper for Layout
const AppLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test/new" element={<TestDetails />} />
          <Route path="/test/edit/:id" element={<TestDetails />} />
          <Route path="/test/:id/questions" element={<AddQuestions />} />
          <Route path="/test/:id/preview" element={<PreviewPublish />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
