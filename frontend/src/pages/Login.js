import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
      navigate('/');
    } catch (err) {
      alert('Błąd logowania: ' + err.response.data.error);
    }
  };

  return (
    <div className="login-page-wrapper">
      <h2>{t('login')}</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input type="email" placeholder={t('email')} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('password')} onChange={e => setPassword(e.target.value)} required/>
        <button type="submit">{t('login1')}</button>
        <p>{t('no-account')} <a href="/register">{t('register')}</a></p>
      </form>
    </div>
  );
}

export default Login;