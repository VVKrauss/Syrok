-- Полный скрипт для создания структуры базы данных CV сайта
-- Удаляем все существующие объекты и создаем заново

-- ============================================
-- УДАЛЕНИЕ СУЩЕСТВУЮЩИХ ОБЪЕКТОВ
-- ============================================

-- Удаляем таблицы в правильном порядке (сначала зависимые, потом основные)
DROP TABLE IF EXISTS syrok_article_blocks CASCADE;
DROP TABLE IF EXISTS syrok_cv_sections CASCADE;
DROP TABLE IF EXISTS syrok_articles CASCADE;
DROP TABLE IF EXISTS syrok_content_items CASCADE;

-- Удаляем функцию
DROP FUNCTION IF EXISTS syrok_update_updated_at_column();

-- Удаляем политики для хранилища
DROP POLICY IF EXISTS "Anyone can view syrok media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload syrok media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update syrok media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete syrok media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view syrok CV files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload syrok CV files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update syrok CV files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete syrok CV files" ON storage.objects;

-- ============================================
-- СОЗДАНИЕ ТАБЛИЦ
-- ============================================

-- Таблица для основного контента сайта
CREATE TABLE syrok_content_items (
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

-- Таблица для статей с блочным контентом
CREATE TABLE syrok_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT, -- Краткое описание для превью
  featured_image VARCHAR(500), -- Главное изображение статьи
  type VARCHAR(20) NOT NULL CHECK (type IN ('project', 'research')), -- Тип статьи
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  order_index INTEGER NOT NULL DEFAULT 0,
  meta_title VARCHAR(255), -- SEO заголовок
  meta_description TEXT, -- SEO описание
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для блоков статей
CREATE TABLE syrok_article_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES syrok_articles(id) ON DELETE CASCADE,
  block_type VARCHAR(20) NOT NULL CHECK (block_type IN ('text', 'image', 'map', 'code', 'quote')),
  content TEXT, -- Содержимое блока (текст, код, цитата)
  image_url VARCHAR(500), -- URL изображения для блока типа 'image'
  image_alt VARCHAR(255), -- Alt текст для изображения
  map_embed TEXT, -- HTML код для встраивания карты
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для блоков резюме
CREATE TABLE syrok_cv_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('header', 'experience', 'education', 'skills', 'projects', 'languages', 'certifications', 'achievements')),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content TEXT, -- Описание или детали
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE, -- Для текущих позиций
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- СОЗДАНИЕ ИНДЕКСОВ
-- ============================================

-- Индексы для syrok_content_items
CREATE INDEX idx_syrok_content_items_type ON syrok_content_items(type);
CREATE INDEX idx_syrok_content_items_order ON syrok_content_items(type, order_index);

-- Индексы для syrok_articles
CREATE INDEX idx_syrok_articles_type ON syrok_articles(type);
CREATE INDEX idx_syrok_articles_status ON syrok_articles(status);
CREATE INDEX idx_syrok_articles_slug ON syrok_articles(slug);
CREATE INDEX idx_syrok_articles_order ON syrok_articles(type, order_index);

-- Индексы для syrok_article_blocks
CREATE INDEX idx_syrok_article_blocks_article ON syrok_article_blocks(article_id);
CREATE INDEX idx_syrok_article_blocks_order ON syrok_article_blocks(article_id, order_index);
CREATE INDEX idx_syrok_article_blocks_type ON syrok_article_blocks(block_type);

-- Индексы для syrok_cv_sections
CREATE INDEX idx_syrok_cv_sections_type ON syrok_cv_sections(section_type);
CREATE INDEX idx_syrok_cv_sections_order ON syrok_cv_sections(order_index);

-- ============================================
-- СОЗДАНИЕ ФУНКЦИИ И ТРИГГЕРОВ
-- ============================================

-- Функция для автоматического обновления updated_at
CREATE FUNCTION syrok_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER syrok_update_content_items_updated_at 
  BEFORE UPDATE ON syrok_content_items 
  FOR EACH ROW 
  EXECUTE FUNCTION syrok_update_updated_at_column();

CREATE TRIGGER syrok_update_articles_updated_at 
  BEFORE UPDATE ON syrok_articles 
  FOR EACH ROW 
  EXECUTE FUNCTION syrok_update_updated_at_column();

CREATE TRIGGER syrok_update_article_blocks_updated_at 
  BEFORE UPDATE ON syrok_article_blocks 
  FOR EACH ROW 
  EXECUTE FUNCTION syrok_update_updated_at_column();

CREATE TRIGGER syrok_update_cv_sections_updated_at 
  BEFORE UPDATE ON syrok_cv_sections 
  FOR EACH ROW 
  EXECUTE FUNCTION syrok_update_updated_at_column();

-- ============================================
-- НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE syrok_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE syrok_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE syrok_article_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE syrok_cv_sections ENABLE ROW LEVEL SECURITY;

