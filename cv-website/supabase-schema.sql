-- Создание таблицы syrok_content_items для хранения всего контента сайта
CREATE TABLE IF NOT EXISTS syrok_content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cv', 'project', 'research', 'training', 'volunteer', 'hobby', 'contact', 'about')),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  media_url VARCHAR(500),
  order_index INTEGER NOT NULL DEFAULT 0,
  contact_icon VARCHAR(10), -- Для эмодзи иконок контактов
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_syrok_content_items_type ON syrok_content_items(type);
CREATE INDEX IF NOT EXISTS idx_syrok_content_items_order ON syrok_content_items(type, order_index);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION syrok_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER syrok_update_content_items_updated_at 
  BEFORE UPDATE ON syrok_content_items 
  FOR EACH ROW 
  EXECUTE FUNCTION syrok_update_updated_at_column();

-- Настройка Row Level Security (RLS)
ALTER TABLE syrok_content_items ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: все могут читать контент
CREATE POLICY "Anyone can read syrok content" ON syrok_content_items
  FOR SELECT USING (true);

-- Политика для записи: только аутентифицированные пользователи могут изменять контент
CREATE POLICY "Authenticated users can manage syrok content" ON syrok_content_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Создание хранилища для медиа файлов
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('syrok-media', 'syrok-media', true),
  ('syrok-cv-files', 'syrok-cv-files', true);

-- Политики для хранилища медиа файлов
CREATE POLICY "Anyone can view syrok media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'syrok-media');

CREATE POLICY "Authenticated users can upload syrok media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'syrok-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update syrok media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'syrok-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete syrok media" ON storage.objects
  FOR DELETE USING (bucket_id = 'syrok-media' AND auth.role() = 'authenticated');

-- Политики для хранилища CV файлов
CREATE POLICY "Anyone can view syrok CV files" ON storage.objects
  FOR SELECT USING (bucket_id = 'syrok-cv-files');

CREATE POLICY "Authenticated users can upload syrok CV files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'syrok-cv-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update syrok CV files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'syrok-cv-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete syrok CV files" ON storage.objects
  FOR DELETE USING (bucket_id = 'syrok-cv-files' AND auth.role() = 'authenticated');

-- Вставка примеров данных для тестирования
INSERT INTO syrok_content_items (type, title, subtitle, description, order_index) VALUES
  ('about', 'About Me', 'Professional Summary', 'I am a passionate developer with expertise in modern web technologies. My journey in software development spans over several years, during which I have worked on various projects ranging from small startups to large enterprise applications.', 0),
  ('contact', 'Email', 'john.doe@example.com', 'Primary contact method', 0),
  ('contact', 'LinkedIn', 'linkedin.com/in/johndoe', 'Professional networking', 1),
  ('contact', 'GitHub', 'github.com/johndoe', 'Code repositories', 2),
  ('contact', 'Phone', '+1 (555) 123-4567', 'Direct contact', 3),
  ('contact', 'Location', 'New York, NY', 'Current location', 4);
