# NaviconWeb

CRM система с frontend (React) и backend (Node.js + Express + Prisma).

## Развёртывание на Railway

### Шаг 1: Подключение репозитория
1. Создайте аккаунт на [Railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub"
3. Выберите ваш репозиторий

### Шаг 2: Настройка переменных окружения
В Railway dashboard перейдите в "Variables" и добавьте:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | MySQL connection string от reg.ru |
| `JWT_SECRET` | Случайная строка (минимум 32 символа) |
| `FRONTEND_URL` | URL вашего frontend (например, https://your-site.ru) |

### Шаг 3: Получение API URL бэкенда
После успешного деплоя:

1. В Railway dashboard перейдите в ваш проект
2. Нажмите на сервис (Service) → "Settings"
3. Найдите секцию "Networking" или "Domains"
4. Скопируйте ваш URL:
   - Формат: `https://your-service-name.up.railway.app`
   - Или кастомный домен, если настроили

### Шаг 4: Подключение фронтенда
В frontend коде используйте API:

```javascript
// В config или .env файле фронтенда
const API_URL = 'https://your-backend-service.up.railway.app/api';

// Пример запроса
fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
```

## Управление сервером

### Универсальный скрипт (рекомендуется)
```bash
server-control.bat start    # запуск серверов
server-control.bat stop     # остановка серверов
server-control.bat restart  # перезапуск серверов
```

### Отдельные скрипты

#### Запуск
- `start-full.bat` - полное приложение (frontend + backend в отдельных окнах)
- `start-server.bat` - только backend
- `run-minimal-server.bat` - минимальный сервер для тестирования

#### Остановка
- `stop-server.bat` - полная остановка (ищет процессы по портам)
- `stop-server-simple.bat` - быстрая остановка всех Node.js процессов
- `stop-server-ps.bat` - остановка через PowerShell

## Разработка

### Backend
```bash
cd CRM_base/backend
npm install
npm run dev
```

### Frontend
```bash
cd CRM_base/frontend
npm install
npm run dev
```