import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) setUser(JSON.parse(loggedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="App">
      <header className="main-header">
        <h1>{t('store-name')}</h1>
      </header>

      <nav className="navbar">
        <div className="nav-links">
          <Link to="/">{t('products')}</Link>
          {user ? (
            <>
              <div className="user-info-top">
                <span>{t('welcome')}, <strong>{user.full_name}</strong></span>
                <button className="logout-btn" onClick={logout}>{t('logout')}</button>
              </div>
              <Link to="/my-orders">{t('my-orders')}</Link>
              <Link to="/cart">{t('cart')}</Link>
              <Link to="/profile">{t('profile')}</Link>
            </>
          ) : (
            <Link to="/login">{t('login1')}</Link>
          )}
          {user && user.role === 'Admin' && <Link to="/admin-panel" className="admin-link">{t('admin-panel')}</Link>}
        </div>
        <div className="language-switcher">
          <button onClick={() => i18n.changeLanguage('pl')}>PL</button>
          <button onClick={() => i18n.changeLanguage('en')}>EN</button>
        </div>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={(u) => setUser(u)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<OrderHistory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;