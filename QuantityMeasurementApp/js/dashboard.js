const API = 'http://localhost:5287/api/v1';

// Show/hide nav items based on login state
const token = localStorage.getItem('qm_token');
if (token) {
  document.getElementById('profileNavItem').style.display = '';
  document.getElementById('logoutNavItem').style.display  = '';
  document.getElementById('loginNavItem').style.display   = 'none';
}

// History button
document.getElementById('historyBtn').addEventListener('click', () => {
  if (localStorage.getItem('qm_token')) {
    window.location.href = 'history.html';
  } else {
    sessionStorage.setItem('redirectAfterLogin', 'history.html');
    window.location.href = 'login.html';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (_) {}
  localStorage.removeItem('qm_token');
  window.location.href = 'login.html';
});

// Units per type
const UNITS = {
  Length:      ['INCHES','FEET','YARDS','CENTIMETERS'],
  Weight:      ['GRAM','KILOGRAM','POUND'],
  Temperature: ['CELSIUS','FAHRENHEIT','KELVIN'],
  Volume:      ['LITRE','MILLILITRE','GALLON']
};

let selectedType   = 'Length';
let selectedAction = 'compare';

function populateUnits() {
  const units = UNITS[selectedType];
  ['unit1', 'unit2'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = units.map(u => `<option value="${u}">${capitalize(u)}</option>`).join('');
  });
}

function capitalize(s) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function updateActionUI() {
  const sym        = document.getElementById('operatorSymbol');
  const l1         = document.getElementById('label1');
  const l2         = document.getElementById('label2');
  const v2         = document.getElementById('val2');
  const unit2Block = document.getElementById('unit2Block');

  sym.textContent = { compare:'=?', convert:'→', add:'+', subtract:'−', divide:'÷' }[selectedAction] || '→';

  if (selectedAction === 'convert') {
    // Only show FROM unit and TO unit — no second value needed
    l1.textContent           = 'FROM';
    l2.textContent           = 'TO UNIT';
    v2.style.display         = 'none';
    unit2Block.style.display = '';
  } else {
    // compare, add, subtract, divide — show both values and both units
    // For add/subtract/divide: unit2 = result unit (backend uses thatQuantityDTO.Unit as targetUnit)
    l1.textContent           = 'VALUE 1';
    l2.textContent           = selectedAction === 'compare' ? 'VALUE 2' : 'VALUE 2 (Result Unit)';
    v2.style.display         = '';
    unit2Block.style.display = '';
  }
}

// Type cards
document.getElementById('typeGrid').addEventListener('click', e => {
  const card = e.target.closest('.type-card');
  if (!card) return;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  selectedType = card.dataset.type;
  populateUnits();
  hideResult();
});

// Action tabs
document.getElementById('actionTabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedAction = btn.dataset.action;
  updateActionUI();
  hideResult();
});

function hideResult() {
  document.getElementById('resultBox').style.display  = 'none';
  document.getElementById('alertError').style.display = 'none';
}

function buildPayload() {
  const val1  = parseFloat(document.getElementById('val1').value);
  const val2  = parseFloat(document.getElementById('val2').value) || 0;
  const unit1 = document.getElementById('unit1').value;
  const unit2 = document.getElementById('unit2').value;

  // All actions use the same payload structure
  // Backend uses thatQuantityDTO.Unit as the targetUnit for add/subtract/divide
  // So unit2 controls the result unit for arithmetic operations
  return {
    thisQuantityDTO: { value: val1, unit: unit1, measurementType: selectedType },
    thatQuantityDTO: { value: val2, unit: unit2, measurementType: selectedType },
    resultUnit: unit2
  };
}

// Calculate button
document.getElementById('calcBtn').addEventListener('click', async () => {
  hideResult();

  const currentToken = localStorage.getItem('qm_token');
  const payload      = buildPayload();
  const endpoint     = `${API}/quantities/${selectedAction}`;
  const btn          = document.getElementById('calcBtn');
  btn.disabled       = true;
  btn.textContent    = 'Calculating...';

  const headers = { 'Content-Type': 'application/json' };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      localStorage.removeItem('qm_token');
      const el = document.getElementById('alertError');
      el.innerHTML = '⚠ Session expired. Please <a href="login.html" style="color:var(--primary);font-weight:700;">Login again</a>.';
      el.style.display = 'block';
      return;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.title || 'Calculation failed');
    showResult(data);

  } catch (err) {
    const el = document.getElementById('alertError');
    el.textContent   = err.message;
    el.style.display = 'block';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Calculate';
  }
});

function showResult(data) {
  const box   = document.getElementById('resultBox');
  const label = document.getElementById('resultLabel');
  const val   = document.getElementById('resultValue');
  const unit  = document.getElementById('resultUnitDisplay');

  if (selectedAction === 'compare') {
    label.textContent = 'COMPARISON RESULT';
    val.textContent   = data.value === 1 ? '✅ Equal' : '❌ Not Equal';
    unit.textContent  = '';
  } else {
    label.textContent = 'RESULT';
    val.textContent   = typeof data.value !== 'undefined' ? data.value : JSON.stringify(data);
    unit.textContent  = data.unit ? capitalize(data.unit) : '';
  }
  box.style.display = 'block';
}

// Init
populateUnits();
updateActionUI();