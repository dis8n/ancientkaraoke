-- SQL миграция для создания таблиц в Supabase
-- Выполнить в SQL Editor в Supabase Dashboard

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание таблицы generations
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_data JSONB NOT NULL,
  result_text TEXT NOT NULL,
  friendship_score INTEGER NOT NULL CHECK (friendship_score >= 0 AND friendship_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы leaderboard_entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generation_id UUID UNIQUE NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_generation FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(score);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_created_at ON leaderboard_entries(created_at);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at в users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security (RLS) для безопасности
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Политики RLS для users (пользователи могут видеть только свои данные)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Политики RLS для generations (пользователи могут видеть только свои генерации)
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Политики RLS для leaderboard_entries (все могут видеть лидерборд, но вставлять только свои записи)
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboard_entries FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

