import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CalculatorPage from './pages/CalculatorPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import PageSkeleton from './components/PageSkeleton';

function App() {
  const [initialLoad, setInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Show skeleton on initial page load or hard refresh
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500); // 1.5s skeleton animation

    return () => clearTimeout(timer);
  }, []);

  if (initialLoad) {
    return <PageSkeleton />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <CalculatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/calculator" replace />} />
    </Routes>
  );
}

export default App;
