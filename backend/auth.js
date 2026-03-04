const jwt = require('jsonwebtoken');

// 1. Strażnik ogólny - sprawdza czy użytkownik jest zalogowany
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Pobiera token z nagłówka "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ error: "Brak tokenu, dostęp zabroniony" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Dodaje dane użytkownika (id, role) do żądania
        next(); // Puszcza użytkownika dalej
    } catch (err) {
        return res.status(401).json({ error: "Nieprawidłowy token" });
    }
};

// 2. Strażnik Admina - sprawdza czy zalogowany użytkownik ma rolę Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: "Wymagane uprawnienia administratora" });
    }
};

module.exports = { verifyToken, isAdmin };