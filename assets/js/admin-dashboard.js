let revenueChart;
let cinemaChart;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  window.toggleSubmenu = (menu) => {
    const submenu = document.getElementById(`${menu}-submenu`);
    const arrow = document.getElementById(`${menu}-arrow`);
    if (!submenu || !arrow) {
      return;
    }
    submenu.classList.toggle('open');
    arrow.style.transform = submenu.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  };

  hydrateDashboard();

  const pendingContainer = document.getElementById('pendingPayouts');
  if (pendingContainer) {
    pendingContainer.addEventListener('click', async (event) => {
      const target = event.target.closest('[data-mark-paid]');
      if (!target) {
        return;
      }
      try {
        target.disabled = true;
        await backendApi.markPayoutPaid(target.dataset.id);
        setAlert('Marked payout as completed.', 'success');
        hydrateDashboard();
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  }
});

async function hydrateDashboard() {
  setAlert('', 'hide');
  try {
    const [cinemas, users, bookings, payouts, movies] = await Promise.all([
      backendApi.listCinemas(),
      backendApi.listUsers(),
      backendApi.listBookings(),
      backendApi.listPayouts(),
      backendApi.listMovies()
    ]);

    setMetric('metricCinemas', cinemas.length);
    setMetric('metricUsers', Intl.NumberFormat('en-IN').format(users.length));

    const ticketsSold = bookings.reduce((total, booking) => {
      const seats = Array.isArray(booking.seats) ? booking.seats.length : 1;
      return total + Math.max(seats, 1);
    }, 0);
    setMetric('metricTickets', Intl.NumberFormat('en-IN').format(ticketsSold));

    const revenue = payouts.reduce((total, payout) => total + Number(payout.amount || 0), 0);
    setCurrency('metricRevenue', revenue);

    renderPendingPayouts(payouts.filter((payout) => `${payout.status}`.toLowerCase() === 'pending'));
    renderCinemaRequests(cinemas.slice(-3));
    buildCharts(movies, payouts);
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

function renderPendingPayouts(payouts) {
  const container = document.getElementById('pendingPayouts');
  if (!container) {
    return;
  }

  if (!payouts.length) {
    container.innerHTML = '<p class="text-sm text-gray-500">No pending payouts. Great job!</p>';
    return;
  }

  container.innerHTML = payouts.map((payout) => {
    const initials = payout.vendor ? payout.vendor.split(' ').map((word) => word.charAt(0)).join('').slice(0, 2).toUpperCase() : 'NA';
    return `
      <div class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
        <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
          ${initials}
        </div>
        <div class="flex-1">
          <p class="font-semibold text-slate-900">${escapeHtml(payout.vendor || 'Unnamed Vendor')}</p>
          <p class="text-xs text-gray-400">Due: ${escapeHtml(payout.dueDate || 'TBD')}</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-orange-400">${formatCurrency(payout.amount || 0)}</p>
          <button class="text-xs text-rose-400 hover:text-rose-200" data-mark-paid data-id="${payout.id}">Mark Paid</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderCinemaRequests(cinemas) {
  const container = document.getElementById('newCinemaRequests');
  if (!container) {
    return;
  }

  if (!cinemas.length) {
    container.innerHTML = '<p class="text-sm text-gray-500">No new cinema requests at the moment.</p>';
    return;
  }

  container.innerHTML = cinemas.map((cinema) => `
    <div class="p-4 bg-slate-700/50 rounded-lg">
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="font-semibold text-slate-900">${escapeHtml(cinema.name)}</p>
          <p class="text-xs text-gray-400">${escapeHtml(cinema.city || 'City TBD')}</p>
        </div>
        <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">New</span>
      </div>
      <div class="flex gap-2">
        <button class="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold transition-colors" onclick="setAlert('Approved ${escapeHtml(cinema.name)}', 'success')">
          <i class="fas fa-check mr-1"></i>Approve
        </button>
        <button class="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-sm font-semibold transition-colors" onclick="setAlert('Rejected ${escapeHtml(cinema.name)}', 'error')">
          <i class="fas fa-times mr-1"></i>Reject
        </button>
      </div>
    </div>
  `).join('');
}

function buildCharts(movies, payouts) {
  const revenueCtx = document.getElementById('revenueChart');
  const cinemaCtx = document.getElementById('cinemaChart');
  if (!revenueCtx || !cinemaCtx) {
    return;
  }

  const movieLabels = movies.slice(0, 6).map((movie) => movie.title);
  const movieData = movies.slice(0, 6).map((movie) => (movie.price || 0) * 75);

  if (revenueChart) {
    revenueChart.destroy();
  }
  revenueChart = new Chart(revenueCtx.getContext('2d'), {
    type: 'line',
    data: {
      labels: movieLabels,
      datasets: [{
        label: 'Estimated Revenue',
        data: movieData,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3
      }]
    },
    options: buildChartOptions()
  });

  const payoutByVendor = payouts.reduce((acc, payout) => {
    const vendor = payout.vendor || 'Vendor';
    acc[vendor] = (acc[vendor] || 0) + Number(payout.amount || 0);
    return acc;
  }, {});

  if (cinemaChart) {
    cinemaChart.destroy();
  }
  cinemaChart = new Chart(cinemaCtx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(payoutByVendor),
      datasets: [{
        label: 'Payout Volume',
        data: Object.values(payoutByVendor),
        backgroundColor: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
        borderRadius: 8
      }]
    },
    options: buildChartOptions(true)
  });
}

function buildChartOptions(isBar) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(15, 23, 42, 0.06)' } },
      x: { ticks: { color: '#9ca3af' }, grid: { display: !isBar } }
    }
  };
}

function setMetric(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

function setCurrency(id, value) {
  setMetric(id, formatCurrency(value));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function setAlert(message, variant) {
  const banner = document.getElementById('adminAlert');
  if (!banner) {
    return;
  }
  if (variant === 'hide' || !message) {
    banner.classList.add('hidden');
    banner.textContent = '';
    return;
  }
  banner.className = `mb-6 px-4 py-3 rounded border text-sm ${variant === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`;
  banner.textContent = message;
  banner.classList.remove('hidden');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
