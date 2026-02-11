const jwt = require('jsonwebtoken');

// Отключить аутентификацию (для разработки без JWT)
const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true';

const authMiddleware = (req, res, next) => {
    // Если аутентификация отключена, пропускаем
    if (DISABLE_AUTH || !process.env.JWT_SECRET) {
        // Создаем фейкового пользователя для тестирования
        req.user = { id: 1, role: 'admin', username: 'test_user' };
        return next();
    }

    try {
        // Получаем токен из заголовка
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Верифицируем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' })
    }
};

module.exports = authMiddleware;