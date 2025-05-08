document.addEventListener('DOMContentLoaded', () => {
  const grid  = document.getElementById('movies-container');
  const load  = document.getElementById('loading');
  const err   = document.getElementById('error');
  const searchInput  = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  async function fetchMovies(query = '') {
    load.textContent = 'Loading movies…';
    load.style.display = 'block';
    err.style.display = 'none';
    grid.innerHTML = '';
    try {
      let url = '/.netlify/functions/getMovies';
      if (query) url += `?search=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const movies = await res.json();
      if (!movies.length) throw new Error('No movies found.');
      movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
          <img src="${m.poster||'https://via.placeholder.com/300x450'}" alt="${m.title}">
          <div class="movie-info">
            <h3>${m.title}</h3>
            <p>${m.year}</p>
            <div class="tags">
              ${(m.genres||[]).map(g=>`<span class="tag">${g}</span>`).join('')}
            </div>
            <button class="view-button" data-id="${m._id}">VIEW DETAILS</button>
          </div>`;
        card.querySelector('.view-button')
            .addEventListener('click', () => {
              location.href = `movie.html?id=${m._id}`;
            });
        grid.appendChild(card);
      });
    } catch (e) {
      err.textContent = e.message;
      err.style.display = 'block';
    } finally {
      load.style.display = 'none';
    }
  }

  searchButton.addEventListener('click', () => {
    fetchMovies(searchInput.value.trim());
  });
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') fetchMovies(searchInput.value.trim());
  });

  fetchMovies();
});
