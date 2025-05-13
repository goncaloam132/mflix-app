document.addEventListener('DOMContentLoaded', () => {
  const grid             = document.getElementById('movies-container');
  const load             = document.getElementById('loading');
  const errElem          = document.getElementById('error');
  const searchInput      = document.getElementById('search-input');
  const searchButton     = document.getElementById('search-button');
  const prevPageButton   = document.getElementById('prev-page');
  const nextPageButton   = document.getElementById('next-page');
  const currentPageElem  = document.getElementById('current-page');
  const totalPagesElem   = document.getElementById('total-pages');
  const yearMinInput     = document.getElementById('year-min');
  const yearMaxInput     = document.getElementById('year-max');
  const sortFieldInput   = document.getElementById('sort-field');
  const sortOrderInput   = document.getElementById('sort-order');
  const toggleFiltersBtn = document.getElementById('toggle-filters');
  const filterPanel      = document.getElementById('filter-panel');
  const applyFiltersBtn  = document.getElementById('apply-filters');

  let currentPage = 1;
  const pageSize  = 16;
  let totalPages  = 1;

  toggleFiltersBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
  });

  applyFiltersBtn.addEventListener('click', () =>
    fetchMovies(searchInput.value.trim(), 1)
  );

  async function fetchMovies(query = '', page = 1) {
    load.style.display      = 'block';
    errElem.style.display   = 'none';
    grid.innerHTML          = '';
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;

    // prepara URLSearchParams
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    params.append('page', page);
    params.append('limit', pageSize);

    // só append se o input não estiver em branco e for número válido
    const rawMin = yearMinInput.value.trim();
    if (rawMin !== '') {
      const ym = parseInt(rawMin, 10);
      if (!isNaN(ym)) {
        // clamp visual a 1900–2025
        const clamped = Math.max(1900, Math.min(2025, ym));
        yearMinInput.value = clamped;
        params.append('yearMin', clamped);
      }
    }

    const rawMax = yearMaxInput.value.trim();
    if (rawMax !== '') {
      const yM = parseInt(rawMax, 10);
      if (!isNaN(yM)) {
        const clamped = Math.max(1900, Math.min(2025, yM));
        yearMaxInput.value = clamped;
        params.append('yearMax', clamped);
      }
    }

    params.append('sortField', sortFieldInput.value);
    params.append('sortOrder', sortOrderInput.value);

    try {
      const url = `/.netlify/functions/getMovies?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || res.statusText);
      }

      const { movies, totalCount } = await res.json();
      if (!movies.length) throw new Error('Nenhum filme encontrado.');

      // atualiza paginação
      totalPages = Math.ceil(totalCount / pageSize);
      currentPage = page;
      currentPageElem.textContent = currentPage;
      totalPagesElem.textContent  = totalPages;
      prevPageButton.disabled     = currentPage === 1;
      nextPageButton.disabled     = currentPage === totalPages;

      renderMovies(movies);

    } catch (e) {
      errElem.textContent   = e.message;
      errElem.style.display = 'block';
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
            ${(m.genres||[]).map(g=>`<span class="tag">${g}</span>`).join('')}
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

  // handlers
  searchButton.addEventListener('click', () =>
    fetchMovies(searchInput.value.trim(), 1)
  );
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') fetchMovies(searchInput.value.trim(), 1);
  });
  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1)
      fetchMovies(searchInput.value.trim(), currentPage - 1);
  });
  nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages)
      fetchMovies(searchInput.value.trim(), currentPage + 1);
  });
  applyFiltersBtn.addEventListener('click', () =>
    fetchMovies(searchInput.value.trim(), 1)
  );

  // carregamento inicial SEM filtros
  fetchMovies('', 1);
});
