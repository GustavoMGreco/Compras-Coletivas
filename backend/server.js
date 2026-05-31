const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// conexão com o banco
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'senha123',
  database: process.env.DB_NAME     || 'compras_coletivas',
  waitForConnections: true,
  connectionLimit: 10,
});

// helpers
function ok(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}
function err(res, msg, status = 400) {
  res.status(status).json({ success: false, error: msg });
}


// 1. USUÁRIOS  (register / login / list / update / delete)

// GET /users  – lista todos os usuários (sem senha)
app.get('/users', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id,
            nome AS name,
            email,
            data_criado AS created_at
     FROM usuarios`
  );
  ok(res, rows);
});

// POST /users/register  – cadastro
app.post('/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return err(res, 'Preencha todos os campos.');
  if (password.length < 6)
    return err(res, 'Senha deve ter ao menos 6 caracteres.');

  const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (exists.length) return err(res, 'E-mail já cadastrado.');

  const [result] = await pool.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [name, email, password]
  );
  const user = { id: result.insertId, name, email };
  ok(res, user, 201);
});

// POST /users/login  – autenticação
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Preencha e-mail e senha.');

  const [rows] = await pool.query(
    'SELECT id, nome AS name, email FROM usuarios WHERE email = ? AND senha = ?',
    [email, password]
  );
  if (!rows.length) return err(res, 'E-mail ou senha incorretos.', 401);
  ok(res, rows[0]);
});

// PUT /users/:id  – atualiza nome ou senha
app.put('/users/:id', async (req, res) => {
  const { name, password } = req.body;
  if (!name && !password) return err(res, 'Informe name ou password para atualizar.');

  const fields = [];
  const values = [];
  if (name)     { fields.push('nome = ?');     values.push(name); }
  if (password) { fields.push('senha = ?'); values.push(password); }
  values.push(req.params.id);

  const [result] = await pool.query(
    `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values
  );
  if (!result.affectedRows) return err(res, 'Usuário não encontrado.', 404);
  ok(res, { updated: true });
});

// DELETE /users/:id  – remove usuário
app.delete('/users/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return err(res, 'Usuário não encontrado.', 404);
  ok(res, { deleted: true });
});


// 2. GRUPOS DE COMPRA  (CRUD completo)

// GET /groups  – lista todas as ofertas com contagem de membros
app.get('/groups', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT g.id,
           g.criador_id AS creator_id,
           g.nome        AS name,
           g.descricao   AS description,
           g.categoria   AS category,
           g.preco_original AS original_price,
           g.preco       AS price,
           g.objetivo    AS goal,
           g.data_expira AS expires_at,
           g.data_criacao AS created_at,
           COUNT(mg.usuario_id) AS member_count
    FROM grupos g
    LEFT JOIN membros_grupo mg ON mg.grupo_id = g.id
    GROUP BY g.id
    ORDER BY g.data_criacao DESC
  `);
  ok(res, rows);
});

// GET /groups/:id  – detalhes de um grupo
app.get('/groups/:id', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT g.id,
           g.criador_id AS creator_id,
           g.nome        AS name,
           g.descricao   AS description,
           g.categoria   AS category,
           g.preco_original AS original_price,
           g.preco       AS price,
           g.objetivo    AS goal,
           g.data_expira AS expires_at,
           g.data_criacao AS created_at,
           COUNT(mg.usuario_id) AS member_count
    FROM grupos g
    LEFT JOIN membros_grupo mg ON mg.grupo_id = g.id
    WHERE g.id = ?
    GROUP BY g.id
  `, [req.params.id]);
  if (!rows.length) return err(res, 'Grupo não encontrado.', 404);
  ok(res, rows[0]);
});

