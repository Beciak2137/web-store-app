const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); 
require('dotenv').config();
const { verifyToken, isAdmin } = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

const verifySelfOrAdmin = (req, res, next) => {
    const isSelf = String(req.user.id) === String(req.params.id);
    if (req.user && (req.user.role === 'Admin' || isSelf)) {
        return next();
    }
    return res.status(403).json({ error: 'Brak uprawnien' });
};

app.post('/api/register', async (req, res) => {
    const { email, password, full_name, birth_date } = req.body;
    
    try {
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Ten adres e-mail jest już zajęty' });
        }
        const [userCountResult] = await db.query('SELECT COUNT(*) as count FROM users');
        const userCount = userCountResult[0].count;

        const roleId = (userCount === 0) ? 1 : 2;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO users (email, password, role_id, full_name, created_at, birth_date) VALUES (?, ?, ?, ?, NOW(), ?)';
        await db.query(query, [email, hashedPassword, roleId, full_name, birth_date]);

        res.status(201).json({ 
            message: 'Użytkownik zarejestrowany pomyślnie', 
            role: roleId === 1 ? 'Admin' : 'Klient' 
        });
    } catch (err) {
        console.error("PEŁNY BŁĄD Z BAZY:", err);
        res.status(500).json({ error: 'Błąd podczas rejestracji', details: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT u.*, r.role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
        }

        const token = jwt.sign({ id:user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({token, user: { id:user.id, full_name: user.full_name, role:user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas logowania' });
    }
});

app.get('/api/products', async (req, res) => {
    try{
        const query = 'SELECT p.*, c.category as category_name FROM products p JOIN categories c ON p.category_id = c.id';
        const [products] = await db.query(query);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd podczas pobierania produktów' });
    }
});
app.get('/api/products/category/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const query = 'SELECT p.*, c.category as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.category_id = ?';
        const [products] = await db.query(query, [categoryId]);
        if(products.length === 0) {
            return res.status(404).json({ error: 'Brak produktów w tej kategorii' });
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas pobierania produktów' });
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM categories');
        res.json(results);
    } catch (err) {
        console.error("Błąd bazy danych:", err);
        res.status(500).json({ error: 'Nie udało się pobrać kategorii' });
    }
});
app.get('/api/cart', verifyToken, async (req, res) => {
    const userIdFromToken = req.user.id;

    try {
        const query = `
            SELECT
                oi.id as item_id,
                p.name,
                p.image_url,
                oi.quantity,
                oi.unit_price,
                (oi.quantity * oi.unit_price) as total_item_price
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ? AND o.status_id = 4
        `;

        const [items] = await db.query(query, [userIdFromToken]);
        res.json(items);
    } catch (err) {
        console.error("Błąd pobierania koszyka:", err.message);
        res.status(500).json({ error: 'Błąd podczas pobierania koszyka' });
    }
});
app.get('/api/my-orders', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.order_date, o.total_price, o.address, s.status
            FROM orders o
            JOIN statuses s ON o.status_id = s.id
            WHERE o.user_id = ? AND o.status_id != 4
            ORDER BY o.order_date DESC
        `;
        const [orders] = await db.query(query, [req.user.id]);
        res.json(orders);
    } catch (err) {
        console.error("Błąd bazy:", err);
        res.status(500).json({ error: "Błąd bazy danych" });
    }
});
app.get('/api/orders/:orderId/items', verifyToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const [orders] = await db.query('SELECT user_id FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Zamowienie nie znalezione' });
        }
        if (req.user.role !== 'Admin' && String(orders[0].user_id) !== String(req.user.id)) {
            return res.status(403).json({ error: 'Brak uprawnien' });
        }
        const query = `
            SELECT
                oi.quantity,
                oi.unit_price,
                p.name,
                p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(query, [orderId]);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT full_name, email, birth_date FROM users WHERE id = ?',
            [req.user.id] 
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/admin/orders', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT o.*, s.status, u.full_name
            FROM orders o
            JOIN statuses s ON o.status_id = s.id
            JOIN users u ON o.user_id = u.id
            WHERE o.status_id != 4
            ORDER BY o.order_date DESC`;
        const [orders] = await db.query(query);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/statuses', verifyToken, isAdmin, async (req, res) => {
    try {
        const [statuses] = await db.query('SELECT * FROM statuses');
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', verifyToken, isAdmin, async (req, res) => {
    const { name, price, description, image_url, category_id } = req.body;
    if (!name || !price || !category_id) {
        return res.status(400).json({ error: 'Nazwa, cena i kategoria są wymagane' });
    }

    try {
        const query = 'INSERT INTO products (name, price, description, image_url, category_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [name, price, description, image_url, category_id]);
        res.status(201).json({ message: 'Produkt dodany', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/cart/add', verifyToken, async (req, res) => {
    const { productId, quantity, unitPrice } = req.body;
    const userId = req.user.id;

    try {
        const [existingOrders] = await db.query(
            'SELECT id FROM orders WHERE user_id = ? AND status_id = 4 LIMIT 1',
            [userId]
        );

        let orderId;

        if (existingOrders.length > 0) {
            orderId = existingOrders[0].id;
        } else {
            const [newOrder] = await db.query(
                'INSERT INTO orders (user_id, status_id, total_price, order_date) VALUES (?, 4, 0, NOW())',
                [userId]
            );
            orderId = newOrder.insertId;
        }

        await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [orderId, productId, quantity, unitPrice]
        );

        await db.query(
            'UPDATE orders SET total_price = total_price + ? WHERE id = ?',
            [quantity * unitPrice, orderId]
        );

        res.status(200).json({ message: 'Produkt dodany do bazy' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Blad bazy danych' });
    }
});
app.put('/api/products/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, price, description, image_url, category_id } = req.body;
    try {
        const query = 'UPDATE products SET name=?, price=?, description=?, image_url=?, category_id=? WHERE id=?';
        await db.query(query, [name, price, description, image_url, category_id, id]);
        res.json({ message: 'Produkt zaktualizowany' });
    } catch (err) {
        res.status(500).json({ error: 'Błąd edycji' });
    }
});
app.put('/api/orders/checkout', verifyToken, async (req, res) => {
    const { address } = req.body;
    const userId = req.user.id;
    try {
        const query = `
            UPDATE orders
            SET address = ?, status_id = 1, order_date = NOW()
            WHERE user_id = ? AND status_id = 4
        `;
        await db.query(query, [address, userId]);
        res.json({ message: 'Zamowienie zostalo zlozone' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Blad podczas finalizacji zamowienia' });
    }
});
app.put('/api/user/:id', verifyToken, verifySelfOrAdmin, async (req, res) => {
    const { full_name, email, password, birth_date } = req.body;
    const userId = req.params.id;

    try {
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(
                'UPDATE users SET full_name = ?, email = ?, password = ?, birth_date = ? WHERE id = ?',
                [full_name, email, hashedPassword, birth_date, userId]
            );
        } else {
            await db.query(
                'UPDATE users SET full_name = ?, email = ?, birth_date = ? WHERE id = ?',
                [full_name, email, birth_date, userId]
            );
        }
        res.json({ message: 'Profil zaktualizowany' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd podczas szyfrowania lub zapisu.' });
    }
});
app.put('/api/admin/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
    const { statusId } = req.body;
    try {
        await db.query('UPDATE orders SET status_id = ? WHERE id = ?', [statusId, req.params.id]);
        res.json({ message: 'Status zaktualizowany' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/products/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Produkt usunięty' });
    } catch (err) {
        res.status(500).json({ error: 'Błąd usuwania' });
    }
});
app.delete('/api/cart/item/:itemId', verifyToken, async (req, res) => {
    const { itemId } = req.params;
    try {
        const [result] = await db.query(
            'DELETE oi FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.id = ? AND o.user_id = ? AND o.status_id = 4',
            [itemId, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nie znaleziono produktu w koszyku' });
        }
        res.status(200).json({ message: 'Produkt został usunięty z koszyka' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd podczas usuwania produktu' });
    }
});
app.delete('/api/admin/orders/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Zamówienie usunięte' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});