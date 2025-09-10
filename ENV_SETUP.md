# Настройка переменных окружения

## Создайте файл .env.local в корне проекта cv-website

Скопируйте содержимое из `env.example` и заполните реальными значениями:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Где найти эти значения:

1. **VITE_SUPABASE_URL**: 
   - Откройте ваш проект в Supabase Dashboard
   - Перейдите в Settings > API
   - Скопируйте "Project URL"

2. **VITE_SUPABASE_ANON_KEY**:
   - В том же разделе Settings > API
   - Скопируйте "anon public" ключ

## Важно:
- Не коммитьте файл `.env.local` в git
- Используйте только для локальной разработки
- Для продакшена настройте переменные окружения в вашей платформе развертывания
