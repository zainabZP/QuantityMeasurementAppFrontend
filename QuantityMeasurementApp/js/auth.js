const API = 'http://localhost:5287/api/v1';

// ---- Helpers ----
function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
}

// ---- Redirect if already logged in ----
if (localStorage.getItem('qm_token')) {
  //window.location.href = 'dashboard.html';
  // After login go to history, or wherever they came from
    const redirect = sessionStorage.getItem('redirectAfterLogin') || 'history.html';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirect;
}

// ---- Login ----
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.dataset.label = 'Sign In';
  loginBtn.addEventListener('click', async () => {
    hideAlert('alertError');
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      return showAlert('alertError', 'Please fill in all fields.');
    }

    setLoading(loginBtn, true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.title || 'Login failed');
      localStorage.setItem('qm_token', data.token);
      const redirect = sessionStorage.getItem('redirectAfterLogin') || 'history.html';
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirect;
    } catch (err) {
      showAlert('alertError', err.message);
    } finally {
      setLoading(loginBtn, false);
    }
  });
}

// ---- Sign Up ----
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
  signupBtn.dataset.label = 'Create Account';
  signupBtn.addEventListener('click', async () => {
    hideAlert('alertError');
    hideAlert('alertSuccess');
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
      return showAlert('alertError', 'Please fill in all fields.');
    }
    if (password.length < 8) {
      return showAlert('alertError', 'Password must be at least 8 characters.');
    }

    setLoading(signupBtn, true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data) ? data.map(e => e.description).join(' ') : (data.message || 'Registration failed');
        throw new Error(msg);
      }
      localStorage.setItem('qm_token', data.token);
      showAlert('alertSuccess', 'Account created! Redirecting...');
      const redirect = sessionStorage.getItem('redirectAfterLogin') || 'history.html';
      sessionStorage.removeItem('redirectAfterLogin');
      setTimeout(() => { window.location.href = redirect; }, 1200);
    } catch (err) {
      showAlert('alertError', err.message);
    } finally {
      setLoading(signupBtn, false);
    }
  });
}