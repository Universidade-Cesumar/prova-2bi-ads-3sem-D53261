const API_URL = 'https://6a3099dda7f8866418d63313.mockapi.io/material';

let allItems = [];

function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

function getQuantidade(item) {
  return Number(item.quantidade ?? item.amount ?? 0);
}

function getNome(item) {
  return item.nome || item.name || '—';
}

function updateStats(items) {
  const totalEl = document.getElementById('total-itens') || document.getElementById('stat-total');

  if (totalEl) {
    totalEl.textContent = items.length;
  }

  const zeradoEl = document.getElementById('stat-zerado');
  const qtdEl = document.getElementById('stat-qty');

  if (zeradoEl) {
    zeradoEl.textContent = items.filter(i => getQuantidade(i) === 0).length;
  }

  if (qtdEl) {
    qtdEl.textContent = items.reduce((s, i) => s + getQuantidade(i), 0);
  }
}

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  if (isNaN(estoque) || isNaN(retirada)) return false;
  if (retirada <= 0) return false;
  if (retirada > estoque) return false;

  return true;
}

function renderRows(items) {
  const tbody = document.getElementById('lista-materiais');

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state-msg">Nenhum material encontrado.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const qty = getQuantidade(item);
    const badgeClass = qty === 0 ? 'badge zero' : 'badge';
    const linhaCritica = qty < 10 ? 'estoque-critico' : '';

    return `<tr class="${linhaCritica}">
      <td>${getNome(item)}</td>
      <td><span class="${badgeClass}">${qty} un.</span></td>
      <td>#${item.id}</td>
      <td class="acoes">
        <button class="btn-baixar" data-id="${item.id}">Baixar</button>
        <button class="btn-excluir" data-id="${item.id}">Excluir</button>
      </td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.btn-baixar').forEach(btn => {
    btn.addEventListener('click', () => {
      baixarMaterial(btn.dataset.id);
    });
  });

  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', () => {
      excluirMaterial(btn.dataset.id);
    });
  });
}

async function loadMateriais() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    allItems = await res.json();
    renderRows(allItems);
    updateStats(allItems);
  } catch (err) {
    document.getElementById('lista-materiais').innerHTML =
      `<tr><td colspan="5"><div class="state-msg" style="color:var(--danger)">Erro ao carregar dados.</div></td></tr>`;
  }
}

async function cadastrarMaterial() {
  const nomeEl = document.getElementById('input-nome');
  const qtdEl  = document.getElementById('input-quantidade');
  const btn    = document.getElementById('btn-cadastrar');

  const nome = nomeEl.value.trim();

  const quantidade = qtdEl.value.trim() === ''
    ? 0
    : parseInt(qtdEl.value, 10);

  if (!nome) {
    showToast('Informe o nome do material.', 'err');
    nomeEl.focus();
    return;
  }

  if (isNaN(quantidade) || quantidade < 0) {
    showToast('Informe uma quantidade válida.', 'err');
    qtdEl.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Salvando…';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        quantidade,
        amount: quantidade
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const novo = await res.json();

    allItems.push(novo);
    renderRows(allItems);
    updateStats(allItems);

    nomeEl.value = '';
    qtdEl.value = '';

    showToast(`"${nome}" cadastrado com sucesso.`, 'ok');
  } catch (err) {
    showToast('Erro ao cadastrar. Tente novamente.', 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Cadastrar';
  }
}

async function baixarMaterial(id) {
  const item = allItems.find(i => String(i.id) === String(id));
  const input = document.getElementById('input-retirada');

  if (!item) return;

  const retirada = parseInt(input.value, 10);
  const estoqueAtual = getQuantidade(item);

  if (!validarRetirada(estoqueAtual, retirada)) {
    showToast('Quantidade inválida ou maior que o estoque atual.', 'err');
    input.focus();
    return;
  }

  const novaQuantidade = estoqueAtual - retirada;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: getNome(item),
        quantidade: novaQuantidade,
        amount: novaQuantidade
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const atualizado = await res.json();

    allItems = allItems.map(i => {
      return String(i.id) === String(id) ? atualizado : i;
    });

    renderRows(allItems);
    updateStats(allItems);

    input.value = '';

    showToast('Baixa realizada com sucesso.', 'ok');
  } catch (err) {
    showToast('Erro ao realizar baixa. Tente novamente.', 'err');
  }
}

async function excluirMaterial(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    allItems = allItems.filter(i => String(i.id) !== String(id));

    renderRows(allItems);
    updateStats(allItems);

    showToast('Material excluído com sucesso.', 'ok');
  } catch (err) {
    showToast('Erro ao excluir item.', 'err');
  }
}

document.getElementById('btn-cadastrar').addEventListener('click', cadastrarMaterial);

const buscaEl = document.getElementById('input-busca') || document.getElementById('search-input');

if (buscaEl) {
  buscaEl.addEventListener('input', function () {
    const q = this.value.toLowerCase();

    const filtered = q
      ? allItems.filter(i => getNome(i).toLowerCase().includes(q))
      : allItems;

    renderRows(filtered);
  });
}

loadMateriais();