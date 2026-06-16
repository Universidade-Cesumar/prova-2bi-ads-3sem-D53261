const API_URL = 'https://6a3099dda7f8866418d63313.mockapi.io/material';

let allItems = [];

function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

function updateStats(items) {
  document.getElementById('stat-total').textContent  = items.length;
  document.getElementById('stat-zerado').textContent = items.filter(i => Number(i.amount) === 0).length;
  document.getElementById('stat-qty').textContent    = items.reduce((s, i) => s + Number(i.amount || 0), 0);
}

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (quantidadeRetirada <= 0) return false;
  if (quantidadeRetirada > estoqueAtual) return false;
  return true;
}

function renderRows(items) {
  const tbody = document.getElementById('lista-materiais');
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state-msg">Nenhum material encontrado.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(item => {
    const qty = Number(item.amount || 0);
    const badgeClass = qty === 0 ? 'badge zero' : 'badge';
    return `<tr>
      <td>${item.nome || item.name || '—'}</td>
      <td><span class="${badgeClass}">${qty} un.</span></td>
      <td>#${item.id}</td>
      <td>
        <input type="number" id="input-retirada" data-id="${item.id}" placeholder="Qtd" min="1" style="width:70px;" />
        <button class="btn-baixar" data-id="${item.id}" data-amount="${qty}">Baixar</button>
      </td>
      <td>
        <button class="btn-excluir" data-id="${item.id}">Excluir</button>
      </td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Confirma a exclusão deste item?')) return;
      btn.disabled = true;
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allItems = allItems.filter(i => i.id != id);
        renderRows(allItems);
        updateStats(allItems);
        showToast('Item excluído com sucesso.', 'ok');
      } catch (err) {
        showToast('Erro ao excluir item.', 'err');
        btn.disabled = false;
      }
    });
  });

  document.querySelectorAll('.btn-baixar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const estoqueAtual = Number(btn.dataset.amount);
      const inputEl = btn.closest('tr').querySelector('input[id="input-retirada"]');
      const quantidadeRetirada = parseInt(inputEl.value, 10);

      if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
        showToast('Quantidade inválida ou maior que o estoque atual.', 'err');
        inputEl.focus();
        return;
      }

      const novoAmount = estoqueAtual - quantidadeRetirada;
      btn.disabled = true;
      btn.textContent = 'Salvando…';

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: novoAmount })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const atualizado = await res.json();
        allItems = allItems.map(i => i.id == id ? { ...i, amount: atualizado.amount } : i);
        renderRows(allItems);
        updateStats(allItems);
        showToast(`Baixa de ${quantidadeRetirada} unidade(s) realizada com sucesso.`, 'ok');
      } catch (err) {
        showToast('Erro ao realizar baixa. Tente novamente.', 'err');
        btn.disabled = false;
        btn.textContent = 'Baixar';
      }
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

document.getElementById('btn-cadastrar').addEventListener('click', async () => {
  const nomeEl = document.getElementById('input-nome');
  const qtdEl  = document.getElementById('input-quantidade');
  const btn    = document.getElementById('btn-cadastrar');

  const nome   = nomeEl.value.trim();
  const amount = parseInt(qtdEl.value, 10);

  if (!nome)       { showToast('Informe o nome do material.', 'err'); nomeEl.focus(); return; }
  if (amount < 0)  { showToast('Informe uma quantidade válida.', 'err'); qtdEl.focus(); return; }

  btn.disabled = true;
  btn.textContent = 'Salvando…';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, amount })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const novo = await res.json();
    allItems.push(novo);
    renderRows(allItems);
    updateStats(allItems);
    nomeEl.value = '';
    qtdEl.value  = '';
    showToast(`"${nome}" cadastrado com sucesso.`, 'ok');
  } catch (err) {
    showToast('Erro ao cadastrar. Tente novamente.', 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Cadastrar';
  }
});

document.getElementById('search-input').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  const filtered = q ? allItems.filter(i => (i.nome || i.name || '').toLowerCase().includes(q)) : allItems;
  renderRows(filtered);
});

loadMateriais();
