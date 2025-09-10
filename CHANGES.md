# Обновление названий таблиц с префиксом syrok_

## Изменения в базе данных

### Таблицы:
- `content_items` → `syrok_content_items`

### Buckets в Supabase Storage:
- `media` → `syrok-media`
- `cv-files` → `syrok-cv-files`

### Функции и триггеры:
- `update_updated_at_column()` → `syrok_update_updated_at_column()`
- `update_content_items_updated_at` → `syrok_update_content_items_updated_at`

### Политики безопасности:
- Обновлены названия политик с префиксом "syrok"

## Изменения в коде

### Обновленные файлы:
- `src/lib/supabase.ts` - интерфейс Database
- `src/components/ContentGrid.tsx` - запросы к таблице и bucket'ам
- `src/components/ContentManager.tsx` - CRUD операции
- `src/pages/CV.tsx` - работа с CV файлами
- `src/pages/Contact.tsx` - получение контактов
- `src/pages/About.tsx` - получение информации о себе
- `src/pages/Admin.tsx` - статистика контента

### Обновленная документация:
- `supabase-schema.sql` - SQL скрипт с новыми названиями
- `README.md` - описание таблицы
- `SETUP.md` - инструкции по настройке
- `PROJECT_OVERVIEW.md` - обзор проекта

## Инструкции по применению

1. **Выполните новый SQL скрипт** `supabase-schema.sql` в Supabase Dashboard
2. **Удалите старые таблицы и bucket'ы** (если они существовали)
3. **Перезапустите приложение** - код уже обновлен

Все изменения применены и готовы к использованию! 🎉
