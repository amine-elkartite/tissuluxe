CREATE DATABASE IF NOT EXISTS tissuluxe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tissuluxe_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40),
  password VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  avatar VARCHAR(255),
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255),
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  old_price DECIMAL(10,2),
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(80),
  main_image VARCHAR(255),
  images JSON,
  material VARCHAR(120),
  width VARCHAR(80),
  weight VARCHAR(80),
  pattern VARCHAR(120),
  colors JSON,
  usage_text TEXT,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(120) NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  customer_name VARCHAR(180) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(120) NOT NULL,
  postal_code VARCHAR(40),
  country VARCHAR(80) DEFAULT 'Maroc',
  delivery_method VARCHAR(80),
  payment_method VARCHAR(80),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  tracking_number VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(190) NOT NULL,
  product_image VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  subject VARCHAR(190) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('percent','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_order DECIMAL(10,2) NOT NULL DEFAULT 0,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  expires_at DATE NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(80),
  full_name VARCHAR(180),
  phone VARCHAR(40),
  address TEXT NOT NULL,
  city VARCHAR(120) NOT NULL,
  postal_code VARCHAR(40),
  country VARCHAR(80) DEFAULT 'Maroc',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES
('Admin', 'TissuLuxe', 'admin@tissuluxe.ma', '+212600000000', '$2a$10$W8jQM8ywfDQT94DQG.D9COxZiEuxJ7EJN69MMAI26ou1nRi2lTQzq', 'admin'),
('Sara', 'El Amrani', 'sara@example.com', '+212612345678', '$2a$10$y.Vi9rV1Macfpw9F3K.a/eNDa0b51R5HcX7wg4lAM4bm5LTDGlII.', 'customer');

INSERT INTO categories (name, slug, description, image, status) VALUES
('Tissus Fleuris', 'tissus-fleuris', 'Imprimés floraux élégants pour créations modernes.', 'images/products/fabric-01.jpg', 'active'),
('Tissus Caftan', 'tissus-caftan', 'Matières nobles pensées pour caftans raffinés.', 'images/products/fabric-02.jpg', 'active'),
('Soie Imprimée', 'soie-imprimee', 'Soies fluides et lumineuses aux motifs premium.', 'images/products/fabric-03.jpg', 'active'),
('Dentelle', 'dentelle', 'Dentelles délicates pour finitions couture.', 'images/products/fabric-04.jpg', 'active'),
('Décoration', 'decoration', 'Tissus décoratifs pour intérieurs élégants.', 'images/products/fabric-05.jpg', 'active'),
('Jacquard', 'jacquard', 'Jacquards texturés pour pièces de caractère.', 'images/products/fabric-06.jpg', 'active'),
('Tissus Unis', 'tissus-unis', 'Unis premium faciles à coordonner pour couture et décoration.', 'images/products/fabric-10.jpg', 'active');

INSERT INTO products
(category_id, name, slug, description, short_description, price, old_price, stock, sku, main_image, images, material, width, weight, pattern, colors, usage_text, rating, reviews_count, status, featured)
VALUES
(1, 'Satin floral royal', 'satin-floral-royal', 'Satin premium au tombé souple, idéal pour robes, caftans légers et accessoires précieux.', 'Satin floral lumineux pour créations habillées.', 149.00, 179.00, 34, 'TLX-FL-001', 'images/products/fabric-01.jpg', JSON_ARRAY('images/products/fabric-01.jpg','images/products/fabric-02.jpg'), 'Satin polyester luxe', '150 cm', '180 g/m2', 'Floral', JSON_ARRAY('Bleu','Doré','Ivoire'), 'Robes, caftans, foulards', 4.80, 18, 'active', 1),
(2, 'Brocart caftan or antique', 'brocart-caftan-or-antique', 'Brocart texturé aux reflets dorés pour tenues cérémoniales haut de gamme.', 'Brocart noble aux reflets or antique.', 249.00, 299.00, 18, 'TLX-CA-002', 'images/products/fabric-02.jpg', JSON_ARRAY('images/products/fabric-02.jpg','images/products/fabric-03.jpg'), 'Brocart', '145 cm', '260 g/m2', 'Arabesque', JSON_ARRAY('Or','Navy'), 'Caftans, vestes, cérémonies', 4.90, 11, 'active', 1),
(3, 'Soie imprimée jardin bleu', 'soie-imprimee-jardin-bleu', 'Soie douce et fluide avec imprimé jardin contemporain.', 'Soie fluide imprimée bleu jardin.', 279.00, NULL, 22, 'TLX-SO-003', 'images/products/fabric-03.jpg', JSON_ARRAY('images/products/fabric-03.jpg','images/products/fabric-04.jpg'), 'Soie mélangée', '140 cm', '95 g/m2', 'Imprimé', JSON_ARRAY('Bleu','Vert','Blanc'), 'Chemisiers, robes fluides', 5.00, 9, 'active', 1),
(4, 'Dentelle couture ivoire', 'dentelle-couture-ivoire', 'Dentelle fine avec motifs ajourés pour finitions délicates.', 'Dentelle ivoire pour finitions couture.', 189.00, 220.00, 27, 'TLX-DE-004', 'images/products/fabric-04.jpg', JSON_ARRAY('images/products/fabric-04.jpg'), 'Dentelle', '130 cm', '120 g/m2', 'Ajouré', JSON_ARRAY('Ivoire','Champagne'), 'Mariage, manches, superpositions', 4.70, 7, 'active', 1),
(5, 'Velours décoration navy', 'velours-decoration-navy', 'Velours profond et résistant pour assises, coussins et rideaux premium.', 'Velours navy dense pour intérieur premium.', 199.00, NULL, 15, 'TLX-DC-005', 'images/products/fabric-05.jpg', JSON_ARRAY('images/products/fabric-05.jpg','images/products/fabric-06.jpg'), 'Velours', '150 cm', '320 g/m2', 'Uni', JSON_ARRAY('Navy'), 'Décoration, rideaux, coussins', 4.60, 6, 'active', 0),
(6, 'Jacquard impérial bleu', 'jacquard-imperial-bleu', 'Jacquard structuré avec relief subtil et reflets sophistiqués.', 'Jacquard bleu structuré et sophistiqué.', 229.00, 260.00, 20, 'TLX-JA-006', 'images/products/fabric-06.jpg', JSON_ARRAY('images/products/fabric-06.jpg','images/products/fabric-07.jpg'), 'Jacquard', '150 cm', '240 g/m2', 'Géométrique', JSON_ARRAY('Bleu','Argent'), 'Vestes, caftans, décoration', 4.75, 13, 'active', 1),
(1, 'Crêpe floral nuit', 'crepe-floral-nuit', 'Crêpe doux aux fleurs profondes, parfait pour une silhouette fluide.', 'Crêpe floral souple sur fond nuit.', 139.00, NULL, 40, 'TLX-FL-007', 'images/products/fabric-07.jpg', JSON_ARRAY('images/products/fabric-07.jpg'), 'Crêpe', '145 cm', '160 g/m2', 'Floral', JSON_ARRAY('Navy','Rose'), 'Robes, jupes, ensembles', 4.50, 5, 'active', 0),
(2, 'Mousseline caftan perle', 'mousseline-caftan-perle', 'Mousseline légère, transparente et élégante pour superpositions.', 'Mousseline perle légère pour caftan.', 119.00, 149.00, 31, 'TLX-CA-008', 'images/products/fabric-08.jpg', JSON_ARRAY('images/products/fabric-08.jpg'), 'Mousseline', '150 cm', '70 g/m2', 'Uni', JSON_ARRAY('Perle','Doré'), 'Caftans, étoles, voiles', 4.40, 4, 'active', 0),
(3, 'Soie graphique cobalt', 'soie-graphique-cobalt', 'Imprimé graphique cobalt sur base soyeuse lumineuse.', 'Soie graphique cobalt contemporaine.', 259.00, NULL, 12, 'TLX-SO-009', 'images/products/fabric-09.jpg', JSON_ARRAY('images/products/fabric-09.jpg'), 'Soie mélangée', '140 cm', '100 g/m2', 'Graphique', JSON_ARRAY('Cobalt','Blanc'), 'Chemises, robes, foulards', 4.85, 8, 'active', 1),
(7, 'Popeline unie ivoire luxe', 'popeline-unie-ivoire-luxe', 'Popeline ivoire stable et douce pour chemises, doublures et pièces minimalistes.', 'Popeline unie ivoire au toucher net.', 99.00, 129.00, 55, 'TLX-UN-010', 'images/products/fabric-10.jpg', JSON_ARRAY('images/products/fabric-10.jpg'), 'Popeline coton', '150 cm', '130 g/m2', 'Uni', JSON_ARRAY('Ivoire','Blanc'), 'Chemises, doublures, bases couture', 4.65, 10, 'active', 1);

INSERT INTO addresses (user_id, label, full_name, phone, address, city, postal_code, country, is_default) VALUES
(2, 'Maison', 'Sara El Amrani', '+212612345678', '18 Rue des Créateurs', 'Casablanca', '20000', 'Maroc', 1);

INSERT INTO orders
(user_id, order_number, customer_name, email, phone, address, city, postal_code, country, delivery_method, payment_method, subtotal, delivery_fee, discount, total, status, tracking_number)
VALUES
(2, 'TLX-2026-100001', 'Sara El Amrani', 'sara@example.com', '+212612345678', '18 Rue des Créateurs', 'Casablanca', '20000', 'Maroc', 'standard', 'cash_on_delivery', 428.00, 0.00, 0.00, 428.00, 'processing', 'TRK-TLX-100001');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total) VALUES
(1, 1, 'Satin floral royal', 'images/products/fabric-01.jpg', 149.00, 1, 149.00),
(1, 3, 'Soie imprimée jardin bleu', 'images/products/fabric-03.jpg', 279.00, 1, 279.00);

INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES
(2, 1, 5, 'Très belle qualité, le tombé est magnifique.', 'approved'),
(2, 3, 5, 'La soie est lumineuse et très agréable à travailler.', 'approved');

INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('Nadia Atelier', 'nadia@example.com', 'Commande sur mesure', 'Bonjour, proposez-vous une sélection spéciale mariage ?', 'new');

INSERT INTO coupons (code, type, value, min_order, usage_limit, used_count, expires_at, status) VALUES
('WELCOME10', 'percent', 10.00, 100.00, 1000, 0, DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'active');
