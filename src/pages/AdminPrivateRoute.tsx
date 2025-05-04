// AdminPrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

function AdminPrivateRoute() {
  const adminToken = Cookies.get('admin_token');
  const isAdminAuthenticated = !!adminToken; // Verifica se o token existe

  return isAdminAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
}

export default AdminPrivateRoute;