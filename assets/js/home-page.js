document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('recommendedMovies');
  const empty = document.getElementById('recommendedEmpty');

  if (!container) {
    return;
  }

  container.innerHTML = '<p class="text-gray-500">Loading curated movies...</p>';

  backendApi.listMovies()
    .then((movies) => {
      if (!movies || movies.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }

      empty.classList.add('hidden');
      const curated = movies.slice(0, 6);
      container.innerHTML = curated.map((movie) => {
        const poster = movie.poster || 'https://placehold.co/250x350/4c1d95/FFFFFF?text=No+Poster';
        return `
          <a href="MovieDet.html?id=${encodeURIComponent(movie.id)}" class="min-w-[250px] bg-white rounded-xl shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 overflow-hidden" rel="noopener">
            <img src="${poster}" alt="${escapeHtml(movie.title)}" class="w-full h-[350px] object-cover" />
            <div class="p-4">
              <h4 class="text-lg font-semibold">${escapeHtml(movie.title)}</h4>
              <p class="text-gray-500 text-sm">${escapeHtml(movie.genre || 'Genre TBD')} | ${escapeHtml(movie.language || 'Language TBD')}</p>
            </div>
          </a>
        `;
      }).join('');
    })
    .catch((error) => {
      container.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    });
});

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
