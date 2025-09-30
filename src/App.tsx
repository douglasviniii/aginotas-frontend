import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { Pricing } from "./pages/Pricing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { History } from "./pages/History";
import { Subscriptions } from "./pages/Subscriptions";
import { UserConfig } from "./pages/UserConfig";
import { Recover } from "./pages/Recover";
import { UserChat } from "./pages/UserChat";
import { isTokenExpired } from "./utils/auth";
import { useEffect } from "react";
import Cookies from "js-cookie";
import PoliticasPrivacidade from "./pages/Politicas";
import TermosDeUso from "./pages/Termos";
import Cookie from "./pages/Cookies";
import Landing from "./pages/Landing";
import Financial from "./pages/Financial";

function App() {
  useEffect(() => {
    const userToken = Cookies.get("token");
    const token = userToken;
    if (!token || isTokenExpired(token)) {
      Cookies.remove("token");
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cookies" element={<Cookie />} />
        <Route path="/politicas" element={<PoliticasPrivacidade />} />
        <Route path="/termos" element={<TermosDeUso />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover" element={<Recover />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<UserChat />} />
          <Route path="/UserConfig" element={<UserConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
