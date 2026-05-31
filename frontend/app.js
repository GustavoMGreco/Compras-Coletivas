/* 
4 funcionalidades:
  1. Cadastro e login de usuário
  2. Criação de grupos de compra
  3. Participar / sair de grupos
  4. Listagem e busca de ofertas em tempo real
*/

// BD
function getUsers()   { return JSON.parse(localStorage.getItem('cj_users')  || '[]'); }
function getGroups()  { return JSON.parse(localStorage.getItem('cj_groups') || '[]'); }
function getSession() { return JSON.parse(localStorage.getItem('cj_session') || 'null'); }
function saveUsers(u)   { localStorage.setItem('cj_users',   JSON.stringify(u)); }
function saveGroups(g)  { localStorage.setItem('cj_groups',  JSON.stringify(g)); }
function saveSession(s) { localStorage.setItem('cj_session', JSON.stringify(s)); }

// emojis de placeholder por categoria
const CATEGORY_EMOJI = {
  'Tecnologia': '💻', 'Moda': '👟', 'Alimentos': '🥗',
  'Casa': '🛋️', 'Esportes': '⚽', 'Beleza': '💄'
};

const CATEGORY_IMG = {
  'Tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  'Moda':       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Alimentos':  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
  'Casa':       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'Esportes':   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  'Beleza':     'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
};

function uid() { return '_' + Math.random().toString(36).substr(2, 9); }

