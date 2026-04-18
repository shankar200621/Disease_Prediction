import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PredictionProvider } from './context/PredictionContext';

import ChatWidget from './components/ChatWidget';
import AppHeader from './components/AppHeader';
import PredictionHydrate from './components/PredictionHydrate';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Home from './pages/Home';
import PatientForm from './pages/PatientForm';
import Dashboard from './pages/Dashboard';
import KnowledgeGraph from './pages/KnowledgeGraph';
import MedicalAnalyzer from './pages/MedicalAnalyzer';

function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbff', color: '#7c3aed', fontFamily: 'sans-serif' }}>
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <AppHeader />
      <Outlet />
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PredictionProvider>
        <PredictionHydrate />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/assessment" element={<PatientForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/analyzer" element={<MedicalAnalyzer />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PredictionProvider>
    </AuthProvider>
  );
}
