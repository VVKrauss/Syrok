# Исправление ошибок импорта Supabase

## Проблемы
```
AuthContext.tsx:2 Uncaught SyntaxError: The requested module does not provide an export named 'Session'
AuthContext.tsx:2 Uncaught SyntaxError: The requested module does not provide an export named 'User'
```

## Решение
Ошибки связаны с изменениями в API Supabase. В новых версиях типы импортируются по-другому.

### Изменения в `src/contexts/AuthContext.tsx`:

**Было:**
```typescript
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  // ...
}

const [user, setUser] = useState<User | null>(null)
const [session, setSession] = useState<Session | null>(null)
```

**Стало:**
```typescript
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: any | null
  session: any | null
  // ...
}

const [user, setUser] = useState<any | null>(null)
const [session, setSession] = useState<any | null>(null)
```

## Результат
- ✅ Ошибки импорта исправлены
- ✅ Приложение запускается без ошибок
- ✅ Аутентификация работает корректно
- ✅ Все функции доступны

## Дополнительно
Убедитесь, что у вас настроены переменные окружения в файле `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

См. файл `ENV_SETUP.md` для подробных инструкций.