-- ============================================
-- СОЗДАНИЕ ПОЛИТИК БЕЗОПАСНОСТИ
-- ============================================

-- Политики для syrok_content_items
CREATE POLICY "Anyone can read syrok content" ON syrok_content_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage syrok content" ON syrok_content_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Политики для syrok_articles
CREATE POLICY "Anyone can read published syrok articles" ON syrok_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage syrok articles" ON syrok_articles
  FOR ALL USING (auth.role() = 'authenticated');

-- Политики для syrok_article_blocks
CREATE POLICY "Anyone can read syrok article blocks" ON syrok_article_blocks
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage syrok article blocks" ON syrok_article_blocks
  FOR ALL USING (auth.role() = 'authenticated');

-- Политики для syrok_cv_sections
CREATE POLICY "Anyone can read syrok cv sections" ON syrok_cv_sections
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage syrok cv sections" ON syrok_cv_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- НАСТРОЙКА ХРАНИЛИЩА
-- ============================================

-- Создание хранилища для медиа файлов
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('syrok-media', 'syrok-media', true),
  ('syrok-cv-files', 'syrok-cv-files', true)
ON CONFLICT (id) DO NOTHING;

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

-- ============================================
-- ВСТАВКА ПРИМЕРОВ ДАННЫХ
-- ============================================

-- Примеры данных для тестирования
INSERT INTO syrok_content_items (type, title, subtitle, description, order_index) VALUES
  ('about', 'About Me', 'Professional Summary', 'I am a passionate developer with expertise in modern web technologies. My journey in software development spans over several years, during which I have worked on various projects ranging from small startups to large enterprise applications.', 0),
  ('contact', 'Email', 'john.doe@example.com', 'Primary contact method', 0),
  ('contact', 'LinkedIn', 'linkedin.com/in/johndoe', 'Professional networking', 1),
  ('contact', 'GitHub', 'github.com/johndoe', 'Code repositories', 2),
  ('contact', 'Phone', '+1 (555) 123-4567', 'Direct contact', 3),
  ('contact', 'Location', 'San Francisco, CA', 'Current location', 4);

-- Примеры статей
INSERT INTO syrok_articles (title, subtitle, slug, excerpt, type, status, order_index) VALUES
  ('E-commerce Platform', 'Full-stack web application', 'ecommerce-platform', 'A comprehensive e-commerce solution built with React and Node.js', 'project', 'published', 0),
  ('Machine Learning Research', 'AI-powered recommendation system', 'ml-research', 'Research on improving recommendation algorithms using deep learning', 'research', 'published', 0);

-- Примеры блоков для первой статьи
INSERT INTO syrok_article_blocks (article_id, block_type, content, order_index) VALUES
  ((SELECT id FROM syrok_articles WHERE slug = 'ecommerce-platform'), 'text', 'This project involved building a complete e-commerce platform from scratch. The application features user authentication, product catalog, shopping cart, and payment processing.', 0),
  ((SELECT id FROM syrok_articles WHERE slug = 'ecommerce-platform'), 'text', 'Technologies used: React, Node.js, PostgreSQL, Stripe API, AWS S3', 1);

-- Примеры блоков для второй статьи
INSERT INTO syrok_article_blocks (article_id, block_type, content, order_index) VALUES
  ((SELECT id FROM syrok_articles WHERE slug = 'ml-research'), 'text', 'This research focuses on improving recommendation systems using advanced machine learning techniques.', 0),
  ((SELECT id FROM syrok_articles WHERE slug = 'ml-research'), 'text', 'The study achieved a 15% improvement in recommendation accuracy compared to traditional collaborative filtering methods.', 1);

-- Примеры секций CV
INSERT INTO syrok_cv_sections (section_type, title, subtitle, content, start_date, end_date, current, order_index) VALUES
  ('header', 'John Doe', 'Senior Full-Stack Developer', 'Experienced developer with 5+ years in web technologies', NULL, NULL, true, 0),
  ('experience', 'Senior Developer', 'Tech Corp', 'Led development of multiple web applications', '2020-01-01', NULL, true, 0),
  ('education', 'Computer Science', 'University of Technology', 'Bachelor of Science in Computer Science', '2015-09-01', '2019-06-01', false, 0),
  ('skills', 'Programming Languages', NULL, 'JavaScript, TypeScript, Python, Java', NULL, NULL, true, 0),
  ('skills', 'Frameworks', NULL, 'React, Node.js, Express, Django', NULL, NULL, true, 1);

-- ============================================
-- ЗАВЕРШЕНИЕ
-- ============================================

-- Выводим сообщение об успешном завершении
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: syrok_content_items, syrok_articles, syrok_article_blocks, syrok_cv_sections';
  RAISE NOTICE 'Storage buckets created: syrok-media, syrok-cv-files';
  RAISE NOTICE 'Sample data inserted for testing';
END $$;