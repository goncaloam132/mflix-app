document.addEventListener('DOMContentLoaded', () => {
  const grid            = document.getElementById('movies-container');
  const load            = document.getElementById('loading');
  const err             = document.getElementById('error');
  const searchInput     = document.getElementById('search-input');
  const searchButton    = document.getElementById('search-button');
  const prevPageButton  = document.getElementById('prev-page');
  const nextPageButton  = document.getElementById('next-page');
  const currentPageElem = document.getElementById('current-page');
  const totalPagesElem  = document.getElementById('total-pages');

  let currentPage = 1;
  const pageSize = 16;
  let totalPages = 1;

  async function fetchMovies(query = '', page = 1) {
    // UI: mostrar loading e limpar estado
    load.style.display = 'block';
    err.style.display  = 'none';
    grid.innerHTML     = '';
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;

    try {
      // Monta parâmetros na URL
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      params.append('page', page);
      params.append('limit', pageSize);

      const url = `/.netlify/functions/getMovies?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || res.statusText);
      }

      // Função agora retorna { movies, totalCount }
      const { movies, totalCount } = await res.json();
      if (!movies.length) throw new Error('Nenhum filme encontrado.');

      // Atualiza paginação
      totalPages = Math.ceil(totalCount / pageSize);
      currentPage = page;
      currentPageElem.textContent = currentPage;
      totalPagesElem.textContent  = totalPages;
      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage === totalPages;

      // Renderiza
      renderMovies(movies);

    } catch (e) {
      err.textContent   = e.message;
      err.style.display = 'block';
    } finally {
      load.style.display = 'none';
    }
  }

  function renderMovies(movies) {
    grid.innerHTML = '';
    movies.forEach(m => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img src="${m.poster || 'https://via.placeholder.com/300x450'}"
             alt="${m.title}" loading="lazy">
        <div class="movie-info">
          <h3>${m.title}</h3>
          <p>${m.year || 'N/A'}</p>
          <div class="tags">
            ${(m.genres || []).map(g => `<span class="tag">${g}</span>`).join('')}
          </div>
          <button class="view-button" data-id="${m._id}">
            VIEW DETAILS
          </button>
        </div>
      `;
      card.querySelector('.view-button')
          .addEventListener('click', () => {
            location.href = `movie.html?id=${m._id}`;
          });
      grid.appendChild(card);
    });
  }

  // Event handlers
  searchButton.addEventListener('click', () =>
    fetchMovies(searchInput.value.trim(), 1)
  );
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') fetchMovies(searchInput.value.trim(), 1);
  });
  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      fetchMovies(searchInput.value.trim(), currentPage - 1);
    }
  });
  nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      fetchMovies(searchInput.value.trim(), currentPage + 1);
    }
  });

  // Carregamento inicial
  fetchMovies('', 1);
});
