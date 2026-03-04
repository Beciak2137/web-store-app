import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useTranslation } from 'react-i18next';

function OrderHistory() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
      API.get('/my-orders') 
          .then(res => {
              setOrders(res.data);
          })
          .catch(err => {
              console.error("Błąd pobierania historii:", err);
          });
      }, []);


    const toggleOrder = async (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }
        try {
            const res = await API.get(`/orders/${orderId}/items`);
            setOrderItems(res.data);
            setExpandedOrder(orderId);
        } catch (err) { console.error(err); }
    };


    return (
        <div className="admin-page-wrapper">
            <div className="admin-container" style={{maxWidth: '900px'}}>
                <h2>{t('my-orders')}</h2>
                
                {orders.length === 0 ? (
                    <p>{t('no-orders')}</p>
                ) : (
                    <div className="order-history-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <span><strong>{t('order')} #{order.id}</strong></span>
                                    <span className="status-badge">{order.status}</span>
                                    <button className="togle-details-btn" onClick={() => toggleOrder(order.id)}>
                                        {expandedOrder === order.id ? t('hide-details') : t('show-details')}
                                    </button>
                                </div>
                                <div className="order-body">
                                    <p>{t('order-date')} {new Date(order.order_date).toLocaleString()}</p>
                                    <p>{t('order-address')} {order.address}</p>
                                    <p className="order-total">{t('total-price')} {Number(order.total_price).toFixed(2)} zł</p>
                                </div>
                                {expandedOrder === order.id && (
                                <div className="order-details-expanded">
                                    <h4>{t('order-details')}</h4>
                                    {orderItems.map(item => (
                                        <div key={item.id} className="detail-item">
                                            <img src={`/images/${item.image_url}`} width="40" alt="" />
                                            <span>{item.name}</span>
                                            <span>{item.quantity} szt. x {item.unit_price} zł</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;