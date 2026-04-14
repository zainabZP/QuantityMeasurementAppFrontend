const API   = 'http://localhost:5287/api/v1';
const token = localStorage.getItem('qm_token');
if (!token) window.location.href = 'login.html';

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await fetch(`${API}/auth/logout`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } }); } catch(_){}
  localStorage.removeItem('qm_token');
  window.location.href = 'login.html';
});

function showAlert(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
}
function hideAlerts() {
  ['alertError','alertSuccess'].forEach(id => { document.getElementById(id).style.display = 'none'; });
}

async function loadProfile() {
  try {
    const res  = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();

    document.getElementById('profileName').textContent    = data.userName || data.username || '—';
    document.getElementById('profileEmail').textContent   = data.email || '—';
    document.getElementById('avatarInitial').textContent  = (data.userName || data.username || '?')[0].toUpperCase();
    document.getElementById('newUsername').value          = data.userName || data.username || '';
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('profileCard').style.display  = 'block';
  } catch (err) {
    document.getElementById('loadingSpinner').style.display = 'none';
    showAlert('alertError', err.message);
  }
}

document.getElementById('updateBtn').addEventListener('click', async () => {
  hideAlerts();
  const userName       = document.getElementById('newUsername').value.trim();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword    = document.getElementById('newPassword').value;

  if (!userName) return showAlert('alertError', 'Username cannot be empty.');

  const body = { userName };
  if (currentPassword && newPassword) {
    body.currentPassword = currentPassword;
    body.newPassword     = newPassword;
  }

  try {
    const res  = await fetch(`${API}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');
    showAlert('alertSuccess', 'Profile updated successfully!');
    document.getElementById('profileName').textContent   = data.userName || data.username;
    document.getElementById('avatarInitial').textContent = (data.userName || data.username || '?')[0].toUpperCase();
  } catch (err) {
    showAlert('alertError', err.message);
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    localStorage.removeItem('qm_token');
    window.location.href = 'login.html';
  } catch (err) {
    showAlert('alertError', err.message);
  }
});

loadProfile();