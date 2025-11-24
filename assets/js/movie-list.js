document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('movieGrid');
  const emptyState = document.getElementById('movieGridEmpty');

  if (!grid) {
    return;
  }

  grid.innerHTML = '<p class="text-gray-500">Loading movies...</p>';

  backendApi.listMovies()
    .then((movies) => {
      if (!movies || movies.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }

      emptyState.classList.add('hidden');
      grid.innerHTML = movies.map(buildMovieCard).join('');
    })
    .catch((error) => {
      grid.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    });
});

function buildMovieCard(movie) {
  const genres = movie.genre ? movie.genre : 'Genre unavailable';
  const poster = movie.poster && movie.poster.length > 0
    ? movie.poster
    : 'https://placehold.co/400x600/111827/FFFFFF?text=No+Poster';
  const targetUrl = `MovieDet.html?id=${encodeURIComponent(movie.id)}`;

  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer w-[14rem]">
      <a href="${targetUrl}" target="_blank" rel="noopener">
        <img src="${poster}" alt="${escapeHtml(movie.title)}" class="w-full h-94 object-cover" />
      </a>
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-1">${escapeHtml(movie.title)}</h2>
        <p class="text-gray-600 text-sm">${escapeHtml(genres)}</p>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
