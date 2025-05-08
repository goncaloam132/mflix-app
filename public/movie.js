document.addEventListener('DOMContentLoaded', () => {
  const params    = new URLSearchParams(location.search);
  const id        = params.get('id');
  const titleEl   = document.getElementById('movie-title');
  const homeBtn   = document.getElementById('home-button');
  const load      = document.getElementById('loading');
  const err       = document.getElementById('error');
  const detail    = document.getElementById('detail-content');
  const editBtn   = document.getElementById('edit-button');
  const deleteBtn = document.getElementById('delete-button');
  const editForm  = document.getElementById('edit-form');
  const myMovies  = JSON.parse(localStorage.getItem('myMovies') || '[]');

  // Esconder ações e formulário no início
  editBtn.classList.add('hidden');
  deleteBtn.classList.add('hidden');
  editForm.classList.add('hidden');

  homeBtn.addEventListener('click', () => location.href = 'index.html');

  async function fetchDetails() {
    load.classList.remove('hidden');
    err.classList.add('hidden');
    detail.classList.add('hidden');
    editForm.classList.add('hidden');

    try {
      const res = await fetch(`/.netlify/functions/getMovie?id=${id}`, { cache: 'no-store' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || res.statusText);
      }
      const { movie, comments } = await res.json();
      if (!movie) throw new Error('Movie not found.');

      // Renderiza detalhes
      titleEl.textContent = movie.title;
      detail.innerHTML = `
        ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}" loading="lazy">`: ''}
        <h2>${movie.title} (${movie.year})</h2>
        <p>${movie.plot || 'Sem descrição.'}</p>
        <p><strong>Diretores:</strong> ${(movie.directors || []).join(', ')}</p>
        <p><strong>Elenco:</strong> ${(movie.cast || []).join(', ')}</p>
        <p><strong>Nota:</strong> ${movie.imdb?.rating ?? 'N/A'}</p>
        <h3>Comments</h3>
        ${comments.length
          ? comments.map(c => `
              <div class="comment">
                ${c.name ? `<strong>${c.name}:</strong> ` : ''}
                <span>${c.text}</span>
              </div>
            `).join('')
          : '<p>Sem comentários.</p>'}
      `;
      detail.classList.remove('hidden');

      // Mostrar botões só para filmes do utilizador
      if (myMovies.includes(id)) {
        editBtn.classList.remove('hidden');
        deleteBtn.classList.remove('hidden');
      }

      // Preencher o formulário
      editForm.title.value     = movie.title;
      editForm.year.value      = movie.year;
      editForm.poster.value    = movie.poster || '';
      editForm.genres.value    = (movie.genres || []).join(', ');
      editForm.rating.value    = movie.imdb?.rating ?? '';
      editForm.plot.value      = movie.plot || '';
      editForm.directors.value = (movie.directors || []).join(', ');
      editForm.cast.value      = (movie.cast || []).join(', ');
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove('hidden');
    } finally {
      load.classList.add('hidden');
    }
  }

  // Alterna visibilidade do formulário
  editBtn.addEventListener('click', () => {
    editForm.classList.toggle('hidden');
  });

  // Submissão de edição (PUT)
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = {
      title:     editForm.title.value.trim(),
      year:      Number(editForm.year.value),
      poster:    editForm.poster.value.trim(),
      genres:    editForm.genres.value.split(',').map(s => s.trim()).filter(Boolean),
      'imdb.rating': Number(editForm.rating.value),
      plot:      editForm.plot.value.trim(),
      directors: editForm.directors.value.split(',').map(s => s.trim()).filter(Boolean),
      cast:      editForm.cast.value.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(`/.netlify/functions/updateMovie?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao atualizar.');
      alert('Filme atualizado com sucesso.');
      fetchDetails();
      editForm.classList.add('hidden');
    } catch (e) {
      alert(`Erro na atualização: ${e.message}`);
    }
  });

  // Exclusão (DELETE)
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Confirma exclusão deste filme?')) return;
    try {
      const res = await fetch(`/.netlify/functions/deleteMovie?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao excluir.');
      const updated = myMovies.filter(mid => mid !== id);
      localStorage.setItem('myMovies', JSON.stringify(updated));
      alert('Filme excluído.');
      location.href = 'index.html';
    } catch (e) {
      alert(`Erro ao excluir: ${e.message}`);
    }
  });

  // Inicia
  if (id) fetchDetails();
  else {
    err.textContent = 'Nenhum ID de filme fornecido.';
    err.classList.remove('hidden');
  }
});
