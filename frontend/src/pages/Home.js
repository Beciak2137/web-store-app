import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useTranslation } from 'react-i18next';

function Home() {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToCart, setProductToCart] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const storedUser = localStorage.getItem('user');
    const loggedInUser = storedUser ? JSON.parse(storedUser) : null;

    const userId = loggedInUser?.id || null;

    const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
    };

    const openCartModal = (product) => {
        if (!userId) {
            alert("Musisz się zalogować, aby móc dodawać produkty do koszyka");
            return;
        }
        setProductToCart(product);
        setQuantity(1);
        setIsModalOpen(true);
    };

    const handleConfirmAdd = async () => {
        if (!userId) {
            alert("Musisz się zalogować, aby dodać produkty do koszyka");
            setIsModalOpen(false);
            return;
        }
        try {
            const cartData = {
                productId: productToCart.id,
                quantity: quantity,
                unitPrice: productToCart.price
            };

            await API.post('/cart/add', cartData);

            setIsModalOpen(false);
        } catch (err) {
            alert("Nie udało się dodać do koszyka");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    API.get('/products'),
                    API.get('/categories')
                ]);

                setProducts(productsRes.data || []);
                setFilteredProducts(productsRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (err) {
                console.error("Błąd podczas ładowania danych startowych:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filterByCategory = async (id) => {
        setSelectedCategoryId(id);
        setLoading(true);
        try {
            if (id === null) {
                const res = await API.get('/products');
                setFilteredProducts(res.data || []);
            } else {
                const res = await API.get(`/products/category/${id}`);
                setFilteredProducts(res.data || []);
            }
        } catch (err) {
            console.error("Błąd filtrowania:", err);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <h2 className="page-message">Ładowanie sklepu...</h2>;

    return (
        <div className="home-layout">
            <aside className="sidebar">
                <h3>{t('categories')}</h3>
                <ul>
                    <li
                        className={selectedCategoryId === null ? 'active' : ''}
                        onClick={() => filterByCategory(null)}
                    >{t('all-categories')}
                    </li>
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <li
                                key={cat.id}
                                className={selectedCategoryId === cat.id ? 'active' : ''}
                                onClick={() => filterByCategory(cat.id)}
                            >
                                {cat.category}
                            </li>
                        ))
                    ) : (
                        <li className="sidebar-note">{t('no-categories')}</li>
                    )}
                </ul>
            </aside>

            <div className="content">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                        <section key={p.id}>
                            <div className="product-image-container">
                                {p.image_url ? (
                                    <img src={`/images/${p.image_url}`} alt={p.name} className="product-image" />
                                ) : (
                                    <div className="no-image">{t('no-image')}</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{p.name}</h3>
                                <p className="price">{p.price} zł</p>
                                <div className="product-actions">
                                    <button className="btn-secondary" onClick={() => openDetailsModal(p)}>{t('details')}</button>
                                    <button className="btn-primary" onClick={() => openCartModal(p)}>{t('add-to-cart')}</button>
                                </div>
                            </div>
                        </section>
                    ))
                ) : (
                    <h3 className="grid-message">{t('no-products')}</h3>
                )}

                {}
                {isModalOpen && userId && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{t('add-to-cart2')}</h3>
                        <p>{t("product2")} <strong>{productToCart?.name}</strong></p>

                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-primary" onClick={handleConfirmAdd}>{t('add')} { (productToCart?.price * quantity).toFixed(2) } zł</button>
                                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t('cancel')}</button>
                            </div>
                        </div>
                    </div>
                )}
                {}
                {isDetailsOpen && selectedProduct && (
                    <div className="modal-overlay" onClick={() => setIsDetailsOpen(false)}>
                        <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setIsDetailsOpen(false)}>&times;</button>

                        <div className="details-layout">
                        <div className="details-image-section">
                        <img
                            src={`/images/${selectedProduct.image_url}`}
                            alt={selectedProduct.name}
                        />
                    </div>

                    <div className="details-info-section">
                        <h2>{selectedProduct.name}</h2>
                        <p className="details-price">{selectedProduct.price} zł</p>

                        <div className="details-description">
                         <h4>{t('description')}</h4>
                            <p>{selectedProduct.description || "Ten produkt nie ma jeszcze opisu."}</p>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={() => {
                                setIsDetailsOpen(false);
                                openCartModal(selectedProduct);
                            }}
                        >
                            {t('add-to-cart3')}
                        </button>
                        </div>
                    </div>
                </div>
            </div>
         )}
            </div>
        </div>
    );
}

export default Home;