// Seed: produtos de exemplo
function seedGroups() {
  if (getGroups().length > 0) return;
  const seed = [
    { id: uid(), creatorId: 'seed', name: 'iPhone 15 Pro Max 256GB',     desc: 'Titanium, câmera 48MP, chip A17 Pro',          category: 'Tecnologia', originalPrice: 8999,  price: 7499,  goal: 100, members: Array.from({length:85}, (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'MacBook Air M3 13" 512GB',    desc: 'Chip M3, 16GB RAM, bateria até 18h',           category: 'Tecnologia', originalPrice: 12999, price: 10799, goal: 50,  members: Array.from({length:42}, (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'Apple Watch Series 9 45mm',   desc: 'GPS, monitor cardíaco, tela always-on',        category: 'Tecnologia', originalPrice: 4499,  price: 3599,  goal: 150, members: Array.from({length:128},(_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'Kit Apple: Mac + iPhone',     desc: 'MacBook Air M2 + iPhone 14 – combo especial', category: 'Tecnologia', originalPrice: 14000, price: 11900, goal: 30,  members: Array.from({length:11}, (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'iPhone 16 Pro Natural',       desc: 'Câmera 5x, tela OLED ProMotion 120Hz',         category: 'Tecnologia', originalPrice: 9499,  price: 7499,  goal: 80,  members: Array.from({length:53}, (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'Setup Gamer Logitech',        desc: 'Mouse, teclado mecânico e headset – combo',   category: 'Tecnologia', originalPrice: 1900,  price: 1499,  goal: 25,  members: Array.from({length:7},  (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'Tênis Nike Air Max 270',      desc: 'Masculino/feminino, diversos tamanhos',        category: 'Moda',       originalPrice: 699,   price: 459,   goal: 15,  members: Array.from({length:15}, (_,i)=>'s'+i), createdAt: Date.now() },
    { id: uid(), creatorId: 'seed', name: 'Cesta Orgânica Semanal',      desc: 'Frutas e verduras direto do produtor',         category: 'Alimentos',  originalPrice: 140,   price: 89,    goal: 10,  members: Array.from({length:7},  (_,i)=>'s'+i), createdAt: Date.now() },
  ];
  saveGroups(seed);
}

// 1. cadastro e login

function switchTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent   = '';
}

function register() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');

  if (!name || !email || !pass)         { errEl.textContent = 'Preencha todos os campos.'; return; }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { errEl.textContent = 'E-mail inválido.'; return; }
  if (pass.length < 6)                  { errEl.textContent = 'Senha deve ter ao menos 6 caracteres.'; return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { errEl.textContent = 'E-mail já cadastrado.'; return; }

  const newUser = { id: uid(), name, email, pass };
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);
  errEl.textContent = '';
  toast('Conta criada com sucesso! 🎉', 'ok');
  enterApp(newUser);
}

function login() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  if (!email || !pass) { errEl.textContent = 'Preencha e-mail e senha.'; return; }

  const user = getUsers().find(u => u.email === email && u.pass === pass);
  if (!user) { errEl.textContent = 'E-mail ou senha incorretos.'; return; }

  saveSession(user);
  errEl.textContent = '';
  toast('Login realizado com sucesso! 🎉', 'ok');
  enterApp(user);
}

function logout() {
  localStorage.removeItem('cj_session');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('app-screen').classList.remove('active');
}

function enterApp(user) {
  try {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    var firstName = (user && user.name) ? user.name.split(' ')[0] : 'Usuário';
    document.getElementById('nav-username').textContent = 'Olá, ' + firstName + '!';
    showSection('offers');
    renderOffers();
  } catch(e) {
    console.error('enterApp error:', e);
  }
}

// 2. criar grupo

function createGroup() {
  const session  = getSession();
  const name     = document.getElementById('c-name').value.trim();
  const desc     = document.getElementById('c-desc').value.trim();
  const original = parseFloat(document.getElementById('c-original').value);
  const price    = parseFloat(document.getElementById('c-price').value);
  const goal     = parseInt(document.getElementById('c-goal').value);
  const category = document.getElementById('c-category').value;
  const errEl    = document.getElementById('create-error');

  if (!name || !desc)          { errEl.textContent = 'Informe nome e descrição.'; return; }
  if (!original || !price || !goal) { errEl.textContent = 'Preencha preços e meta.'; return; }
  if (price >= original)       { errEl.textContent = 'Preço coletivo deve ser menor que o original.'; return; }
  if (goal < 2)                { errEl.textContent = 'Meta deve ter ao menos 2 compradores.'; return; }

  const group = { id: uid(), creatorId: session.id, name, desc, category,
    originalPrice: original, price, goal, members: [session.id], createdAt: Date.now() };

  const groups = getGroups();
  groups.push(group);
  saveGroups(groups);

  ['c-name','c-desc','c-original','c-price','c-goal'].forEach(id => document.getElementById(id).value = '');
  errEl.textContent = '';
  toast('Oferta publicada! 🚀', 'ok');
  showSection('offers');
  renderOffers();
}

// 3. participar/sair

function joinGroup(groupId) {
  const session = getSession();
  const groups  = getGroups();
  const idx     = groups.findIndex(g => g.id === groupId);
  if (idx === -1) return;
  const group = groups[idx];
  if (group.members.includes(session.id)) { toast('Você já participa deste grupo.', 'err'); return; }
  if (group.members.length >= group.goal) { toast('Grupo já atingiu a meta!', 'err'); return; }
  group.members.push(session.id);
  saveGroups(groups);
  toast('Você entrou no grupo! 🛒', 'ok');
  renderOffers();
  closeModal();
}

function leaveGroup(groupId) {
  const session = getSession();
  const groups  = getGroups();
  const idx     = groups.findIndex(g => g.id === groupId);
  if (idx === -1) return;
  const group = groups[idx];
  if (group.creatorId === session.id) { toast('O criador não pode sair do grupo.', 'err'); return; }
  group.members = group.members.filter(m => m !== session.id);
  saveGroups(groups);
  toast('Você saiu do grupo.');
  renderOffers();
  closeModal();
}

// 4. listar e buscar ofertas

function renderOffers(filter = '') {
  const session = getSession();
  if (!session) return;
  const groups  = getGroups();
  const grid    = document.getElementById('offers-grid');
  const myList  = document.getElementById('mygroups-list');
  const search  = filter.toLowerCase();

  const visible = groups.filter(g =>
    !filter ||
    g.name.toLowerCase().includes(search) ||
    g.category.toLowerCase().includes(search) ||
    g.desc.toLowerCase().includes(search)
  );

  grid.innerHTML = visible.length
    ? visible.map(g => offerCardHTML(g, session)).join('')
    : `<div class="empty"><div class="empty-icon">🔍</div><h3>Nenhuma oferta encontrada</h3><p>Tente outro termo de busca.</p></div>`;

  const mine = groups.filter(g => g.members.includes(session.id) || g.creatorId === session.id);
  myList.innerHTML = mine.length
    ? mine.map(g => offerCardHTML(g, session)).join('')
    : `<div class="empty"><div class="empty-icon">📦</div><h3>Nenhum grupo ainda</h3><p>Participe de uma oferta ou crie a sua!</p></div>`;
}

function filterOffers() {
  renderOffers(document.getElementById('search-input').value);
}

function offerCardHTML(g, session) {
  const pct      = Math.min(100, Math.round((g.members.length / g.goal) * 100));
  const full     = g.members.length >= g.goal;
  const discount = Math.round((1 - g.price / g.originalPrice) * 100);
  const isMember = g.members.includes(session.id);
  const faltam   = g.goal - g.members.length;
  const imgUrl   = CATEGORY_IMG[g.category] || '';
  const emoji    = CATEGORY_EMOJI[g.category] || '📦';

  const imgHTML = imgUrl
    ? `<img src="${imgUrl}" alt="${esc(g.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = imgUrl ? 'display:none' : '';

  return `
    <div class="offer-card" onclick="openModal('${g.id}')">
      <div class="offer-img-wrap">
        ${imgHTML}
        <div class="offer-img-placeholder" style="${placeholderStyle}">${emoji}</div>
        <span class="discount-badge ${full ? 'full-badge' : ''}">
          ${full ? '✅ Meta atingida' : '-' + discount + '%'}
        </span>
      </div>
      <div class="offer-body">
        <div class="offer-category">${esc(g.category)}</div>
        <div class="offer-name">${esc(g.name)}</div>
        <div class="offer-prices">
          <span class="price-old">R$ ${fmt(g.originalPrice)}</span>
          <span class="price-new">R$ ${fmt(g.price)}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-label">
            <span class="prog-count">${g.members.length} / ${g.goal} participantes</span>
            <span class="prog-left">${full ? '🎉 Completo' : 'Faltam ' + faltam}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${full ? 'full' : ''}" style="width:${pct}%"></div>
          </div>
        </div>
        ${isMember ? '<div class="member-badge">✓ Participando</div>' : ''}
      </div>
    </div>`;
}

function openModal(groupId) {
  const session  = getSession();
  const g        = getGroups().find(g => g.id === groupId);
  if (!g) return;

  const pct       = Math.min(100, Math.round((g.members.length / g.goal) * 100));
  const full      = g.members.length >= g.goal;
  const discount  = Math.round((1 - g.price / g.originalPrice) * 100);
  const isMember  = g.members.includes(session.id);
  const isCreator = g.creatorId === session.id;
  const faltam    = g.goal - g.members.length;
  const economia  = (g.originalPrice - g.price);
  const imgUrl    = CATEGORY_IMG[g.category] || '';
  const emoji     = CATEGORY_EMOJI[g.category] || '📦';

  const imgHTML = imgUrl
    ? `<img src="${imgUrl}" alt="${esc(g.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div class=\\'modal-img-placeholder\\'>${emoji}</div>'">`
    : `<div class="modal-img-placeholder">${emoji}</div>`;

  let actionBtn = '';
  if (full) {
    actionBtn = `<button class="btn-join" disabled>🎉 Meta atingida!</button>`;
  } else if (isMember && !isCreator) {
    actionBtn = `<button class="btn-leave" onclick="leaveGroup('${g.id}')">Sair do grupo</button>`;
  } else if (!isMember) {
    actionBtn = `<button class="btn-join" onclick="joinGroup('${g.id}')">Entrar no grupo – R$ ${fmt(g.price)}</button>`;
  } else {
    actionBtn = `<button class="btn-join" disabled>Você criou este grupo</button>`;
  }

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-img-wrap">${imgHTML}</div>
    <div class="modal-body">
      <div class="modal-category">${esc(g.category)}</div>
      <div class="modal-title">${esc(g.name)}</div>
      <div class="modal-desc">${esc(g.desc)}</div>
      <div class="modal-prices">
        <span class="price-new" style="font-size:1.6rem">R$ ${fmt(g.price)}</span>
        <span class="price-old">R$ ${fmt(g.originalPrice)}</span>
        <span class="discount-badge" style="position:static;box-shadow:none">-${discount}%</span>
      </div>
      <div class="modal-meta">
        <div class="meta-item">👥 Compradores<strong>${g.members.length} de ${g.goal}</strong></div>
        <div class="meta-item">💰 Sua economia<strong>R$ ${fmt(economia)}</strong></div>
        <div class="meta-item">🎯 Faltam<strong>${full ? '—' : faltam + ' vagas'}</strong></div>
      </div>
      <div class="modal-progress">
        <div class="progress-label" style="margin-bottom:8px">
          <span class="prog-count">Progresso do grupo</span>
          <span class="prog-left">${pct}%</span>
        </div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill ${full ? 'full' : ''}" style="width:${pct}%"></div>
        </div>
      </div>
      ${full ? `<div class="modal-success">🎊 Parabéns! Grupo completo. Economia coletiva de <strong>R$ ${fmt(economia * g.goal)}</strong>!</div>` : ''}
      ${actionBtn}
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// navegação

function showSection(name) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  const labels = { offers: 'ofert', create: 'criar', mygroups: 'meus' };
  document.querySelectorAll('.app-tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(labels[name])) t.classList.add('active');
  });
  if (name === 'mygroups') renderOffers();
}

// utilitários

function fmt(n) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function esc(s) { return String(s).replace(/[<>"'&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[c])); }

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// init
(function init() {
  seedGroups();
  const session = getSession();
  if (session) enterApp(session);
})();