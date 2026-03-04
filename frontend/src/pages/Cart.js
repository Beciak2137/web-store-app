import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useTranslation } from 'react-i18next';

function Cart() {
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await API.get('/cart');
            setCartItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Błąd koszyka:", err);
            setLoading(false);
        }
    };

    const handleFinalizeOrder = async () => {
        if (!address.trim()) {
            alert("Proszę podać adres dostawy.");
            return;
        }
        try {
            await API.put('/orders/checkout', { address });
            alert("Zamówienie zostało złożone.");
            setIsCheckoutOpen(false);
            setCartItems([]);
            setAddress('');
        } catch (err) {
            alert("Wystąpił błąd podczas składania zamówienia.");
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await API.delete(`/cart/item/${itemId}`);
            fetchCart();
        } catch (err) {
            alert("Nie udało się usunąć produktu.");
        }
    };

    const totalSum = cartItems.reduce((sum, item) => sum + Number(item.total_item_price || 0), 0);

    if (loading) return <h2 className="page-message">Ładowanie...</h2>;

    return (
        <div className="cart-page-wrapper">
            <div className="cart-container">
                <h2>{t('your-cart')}</h2>

                {cartItems.length === 0 ? (
                    <p className="page-message">{t('empty-cart')}</p>
                ) : (
                    <>
                        <div className="cart-list">
                            {cartItems.map(item => (
                                <div key={item.item_id} className="cart-item">
                                    <img src={`/images/${item.image_url}`} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p>{item.unit_price} zł x {item.quantity}</p>
                                        <button className="btn-delete" onClick={() => handleRemoveItem(item.item_id)}>{t('delete')}</button>
                                    </div>
                                    <div className="cart-item-price">
                                        {Number(item.total_item_price).toFixed(2)} zł
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3>{t('price')} {totalSum.toFixed(2)} zł</h3>
                            <button className="btn-next" onClick={() => setIsCheckoutOpen(true)}>{t('checkout')}</button>
                        </div>
                    </>
                )}

                {}
                {isCheckoutOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content checkout-modal">
                            <h2>{t('checkout')}</h2>
                            <p>{t('price')} <strong>{totalSum.toFixed(2)} zł</strong></p>

                            <div className="address-section">
                                <label>{t('address')}</label>
                                <textarea
                                    placeholder={t('enter-address')}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn-primary" onClick={handleFinalizeOrder}>
                                    {t('finalize-order')}
                                </button>
                                <button className="btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                                    {t('cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;
