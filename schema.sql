-- ORBITO FASHION — Cloudflare D1 schema + seed data
-- Cloudflare Dashboard → D1 → database → Console-এ পুরো ফাইল paste করে Execute করবেন।

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  old_price INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  sizes TEXT NOT NULL DEFAULT '["M","L","XL","XXL"]',
  stock INTEGER NOT NULL DEFAULT 100,
  description TEXT NOT NULL DEFAULT '',
  is_trending INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS sliders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  button_text TEXT NOT NULL DEFAULT 'এখনই কিনুন',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  payment TEXT NOT NULL DEFAULT 'cod',
  items_json TEXT NOT NULL,
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ===== Seed: categories =====
INSERT INTO categories (id, name, image, sort) VALUES
(1, 'পাঞ্জাবি', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', 1),
(2, 'জামদানি ও শাড়ি', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80', 2),
(3, 'সালোয়ার কামিজ', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80', 3),
(4, 'কুর্তি ও টপস', 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=100&q=80', 4),
(5, 'টি-শার্ট ও পোলো', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80', 5),
(6, 'ক্যাজুয়াল শার্ট', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80', 6),
(7, 'বোরকা ও হিজাব', 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?auto=format&fit=crop&w=100&q=80', 7),
(8, 'জিন্স ও গ্যাবার্ডিন', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=100&q=80', 8);

-- ===== Seed: sliders =====
INSERT INTO sliders (image, badge, title, subtitle, button_text, sort) VALUES
('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80', 'উৎসব কালেকশন', 'দেশীয় সুতায় বোনা আভিজাত্যের ছোঁয়া', 'ঢাকাই জামদানি ও হাতে বোনা ঐতিহ্যবাহী পোশাক', 'এখনই কিনুন', 1),
('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80', 'মেগা ফ্ল্যাশ সেল', 'সকল পোশাকে সর্বোচ্চ ৪০% পর্যন্ত মূল্যছাড়', 'সীমিত সময়ের অফার — স্টক শেষ হওয়ার আগেই নিন', 'অফার দেখুন', 2),
('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', 'গরমের আরাম', '১০০% পিওর কটন সামার কালেকশন', 'নরম, আরামদায়ক ও টেকসই গ্রীষ্মের পোশাক', 'কালেকশন দেখুন', 3);

-- ===== Seed: products =====
INSERT INTO products (name, category_id, price, old_price, image, badge, sizes, stock, description, is_trending, is_new) VALUES
('ঢাকাইয়া হাফ সিল্ক জামদানি', 2, 2450, 3000, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', 'হট ডিল', '["M","L","XL"]', 25, 'ঢাকার ঐতিহ্যবাহী হাতে বোনা হাফ সিল্ক জামদানি। উৎসব ও অনুষ্ঠানের জন্য উপযুক্ত।', 1, 0),
('প্রিমিয়াম কটন এমব্রয়ডারি পাঞ্জাবি', 1, 1650, 2100, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80', '-২০%', '["M","L","XL","XXL"]', 40, 'প্রিমিয়াম কটন কাপড়ে নিখুঁত এমব্রয়ডারি কাজ। ঈদ ও বিয়ের অনুষ্ঠানে পরার মতো।', 1, 0),
('মসলিন কারচুপি থ্রি-পিস', 3, 2200, 0, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', '', '["S","M","L","XL"]', 30, 'মসলিন কাপড়ে হাতের কারচুপি কাজের থ্রি-পিস সেট। সালোয়ার ও ওড়না সহ।', 1, 0),
('ড্রপ শোল্ডার ওভারসাইজ টি-শার্ট', 5, 550, 750, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', 'বেস্ট সেলার', '["M","L","XL"]', 100, 'ট্রেন্ডি ড্রপ শোল্ডার ফিটের ওভারসাইজ টি-শার্ট। ১০০% কটন, দৈনন্দিন ব্যবহারের জন্য।', 1, 0),
('লং ফ্লোরাল প্রিন্টেড কুর্তি', 4, 1150, 0, 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=600&q=80', '', '["S","M","L","XL"]', 35, 'লং ফ্লোরাল প্রিন্টের কুর্তি। অফিস, কলেজ ও ক্যাজুয়াল আউটিংয়ের জন্য পারফেক্ট।', 1, 0),
('মেনজ ক্যাজুয়াল লিনেন শার্ট', 6, 1350, 0, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', 'নতুন', '["M","L","XL","XXL"]', 45, 'আরামদায়ক লিনেন কাপড়ের ক্যাজুয়াল শার্ট। গরমে স্বস্তি দেয়।', 0, 1),
('দুবাই চেরি মডেস্ট বোরকা', 7, 2800, 0, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80', 'নতুন', '["M","L","XL"]', 20, 'দুবাই চেরি ফ্যাব্রিকের প্রিমিয়াম মডেস্ট বোরকা। হিজাব সহ সেট।', 0, 1),
('চেক ফরমাল অফিস শার্ট', 6, 1490, 0, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80', 'নতুন', '["M","L","XL","XXL"]', 50, 'এলিগ্যান্ট চেক প্যাটার্নের ফরমাল শার্ট। অফিস ও মিটিংয়ের জন্য।', 0, 1),
('রাজশাহী বলাকা সিল্ক পাঞ্জাবি', 1, 2450, 0, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 'নতুন', '["M","L","XL","XXL"]', 25, 'রাজশাহীর বিখ্যাত বলাকা সিল্কে তৈরি প্রিমিয়াম পাঞ্জাবি।', 0, 1),
('ব্লক প্রিন্ট সুতি টু-পিস', 3, 1590, 0, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80', 'নতুন', '["S","M","L","XL"]', 30, 'হাতে করা ব্লক প্রিন্টের সুতি টু-পিস। আরামদায়ক ও স্টাইলিশ।', 0, 1),
('পিকে কটন পোলো টি-শার্ট', 5, 790, 0, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80', '', '["M","L","XL","XXL"]', 80, 'পিকে কটন ফ্যাব্রিকের ক্লাসিক পোলো টি-শার্ট।', 0, 0),
('স্লিম ফিট স্ট্রেচ ডেনিম জিন্স', 8, 1550, 1800, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', '', '["30","32","34","36"]', 60, 'স্ট্রেচ ডেনিমের স্লিম ফিট জিন্স। দীর্ঘদিন টেকসই।', 0, 0);

-- ===== Seed: settings =====
INSERT INTO settings (key, value) VALUES
('brand_name', 'ORBITO FASHION'),
('whatsapp_number', '8801700000000'),
('helpline', '০১৭০০-০০০০০০'),
('address', 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ'),
('delivery_inside', '60'),
('delivery_outside', '120');
