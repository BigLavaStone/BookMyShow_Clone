document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Creating account...';

  const payload = {
    name: `${getValue('firstName')} ${getValue('lastName')}`.trim(),
    email: getValue('email'),
    password: getValue('password'),
    role: 'user',
    phone: getValue('phone'),
    city: getValue('location')
  };

  try {
    await backendApi.registerUser(payload);
    setAlert('signupAlert', 'Account created successfully! You can log in now.', 'success');
    form.reset();
  } catch (error) {
    setAlert('signupAlert', error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Create Account';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Signing in...';

  try {
    const result = await backendApi.loginUser({
      email: getValue('loginEmail'),
      password: getValue('loginPassword')
    });
    sessionStorage.setItem('bms_user', JSON.stringify(result));
    setAlert('loginAlert', `Welcome back, ${result.name || 'user'}!`, 'success');
  } catch (error) {
    setAlert('loginAlert', error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Login';
  }
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setAlert(id, message, variant) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  const base = 'px-4 py-3 rounded border text-sm';
  const styles = variant === 'success'
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-700';
  el.className = `${base} ${styles}`;
  el.textContent = message;
}
