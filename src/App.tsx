import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { History } from './pages/History';
import { Subscriptions } from './pages/Subscriptions';
import { UserConfig } from './pages/UserConfig';
import { Recover } from './pages/Recover';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import  AdminPrivateRoute  from './pages/AdminPrivateRoute';
// import DashboardMetrics from './pages/DashboardMetrics';
import { AdminUsers } from './pages/AdminUsers';
import { AdminReports } from './pages/AdminReports';
import { UserChat } from './pages/UserChat';
import { SubscriptionManagement } from './pages/SubscriptionManagement';
import { DetalhesNfse } from './pages/DetalhesNfse';
import { Financial } from './pages/Financial';
import { AdminConfig } from './pages/AdminConfig';
import { isTokenExpired } from './utils/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function App() {

  useEffect(() => {
    const userToken = Cookies.get('token');
    const adminToken = Cookies.get('admin_token');

    const token = userToken || adminToken;

    if (!token || isTokenExpired(token)) {
      Cookies.remove('token');
      Cookies.remove('admin_token');
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover" element={<Recover/>} />
        <Route path="/detalhesNfse/:id" element={<DetalhesNfse />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<UserChat />} />
          <Route path="/UserConfig" element={<UserConfig />} />
          <Route element={<AdminPrivateRoute />}>
        {/* <Route path="/admin/metrics" element={<DashboardMetrics />} /> */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
          <Route path="/AdminConfig" element={<AdminConfig />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;