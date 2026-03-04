import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const[fromData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    birth_date: ''
  });
  const navigate = useNavigate();
    const handleRegister = async (e) => {e.preventDefault();
    try {
      await API.post('/register', fromData);
        alert('Zarejestrowano.');
        navigate('/login');
    } catch (err) {
      alert('Błąd rejestracji: ' + err.response.data.error);
    }
  };
    return (
    <div className='register-page-wrapper'>
        <h2>{t('register')}</h2>
        <form className = 'register-form' onSubmit={handleRegister}>
        <input type="text" placeholder={t('full-name')}onChange={e => setFormData({...fromData, full_name: e.target.value})}required/>
        <input type="email" placeholder={t('email')} onChange={e => setFormData({...fromData, email: e.target.value})} required/>
        <input type="password" placeholder={t('password')} onChange={e => setFormData({...fromData, password: e.target.value})} required/>
        <input type="date" placeholder={t('birth-date')} onChange={e => setFormData({...fromData, birth_date: e.target.value})}required />
        <button className='register-button' type="submit" >{t('register1')}</button>
        </form>
    </div>
    );
}
export default Register;