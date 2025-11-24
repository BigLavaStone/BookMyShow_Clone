(function (global) {
  const API_BASE = resolveApiBase();

  const jsonHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };

  async function request(entity, action, params = {}, method) {
    const payload = new URLSearchParams({ entity, action });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload.append(key, Array.isArray(value) ? value.join(',') : value);
      }
    });

    const isWriteOperation = method ? method.toUpperCase() === 'POST' : !['list', 'get', 'listByShow'].includes(action);
    const fetchMethod = isWriteOperation ? 'POST' : 'GET';
    const fetchOptions = { method: fetchMethod, headers: jsonHeaders };

    if (fetchMethod === 'GET') {
      const response = await fetch(`${API_BASE}?${payload.toString()}`);
      return handleResponse(response);
    }

    fetchOptions.body = payload.toString();
    const response = await fetch(API_BASE, fetchOptions);
    return handleResponse(response);
  }

  async function handleResponse(response) {
    const body = await response.json();
    if (!response.ok || body.status !== 'success') {
      const message = body && body.error ? body.error : 'Unknown server error';
      throw new Error(message);
    }
    return body.data;
  }

  const backendApi = {
    listMovies: () => request('movies', 'list'),
    getMovie: (id) => request('movies', 'get', { id }),
    createMovie: (movie) => request('movies', 'create', movie, 'POST'),
    updateMovie: (movie) => request('movies', 'update', movie, 'POST'),
    deleteMovie: (id) => request('movies', 'delete', { id }, 'POST'),

    listCinemas: () => request('cinemas', 'list'),
    createCinema: (cinema) => request('cinemas', 'create', cinema, 'POST'),
    updateCinema: (cinema) => request('cinemas', 'update', cinema, 'POST'),
    deleteCinema: (id) => request('cinemas', 'delete', { id }, 'POST'),

    registerUser: (user) => request('users', 'register', user, 'POST'),
    loginUser: (credentials) => request('users', 'login', credentials, 'POST'),
    listUsers: () => request('users', 'list'),
    deleteUser: (id) => request('users', 'delete', { id }, 'POST'),

    listBookings: () => request('bookings', 'list'),
    listBookingsByShow: (filters) => request('bookings', 'listByShow', filters),
    createBooking: (booking) => request('bookings', 'create', booking, 'POST'),
    cancelBooking: (id) => request('bookings', 'cancel', { id }, 'POST'),

    listPayouts: () => request('payouts', 'list'),
    listPendingPayouts: () => request('payouts', 'listPending'),
    createPayout: (payload) => request('payouts', 'create', payload, 'POST'),
    markPayoutPaid: (id) => request('payouts', 'markPaid', { id }, 'POST')
  };

  global.backendApi = backendApi;

  function resolveApiBase() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    let context = segments[0] || '';
    if (context.includes('.')) {
      context = '';
    }
    const basePath = context ? `/${context}/` : '/';
    return `${basePath}backend/api/dispatcher.jsp`;
  }
})(window);
