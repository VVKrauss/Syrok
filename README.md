# CV Website with Admin Panel

Персональный сайт резюме с админкой для управления контентом, построенный на React + TypeScript + Supabase.

## Технологии

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: CSS Modules
- **Routing**: React Router DOM

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── Layout.tsx      # Основной макет сайта
│   ├── ContentGrid.tsx # Компонент для отображения карточек
│   └── ProtectedRoute.tsx # Защищенный роут для админки
├── contexts/           # React контексты
│   └── AuthContext.tsx # Контекст аутентификации
├── lib/               # Утилиты и конфигурация
│   └── supabase.ts    # Конфигурация Supabase
├── pages/             # Страницы приложения
│   ├── Home.tsx       # Главная страница
│   ├── CV.tsx         # Страница с резюме
│   ├── Projects.tsx  # Проекты
│   ├── Research.tsx   # Исследования
│   ├── Training.tsx   # Обучение
│   ├── Volunteer.tsx   # Волонтерство
│   ├── Hobbies.tsx    # Хобби
│   ├── Contact.tsx    # Контакты
│   ├── About.tsx      # О себе
│   ├── Admin.tsx      # Админ-панель
│   └── AdminLogin.tsx # Вход в админку
└── App.tsx           # Главный компонент
```

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте новый проект в [Supabase](https://supabase.com)
2. Скопируйте `env.example` в `.env.local`:
   ```bash
   cp env.example .env.local
   ```
3. Заполните переменные окружения в `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Настройка базы данных

Выполните SQL скрипт `supabase-schema.sql` в SQL Editor вашего проекта Supabase. Этот скрипт создаст:

- Таблицу `content_items` для хранения контента
- Buckets для медиа файлов (`media`, `cv-files`)
- Политики безопасности (RLS)
- Примеры данных

### 4. Настройка аутентификации

1. В Supabase Dashboard перейдите в Authentication > Settings
2. Отключите "Enable email confirmations" для упрощения тестирования
3. Создайте пользователя в Authentication > Users

### 5. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173) в браузере.

## Использование

### Публичные страницы

- **Home** (`/`) - Главная страница с навигацией
- **CV** (`/cv`) - Просмотр и скачивание резюме
- **Projects** (`/projects`) - Портфолио проектов
- **Research** (`/research`) - Научные работы
- **Training** (`/training`) - Профессиональное обучение
- **Volunteer** (`/volunteer`) - Волонтерская деятельность
- **Hobbies** (`/hobbies`) - Хобби и интересы
- **Contact** (`/contact`) - Контактная информация
- **About** (`/about`) - О себе

### Админ-панель

- **Вход** (`/admin/login`) - Авторизация администратора
- **Панель управления** (`/admin`) - Управление контентом

## Структура данных

### Таблица syrok_content_items

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| type | VARCHAR(20) | Тип контента (cv, project, research, etc.) |
| title | VARCHAR(255) | Заголовок |
| subtitle | VARCHAR(255) | Подзаголовок |
| description | TEXT | Описание |
| media_url | VARCHAR(500) | Ссылка на медиа файл |
| order_index | INTEGER | Порядок сортировки |
| contact_icon | VARCHAR(10) | Иконка для контактов |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Типы контента

- `cv` - Резюме (PDF файл)
- `project` - Проекты
- `research` - Исследования
- `training` - Обучение
- `volunteer` - Волонтерство
- `hobby` - Хобби
- `contact` - Контакты
- `about` - О себе

## Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Деплой произойдет автоматически

### Другие платформы

Проект совместим с любыми платформами, поддерживающими статические сайты:
- Netlify
- GitHub Pages
- Firebase Hosting

## Особенности

- **Адаптивный дизайн** - работает на всех устройствах
- **SEO оптимизация** - мета-теги и структурированные данные
- **Безопасность** - Row Level Security в Supabase
- **Производительность** - оптимизированные изображения и код
- **Доступность** - семантическая разметка и ARIA атрибуты

## Разработка

### Добавление новых страниц

1. Создайте компонент в `src/pages/`
2. Добавьте роут в `src/App.tsx`
3. Добавьте ссылку в навигацию `src/components/Layout.tsx`

### Стилизация

Используйте CSS Modules для изоляции стилей:
```css
/* Component.module.css */
.container {
  /* стили */
}
```

### Работа с Supabase

```typescript
import { supabase } from '../lib/supabase'

// Получение данных
const { data, error } = await supabase
  .from('content_items')
  .select('*')
  .eq('type', 'project')

// Загрузка файла
const { data, error } = await supabase.storage
  .from('media')
  .upload('filename.jpg', file)
```

## Лицензия

MIT License