// POST /groups  – cria novo grupo (US07 / createGroup)
app.post('/groups', async (req, res) => {
  const { creator_id, name, description, category,
          original_price, price, goal } = req.body;

  if (!creator_id || !name || !description || !original_price || !price || !goal)
    return err(res, 'Preencha todos os campos obrigatórios.');
  if (price >= original_price)
    return err(res, 'Preço coletivo deve ser menor que o original.');
  if (goal < 2)
    return err(res, 'Meta deve ter ao menos 2 compradores.');

  const [result] = await pool.query(
    `INSERT INTO grupos (criador_id, nome, descricao, categoria, preco_original, preco, objetivo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [creator_id, name, description, category, original_price, price, goal]
  );
  // criador entra automaticamente como membro
  await pool.query(
    'INSERT INTO membros_grupo (grupo_id, usuario_id) VALUES (?, ?)',
    [result.insertId, creator_id]
  );
  ok(res, { id: result.insertId }, 201);
});

// PUT /groups/:id  – edita nome/descrição/preços/meta
app.put('/groups/:id', async (req, res) => {
  const { name, description, category, original_price, price, goal } = req.body;
  const fields = []; const values = [];
  if (name)           { fields.push('nome = ?');           values.push(name); }
  if (description)    { fields.push('descricao = ?');      values.push(description); }
  if (category)       { fields.push('categoria = ?');      values.push(category); }
  if (original_price) { fields.push('preco_original = ?'); values.push(original_price); }
  if (price)          { fields.push('preco = ?');          values.push(price); }
  if (goal)           { fields.push('objetivo = ?');        values.push(goal); }
  if (!fields.length) return err(res, 'Nenhum campo para atualizar.');
  values.push(req.params.id);

  const [result] = await pool.query(
    `UPDATE grupos SET ${fields.join(', ')} WHERE id = ?`, values
  );
  if (!result.affectedRows) return err(res, 'Grupo não encontrado.', 404);
  ok(res, { updated: true });
});

// DELETE /groups/:id  – remove grupo
app.delete('/groups/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM grupos WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return err(res, 'Grupo não encontrado.', 404);
  ok(res, { deleted: true });
});


// 3. MEMBROS  – participar / sair (joinGroup / leaveGroup)

// GET /groups/:id/members  – lista membros de um grupo
app.get('/groups/:id/members', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT u.id, u.nome AS name, u.email, mg.data_entrou AS joined_at
    FROM membros_grupo mg
    JOIN usuarios u ON u.id = mg.usuario_id
    WHERE mg.grupo_id = ?
  `, [req.params.id]);
  ok(res, rows);
});

// POST /groups/:id/members  – entrar no grupo (US08)
app.post('/groups/:id/members', async (req, res) => {
  const groupId = req.params.id;
  const { user_id } = req.body;
  if (!user_id) return err(res, 'user_id é obrigatório.');

  // valida prazo (US09) – se o grupo tiver expires_at
  const [gRows] = await pool.query(
    'SELECT objetivo AS goal, data_expira AS expires_at FROM grupos WHERE id = ?', [groupId]
  );
  if (!gRows.length) return err(res, 'Grupo não encontrado.', 404);
  const group = gRows[0];

  if (group.expires_at && new Date() > new Date(group.expires_at))
    return err(res, 'Oferta expirada.');
  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM membros_grupo WHERE grupo_id = ?', [groupId]
  );
  if (countRows[0].cnt >= group.goal)
    return err(res, 'Grupo já atingiu a meta!');

  const [exists] = await pool.query(
    'SELECT 1 FROM membros_grupo WHERE grupo_id = ? AND usuario_id = ?', [groupId, user_id]
  );
  if (exists.length) return err(res, 'Você já participa deste grupo.');

  await pool.query(
    'INSERT INTO membros_grupo (grupo_id, usuario_id) VALUES (?, ?)', [groupId, user_id]
  );
  ok(res, { joined: true }, 201);
});

// DELETE /groups/:id/members/:userId  – sair do grupo
app.delete('/groups/:id/members/:userId', async (req, res) => {
  const { id: groupId, userId } = req.params;

  // criador não pode sair
  const [gRows] = await pool.query(
    'SELECT criador_id FROM grupos WHERE id = ?', [groupId]
  );
  if (!gRows.length) return err(res, 'Grupo não encontrado.', 404);
  if (String(gRows[0].criador_id) === String(userId))
    return err(res, 'O criador não pode sair do grupo.');

  const [result] = await pool.query(
    'DELETE FROM membros_grupo WHERE grupo_id = ? AND usuario_id = ?', [groupId, userId]
  );
  if (!result.affectedRows) return err(res, 'Membro não encontrado.', 404);
  ok(res, { left: true });
});


// 4. BUSCA / FILTRO DE OFERTAS  (renderOffers / filterOffers)

// GET /users/:id/memberships  – grupos que o usuário participa (para marcar "Participando")
app.get('/users/:id/memberships', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT grupo_id AS group_id FROM membros_grupo WHERE usuario_id = ?', [req.params.id]
  );
  ok(res, rows);
});

// GET /search?q=termo  – busca por nome, categoria ou descrição
app.get('/search', async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(`
    SELECT g.id,
           g.criador_id AS creator_id,
           g.nome        AS name,
           g.descricao   AS description,
           g.categoria   AS category,
           g.preco_original AS original_price,
           g.preco       AS price,
           g.objetivo    AS goal,
           g.data_expira AS expires_at,
           g.data_criacao AS created_at,
           COUNT(mg.usuario_id) AS member_count
    FROM grupos g
    LEFT JOIN membros_grupo mg ON mg.grupo_id = g.id
    WHERE g.nome        LIKE ?
       OR g.categoria   LIKE ?
       OR g.descricao   LIKE ?
    GROUP BY g.id
    ORDER BY g.data_criacao DESC
  `, [q, q, q]);
  ok(res, rows);
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
