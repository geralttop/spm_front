# Настройка переменных окружения (Frontend)

## Первоначальная настройка

1. Скопируйте файл `.env.example` в `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Заполните переменные в файле `.env.local`:

### API Configuration
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Важно:** В Next.js переменные окружения, которые должны быть доступны в браузере, должны начинаться с префикса `NEXT_PUBLIC_`.

## Для разных окружений

### Development (разработка)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production (продакшн)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Staging (тестирование)
```env
NEXT_PUBLIC_API_URL=https://staging-api-domain.com
```

## Безопасность

- **НИКОГДА** не коммитьте файлы `.env.local`, `.env.development.local`, `.env.production.local` в репозиторий
- Файл `.env.example` можно коммитить - он содержит только примеры без реальных данных
- Все переменные с префиксом `NEXT_PUBLIC_` будут доступны в браузере, поэтому не добавляйте туда секретные ключи