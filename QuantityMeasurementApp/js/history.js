const API   = 'http://localhost:5287/api/v1';
const token = localStorage.getItem('qm_token');
if (!token) window.location.href = 'login.html';

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await fetch(`${API}/auth/logout`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } }); } catch(_){}
  localStorage.removeItem('qm_token');
  window.location.href = 'login.html';
});

const OPERATIONS   = ['compare','convert','add','subtract','divide'];
const MEASUREMENTS = ['Length','Weight','Temperature','Volume'];

const filterType  = document.getElementById('filterType');
const filterValue = document.getElementById('filterValue');

filterType.addEventListener('change', () => {
  filterValue.innerHTML = '<option value="">-- Select --</option>';
  if (filterType.value === 'operation') {
    OPERATIONS.forEach(o => filterValue.innerHTML += `<option value="${o}">${capitalize(o)}</option>`);
  } else if (filterType.value === 'measurement') {
    MEASUREMENTS.forEach(m => filterValue.innerHTML += `<option value="${m}">${m}</option>`);
  }
});

document.getElementById('filterBtn').addEventListener('click', () => {
  const type = filterType.value;
  const val  = filterValue.value;
  if (type === 'all') {
    loadHistory(`${API}/quantities/all`);
  } else if (type === 'operation' && val) {
    loadHistory(`${API}/quantities/history/operation/${val}`);
  } else if (type === 'measurement' && val) {
    loadHistory(`${API}/quantities/history/type/${val}`);
  } else {
    loadHistory(`${API}/quantities/all`);
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  filterType.value = 'all';
  filterValue.innerHTML = '<option value="">-- Select --</option>';
  loadHistory(`${API}/quantities/all`);
});

async function loadHistory(url) {
  document.getElementById('loadingSpinner').style.display = 'block';
  document.getElementById('tableWrap').style.display  = 'none';
  document.getElementById('emptyState').style.display = 'none';

  try {
    const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    renderTable(Array.isArray(data) ? data : []);
  } catch (err) {
    renderTable([]);
  } finally {
    document.getElementById('loadingSpinner').style.display = 'none';
  }
}

function renderTable(rows) {
  if (!rows.length) {
    document.getElementById('emptyState').style.display = 'block';
    return;
  }
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="badge badge-${(r.operationType||'').toLowerCase()}">${r.operationType || '—'}</span></td>
      <td>${r.operand1 ? r.operand1.split(' ')[1] || '—' : '—'}</td>
      <td>${r.operand1 || '—'}</td>
      <td>${r.operand2 || '—'}</td>
      <td><strong>${r.scalarResult !== null && r.scalarResult !== undefined ? r.scalarResult : (r.result || '—')}</strong></td>
      <td>${r.timestamp ? new Date(r.timestamp).toLocaleDateString() : '—'}</td>
    </tr>
  `).join('');
  document.getElementById('tableWrap').style.display = 'block';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Load all on page open
loadHistory(`${API}/quantities/all`);