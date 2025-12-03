# Инструкция по настройке Supabase

## 1. Переменные окружения

Добавьте в `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Database URL (найти в Supabase Dashboard: Settings > Database > Connection string)
# Используйте Connection Pooling URL (если доступен) или Direct Connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

## 2. Где найти DATABASE_URL

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **Database**
4. Найдите раздел **Connection string**
5. Выберите тип **URI** (Direct connection) - это нормально для development
6. Скопируйте строку подключения
7. **ВАЖНО**: Замените `[YOUR-PASSWORD]` на пароль вашей базы данных


**Если видите предупреждение "Not IPv4 compatible":**
- Используйте **Session Pooler** вместо Direct connection:
  1. В Supabase Dashboard → Settings → Database → Connection string
  2. Выберите **Method: Session Pooler** (вместо Direct connection)
  3. Скопируйте connection string с портом **6543** (не 5432)
  4. Формат будет: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true`

**Если вы не знаете пароль базы данных:**
  - Перейдите в **Settings** → **Database** → **Database password**
  - Если пароль не установлен, создайте новый или сбросьте существующий

## 3. Создание таблиц в Supabase

### Вариант 1: Через SQL Editor (рекомендуется)

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Создайте новый запрос
4. Скопируйте содержимое файла `supabase-migration.sql`
5. Вставьте в SQL Editor
6. Нажмите **Run** для выполнения

### Вариант 2: Через Prisma (после настройки DATABASE_URL)

После настройки `DATABASE_URL` в `.env.local`:

```bash
# Сгенерировать Prisma Client
npx prisma generate

# Применить схему к базе данных
npx prisma db push
```

## 4. Проверка

После создания таблиц проверьте в Supabase Dashboard:
- **Table Editor** → должны появиться таблицы: `users`, `generations`, `leaderboard_entries`
- **Database** → **Tables** → проверьте структуру таблиц

## 5. Настройка Row Level Security (RLS)

RLS политики уже включены в миграции. Они обеспечивают:
- Пользователи видят только свои данные
- Пользователи могут создавать только свои записи
- Лидерборд доступен всем для чтения

## 6. Настройка восстановления пароля

### 6.1 Настройка Redirect URL

Для работы страницы восстановления пароля (`/forgot-password`) необходимо настроить redirect URL в Supabase:

1. Откройте Supabase Dashboard → **Settings** → **Authentication** → **URL Configuration**
2. В разделе **Redirect URLs** добавьте:
   - `http://localhost:3000/reset-password` (для development)
   - `https://your-domain.com/reset-password` (для production)
3. Сохраните изменения

### 6.2 Настройка Email (важно для отправки писем!)

**Если письма не приходят**, проверьте настройки Email в Supabase:

1. Откройте Supabase Dashboard → **Settings** → **Authentication** → **Email Templates**
2. Убедитесь, что шаблон **Reset Password** включен и настроен
3. Проверьте настройки SMTP:
   - **Settings** → **Authentication** → **SMTP Settings**
   - По умолчанию Supabase использует встроенный SMTP (ограничен для бесплатного плана)
   - Для production рекомендуется настроить собственный SMTP (Gmail, SendGrid, Mailgun и т.д.)

4. **Для development/testing**:
   - Supabase может отправлять письма на встроенный SMTP
   - Проверьте папку **Spam** в почтовом ящике
   - Некоторые email провайдеры могут блокировать письма от Supabase

5. **Проверка отправки писем**:
   - В Supabase Dashboard → **Authentication** → **Users**
   - Найдите пользователя и проверьте, отправлялись ли ему письма
   - В логах можно увидеть статус отправки

**Важно**: На бесплатном плане Supabase есть ограничения на отправку email. Для production рекомендуется настроить собственный SMTP сервер.
