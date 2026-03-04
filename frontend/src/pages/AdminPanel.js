import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useTranslation } from 'react-i18next';

function AdminPanel() {
    const { t } = useTranslation();
    const [view, setView] = useState('list');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({ name: '', price: '', description: '', image_url: '', category_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [prodRes, catRes, ordRes, statusesRes] = await Promise.all([API.get('/products'), API.get('/categories'), API.get('/admin/orders'), API.get('/statuses')]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setOrders(ordRes.data);
        setStatuses(statusesRes.data);
    };

    const handleDelete = async (id) => {
        try{
            await API.delete(`/products/${id}`);
            fetchData();
            setMessage("Produkt usunięty.");
        } catch (err) {
            setMessage("Błąd podczas usuwania produktu.");
        }

    };

    const handleEditClick = (product) => {
        setFormData(product);
        setEditingId(product.id);
        setView('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (view === 'add') {
            await API.post('/products', formData);
            setMessage("Dodano produkt");
        } else {
            await API.put(`/products/${editingId}`, formData);
            setMessage("Zaktualizowano produkt");
        }
        setFormData({ name: '', price: '', description: '', image_url: '', category_id: '' });
        setView('list');
        fetchData();
    };

    const handleStatusChange = async (orderId, newStatusId) => {
        try {
            await API.put(`/admin/orders/${orderId}/status`, { statusId: newStatusId });
            setMessage("Status zamówienia zaktualizowany.");
            fetchData();
        } catch (err) {
            setMessage("Nie udało sie zminić statusu.");
        }
    };

    const handleOrderDelete = async (orderId) => {
            try {
                await API.delete(`/admin/orders/${orderId}`);
                setMessage("Zamówienie zostało usunięte.");
                fetchData();
                } catch (err) {
                setMessage("Błąd podczas usuwania zamówienia.");
            }

    };

    return (
      <div className="admin-page-wrapper">
        <div className="admin-container">
            <h1>{t('admin-panel')}</h1>

            <div className="admin-nav">
                <button onClick={() => { setView('list'); setMessage(''); }} className={view === 'list' ? 'active' : ''}>{t('products')}</button>
                <button onClick={() => { setView('add'); setMessage(''); }} className={view === 'add' ? 'active' : ''}>{t('add-product')}</button>
                <button onClick={() => { setView('orders'); setMessage(''); }} className={view === 'orders' ? 'active' : ''}>{t('orders')}</button>
            </div>

            {message && <p className="status-message">{message}</p>}

            {view === 'list' && (
                <div className="admin-list">
                    {products.map(p => (
                        <div key={p.id} className="admin-item">
                            <span>{p.name} - {p.price} zł</span>
                            <div className="admin-item-btns">
                                <button onClick={() => handleEditClick(p)} className="btn-edit">{t('edit')}</button>
                                <button onClick={() => handleDelete(p.id)} className="btn-delete">{t('delete')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(view === 'add' || view === 'edit') && (
                <form onSubmit={handleSubmit} className="admin-form">
                    <h3>{view === 'add' ? t('add-product') : t('edit-product')}</h3>
                    <input type="text" placeholder={t('product-name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <input type="number" step="0.01" placeholder={t('product-price')} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                        <option value="">{t('select-category')}</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                    </select>
                    <input type="text" placeholder={t('product-image')} value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    <textarea placeholder={t('product-description')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    <button type="submit" className="btn-primary">{view === 'add' ? t('save') : t('update')}</button>
                    <button type="button" onClick={() => setView('list')} className="btn-secondary">{t('cancel')}</button>
                </form>
            )}
            {view === 'orders' && (
                <div className="admin-list">
                <h2>{t('orders2')}</h2>
                {orders.length === 0 ? <p>{t('no-orders')}</p> : (
                orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <strong>{t('order')} #{order.id} - {order.full_name}</strong>
                            <span className="order-total">{parseFloat(order.total_price || 0).toFixed(2)} zł</span>
                        </div>

                        <div className="order-body">
                            {t('order-date')} {order.order_date ? new Date(order.order_date).toLocaleString() : 'Brak daty'}<br/>
                            {t('order-address')} {order.address}
                        </div>

                        <div className="admin-item-btns">
                            <select
                                value={order.status_id}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="status-select-admin"
                            >
                                {statuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.status}</option>
                                ))}
                            </select>
                            <button onClick={() => handleOrderDelete(order.id)} className="btn-delete">{t('delete')}</button>
                        </div>
                    </div>
                ))
            )}
        </div>
        )}
        </div>
      </div>
    );
}

export default AdminPanel;