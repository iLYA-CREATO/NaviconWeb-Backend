/**
 * Главный серверный файл backend приложения
 *
 * Этот файл настраивает Express сервер, подключает middleware,
 * регистрирует все API маршруты и запускает сервер.
 */

// Загрузка переменных окружения из .env файла
require('dotenv').config();
// Импорт Express.js для создания веб-сервера
const express = require('express');
// Импорт CORS для разрешения кросс-доменных запросов
const cors = require('cors');

// Импорт всех маршрутов API (использующих Prisma ORM)
const authRoutes = require('./routes/auth'); // Маршруты аутентификации
const clientRoutes = require('./routes/clients'); // Маршруты клиентов
const bidRoutes = require('./routes/bids'); // Маршруты заявок
const bidTypeRoutes = require('./routes/bidTypes'); // Маршруты типов заявок
const userRoutes = require('./routes/users'); // Маршруты пользователей
const roleRoutes = require('./routes/roles'); // Маршруты ролей
const clientObjectRoutes = require('./routes/clientObjects'); // Маршруты объектов клиентов
const equipmentRoutes = require('./routes/equipment'); // Маршруты оборудования
const supplierRoutes = require('./routes/suppliers'); // Маршруты поставщиков
const specificationRoutes = require('./routes/specifications'); // Маршруты спецификаций
const specificationCategoryRoutes = require('./routes/specificationCategories'); // Маршруты категорий спецификаций
const salaryRoutes = require('./routes/salary'); // Маршруты зарплаты
const bidEquipmentRoutes = require('./routes/bidEquipment'); // Маршруты оборудования заявок
const clientEquipmentRoutes = require('./routes/clientEquipment'); // Маршруты оборудования клиентов
const backupRoutes = require('./routes/backups'); // Маршруты бэкапов
const clientAttributeRoutes = require('./routes/clientAttributes'); // Маршруты атрибутов клиентов
const analyticsRoutes = require('./routes/analytics'); // Маршруты аналитики
const notificationRoutes = require('./routes/notifications'); // Маршруты уведомлений

// Импорт node-cron для автоматических бэкапов
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Создание экземпляра Express приложения
const app = express();

// === Middleware ===
// Настройка CORS для разрешения запросов с фронтенда
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));
// Парсинг JSON тела запросов (увеличен лимит для bulk операций)
app.use(express.json({ limit: '50mb' }));
// Парсинг URL-encoded данных (для форм)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// === Регистрация маршрутов API ===
// Все маршруты доступны по префиксу /api
app.use('/api/auth', authRoutes); // /api/auth/*
app.use('/api/clients', clientRoutes); // /api/clients/*
app.use('/api/bids', bidRoutes); // /api/bids/*
app.use('/api/bid-types', bidTypeRoutes); // /api/bid-types/*
app.use('/api/users', userRoutes); // /api/users/*
app.use('/api/roles', roleRoutes); // /api/roles/*
app.use('/api/client-objects', clientObjectRoutes); // /api/client-objects/*
app.use('/api/equipment', equipmentRoutes); // /api/equipment/*
app.use('/api/suppliers', supplierRoutes); // /api/suppliers/*
app.use('/api/specifications', specificationRoutes); // /api/specifications/*
app.use('/api/specification-categories', specificationCategoryRoutes); // /api/specification-categories/*
app.use('/api/salary', salaryRoutes); // /api/salary/*
app.use('/api/bid-equipment', bidEquipmentRoutes); // /api/bid-equipment/*
app.use('/api/client-equipment', clientEquipmentRoutes); // /api/client-equipment/*
app.use('/api/backups', backupRoutes); // /api/backups/*

app.use('/api/client-attributes', clientAttributeRoutes); // /api/client-attributes/*
app.use('/api/analytics', analyticsRoutes); // /api/analytics/*
app.use('/api/notifications', notificationRoutes); // /api/notifications/*

// === Health check endpoint ===
// Проверка работоспособности сервера
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Navicon API работает с Prisma + PostgreSQL' });
});

// === Статические файлы ===
// Обслуживание загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Функция для создания автоматического бэкапа
function createScheduledBackup() {
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scheduled-backup-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Команда pg_dump
    const pgDumpCommand = `pg_dump --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.username} --dbname=${dbConfig.database} --no-password --format=c --compress=9 --file="${filepath}"`;

    // Устанавливаем пароль в переменную окружения
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    exec(pgDumpCommand, { env }, (error, stdout, stderr) => {
        if (error) {
            console.error('Ошибка создания автоматического бэкапа:', error);
        } else {
            console.log(`✅ Автоматический бэкап создан: ${filename}`);
        }
    });
}

// Настройка автоматических бэкапов (ежедневно в 2:00)
cron.schedule('0 2 * * *', () => {
    console.log('🔄 Запуск автоматического бэкапа...');
    createScheduledBackup();
});

// Получение порта из переменных окружения или значение по умолчанию
const PORT = process.env.PORT || 5000;

// Запуск сервера на указанном порту
const server = app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 База данных: ${process.env.DATABASE_URL ? 'настроена' : 'НЕ НАСТРОЕНА'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
    });
});
    console.log(`📊 Используется Prisma ORM с PostgreSQL`);
    console.log(`💾 Автоматические бэкапы настроены (ежедневно в 2:00)`);
    // Тест перезапуска
});