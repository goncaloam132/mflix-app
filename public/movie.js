document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const id     = params.get('id');
    const titleEl= document.getElementById('movie-title');
    const homeBtn= document.getElementById('home-button');
    const load   = document.getElementById('loading');
    const err    = document.getElementById('error');
    const detail = document.getElementById('detail-content');
  
    homeBtn.addEventListener('click', () => location.href = 'index.html');
  
    async function fetchDetails() {
      load.textContent = 'Loading details…';
      load.style.display = 'block';
      err.style.display = 'none';
      detail.style.display = 'none';
  
      try {
        const res = await fetch(`/.netlify/functions/getMovie?id=${id}`);
        const { movie, comments } = await res.json();
        if (!movie) throw new Error('Movie not found.');
  
        titleEl.textContent = movie.title;
        detail.innerHTML = `
          ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}">` : ''}
          <h2>${movie.title} (${movie.year})</h2>
          <p>${movie.plot || 'No description.'}</p>
          <p><strong>Directors:</strong> ${(movie.directors||[]).join(', ')}</p>
          <p><strong>Cast:</strong> ${(movie.cast||[]).slice(0,5).join(', ')}${movie.cast.length>5?'…':''}</p>
          <p><strong>Rating:</strong> ${movie.imdb?.rating||'N/A'}</p>
          <h3>Comments</h3>
          ${comments.length
            ? comments.map(c=>`<div class="comment">
                ${c.name?`<strong>${c.name}:</strong> `:''}${c.text}
              </div>`).join('')
            : '<p>No comments found.</p>'}
        `;
        detail.style.display = 'block';
      } catch (e) {
        err.textContent = e.message;
        err.style.display = 'block';
      } finally {
        load.style.display = 'none';
      }
    }
  
    if (id) fetchDetails();
    else {
      err.textContent = 'No movie ID provided.';
      err.style.display = 'block';
    }
  });
  