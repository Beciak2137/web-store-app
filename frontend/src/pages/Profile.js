import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useTranslation } from 'react-i18next';

function Profile() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        birth_date: ''
    });
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
    API.get('/user/profile')
        .then(res => {
            const data = res.data;
            const formattedDate = data.birth_date ? data.birth_date.split('T')[0] : '';

            setFormData({
                full_name: data.full_name,
                email: data.email,
                password: '', 
                birth_date: formattedDate
            });
        })
        .catch(err => {
            console.error("Błąd podczas pobierania profilu:", err);
        });
}, []); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/user/${user.id}`, formData);
            alert("Dane zostały zaktualizowane.");

            const updatedUser = { ...user, full_name: formData.full_name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload();
        } catch (err) {
            alert("Błąd podczas aktualizacji danych.")
        }
    };

    return (
        <div className="admin-page-wrapper">
            <div className="profile-container" style={{maxWidth: '500px'}}>
                <h2>{t('my-profile')}</h2>
                <form className="profile-form" onSubmit={handleSubmit}>
                    <label>{t('full-name1')}</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        required
                    />

                    <label>{t('email')}</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                    />

                    <label>{t('new-password')}</label>
                    <input
                      type="password"
                      placeholder={t('leave-blank')}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <small className="helper-text">{t('leave-blank-info')}</small>

                    <label>{t('birth-date')}</label>
                    <input
                        type="date"
                        value={formData.birth_date}
                        onChange={e => setFormData({...formData, birth_date: e.target.value})}
                    />

                    <button type="submit" className="btn-primary">{t('save')}</button>
                </form>
            </div>
        </div>
    );
}

export default Profile;
