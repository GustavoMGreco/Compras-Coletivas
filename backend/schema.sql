CREATE DATABASE IF NOT EXISTS compras_coletivas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE compras_coletivas;

-- usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha   VARCHAR(255) NOT NULL,
  data_criado TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- grupos de compra
CREATE TABLE IF NOT EXISTS grupos (
  id             INT            AUTO_INCREMENT PRIMARY KEY,
  criador_id     INT            NOT NULL,
  nome           VARCHAR(200)   NOT NULL,
  descricao    	 TEXT,
  categoria      VARCHAR(50)    DEFAULT 'Tecnologia',
  preco_original DECIMAL(10,2)  NOT NULL,
  preco          DECIMAL(10,2)  NOT NULL,
  objetivo       INT            NOT NULL,
  data_expira    DATETIME       DEFAULT NULL,   -- NULL = sem prazo
  data_criacao   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- membros dos grupos
CREATE TABLE IF NOT EXISTS membros_grupo (
  grupo_id    INT       NOT NULL,
  usuario_id  INT       NOT NULL,
  data_entrou TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (grupo_id, usuario_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)    ON DELETE CASCADE
);


-- dados de exemplo
INSERT IGNORE INTO usuarios (id, nome, email, senha) VALUES
  (1, 'Admin Seed', 'admin@seed.com', 'seed123');

INSERT IGNORE INTO grupos
  (id, criador_id, nome, descricao, categoria, preco_original, preco, objetivo) VALUES
  (1, 1, 'iPhone 15 Pro Max 256GB',   'Titanium, câmera 48MP, chip A17 Pro',       'Tecnologia', 8999.00, 7499.00, 100),
  (2, 1, 'MacBook Air M3 13" 512GB',  'Chip M3, 16GB RAM, bateria até 18h',         'Tecnologia',12999.00,10799.00, 50),
  (3, 1, 'Apple Watch Series 9 45mm', 'GPS, monitor cardíaco, tela always-on',      'Tecnologia', 4499.00, 3599.00, 150),
  (4, 1, 'Tênis Nike Air Max 270',    'Masculino/feminino, diversos tamanhos',       'Moda',        699.00,   459.00, 15),
  (5, 1, 'Cesta Orgânica Semanal',    'Frutas e verduras direto do produtor',        'Alimentos',   140.00,    89.00, 10),
  (6, 1, 'Setup Gamer Logitech',      'Mouse, teclado mecânico e headset – combo',  'Tecnologia', 1900.00,  1499.00, 25);

INSERT IGNORE INTO membros_grupo (grupo_id, usuario_id) VALUES
  (1,1),(2,1),(3,1),(4,1),(5,1),(6,1);