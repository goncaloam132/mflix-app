document.getElementById('create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    title:     form.title.value.trim(),
    year:      parseInt(form.year.value, 10) || null,
    poster:    form.poster.value.trim(),
    genres:    form.genres.value.split(',').map(s => s.trim()).filter(Boolean),
    rating:    parseFloat(form.rating.value) || 0,
    plot:      form.plot.value.trim(),
    directors: form.directors.value.split(',').map(s => s.trim()).filter(Boolean),
    cast:      form.cast.value.split(',').map(s => s.trim()).filter(Boolean),
  };

  try {
    const res = await fetch('/.netlify/functions/createMovie', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Erro ao criar filme.');
    }

    // Marca no localStorage
    const meus = JSON.parse(localStorage.getItem('myMovies') || '[]');
    meus.push(json.insertedId);
    localStorage.setItem('myMovies', JSON.stringify(meus));

    document.getElementById('msg').textContent =
      `Filme criado com ID ${json.insertedId}.`;
    form.reset();
  } catch (err) {
    document.getElementById('msg').textContent = `Erro: ${err.message}`;
  }
});
