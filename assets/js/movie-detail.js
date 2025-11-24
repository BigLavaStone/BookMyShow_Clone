document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');

  if (movieId) {
    hydrateMovie(movieId);
  } else {
    backendApi.listMovies()
      .then((movies) => {
        if (!movies || movies.length === 0) {
          throw new Error('No movies available yet.');
        }
        hydrateView(movies[0]);
      })
      .catch(renderError);
  }
});

function hydrateMovie(id) {
  backendApi.getMovie(id)
    .then(hydrateView)
    .catch(renderError);
}

function hydrateView(movie) {
  if (!movie) {
    renderError(new Error('Movie data not found.'));
    return;
  }

  setText('movieTitle', movie.title);
  setText('movieReleaseDate', movie.releaseDate || 'TBD');
  setText('movieGenre', [movie.genre, movie.language].filter(Boolean).join(' | '));
  setText('movieSynopsis', movie.synopsis || 'Synopsis will be updated soon.');
  setText('movieRating', movie.rating ? `${movie.rating}/10` : 'Not rated');

  const poster = document.getElementById('moviePoster');
  if (poster) {
    poster.src = movie.poster || 'https://placehold.co/400x600/0f172a/FFFFFF?text=No+Poster';
    poster.alt = movie.title || 'Movie poster';
  }

  const cast = document.getElementById('movieCast');
  if (cast) {
    const members = Array.isArray(movie.cast) ? movie.cast : [];
    cast.innerHTML = members.length
      ? members.map((member) => `<li>${escapeHtml(member)}</li>`).join('')
      : '<li>Cast details will be available soon.</li>';
  }

  const bookBtn = document.getElementById('bookNowBtn');
  if (bookBtn && movie.id) {
    bookBtn.href = `MovieTimes.html?movieId=${encodeURIComponent(movie.id)}`;
  }
}

function renderError(error) {
  setText('movieTitle', 'Unable to load movie');
  setText('movieSynopsis', error.message);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value || '';
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
