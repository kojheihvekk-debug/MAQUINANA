const form = document.querySelector('#movieForm');
const titleInput = document.querySelector('#title');
const yearInput = document.querySelector('#year');
const ratingInput = document.querySelector('#rating');
const posterInput = document.querySelector('#poster');
const synopsisInput = document.querySelector('#synopsis');
const castInput = document.querySelector('#castInput');
const castDraft = document.querySelector('#castDraft');
const movieList = document.querySelector('#movieList');
const formError = document.querySelector('#formError');
const submitButton = document.querySelector('#submitButton');
const clearButton = document.querySelector('#clearButton');
const formTitle = document.querySelector('#formTitle');
const editBadge = document.querySelector('#editBadge');
const movieCount = document.querySelector('#movieCount');

let movies = [];
let draftCast = [];
let editingId = null;

function showError(message = '') {
  formError.textContent = message;
  formError.hidden = !message;
}

function renderDraftCast() {
  castDraft.replaceChildren(...draftCast.map((name, index) => {
    const item = document.createElement('li');
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remove ${name}`);
    remove.addEventListener('click', () => { draftCast.splice(index, 1); renderDraftCast(); });
    item.append(name, remove);
    return item;
  }));
}

function addCast() {
  const name = castInput.value.trim();
  if (!name) return;
  draftCast.push(name);
  castInput.value = '';
  castInput.focus();
  renderDraftCast();
}

function resetForm() {
  form.reset();
  draftCast = [];
  editingId = null;
  formTitle.textContent = 'Add a movie';
  submitButton.textContent = 'Create movie';
  editBadge.hidden = true;
  showError();
  renderDraftCast();
}

function validateMovie() {
  if (!titleInput.value.trim() || !yearInput.value || !ratingInput.value || !posterInput.value.trim() || !synopsisInput.value.trim()) return 'Please fill in all fields.';
  const duplicateTitle = movies.some(movie => movie.id !== editingId && movie.title.toLocaleLowerCase() === titleInput.value.trim().toLocaleLowerCase());
  if (duplicateTitle) return 'A movie with this title is already in your collection.';
  const rating = Number(ratingInput.value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return 'Movie rating must be a whole number from 1 to 10.';
  if (!draftCast.length) return 'Add at least one movie cast member.';
  if (!posterInput.checkValidity()) return 'Please enter a valid poster URL.';
  return '';
}

function renderMovies() {
  movieCount.textContent = `${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}`;
  if (!movies.length) { movieList.innerHTML = '<div class="empty-state">No movies saved yet. Add your first one from the form.</div>'; return; }
  movieList.replaceChildren(...movies.map((movie, index) => {
    const card = document.createElement('article'); card.className = 'movie-card';
    const number = document.createElement('span'); number.className = 'movie-number'; number.textContent = `Movie Number ${index + 1}`;
    const image = document.createElement('img'); image.className = 'poster'; image.src = movie.poster; image.alt = 'Poster';
    const content = document.createElement('div'); content.className = 'movie-content';
    const heading = document.createElement('h3'); heading.textContent = movie.title;
    const meta = document.createElement('p'); meta.className = 'movie-meta'; meta.textContent = `Released ${movie.year} · Rating ${movie.rating}/10`;
    const synopsis = document.createElement('p'); synopsis.className = 'synopsis'; synopsis.textContent = movie.synopsis;
    const recommendation = document.createElement('span'); recommendation.className = `recommendation${movie.rating > 4 ? ' high' : ''}`;
    recommendation.textContent = `${movie.rating} – ${movie.rating < 5 ? 'Not Recommended' : 'Highly Recommended'}`;
    const cast = document.createElement('ol'); cast.className = 'cast-list'; movie.cast.forEach(member => { const li = document.createElement('li'); li.textContent = member; cast.append(li); });
    const actions = document.createElement('div'); actions.className = 'card-actions';
    const edit = document.createElement('button'); edit.className = 'edit'; edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => startEdit(movie.id));
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = 'Delete'; remove.addEventListener('click', () => deleteMovie(movie.id));
    actions.append(edit, remove); content.append(heading, meta, synopsis, recommendation, cast, actions); card.append(number, image, content); return card;
  }));
}

function startEdit(id) {
  const movie = movies.find(item => item.id === id); if (!movie) return;
  editingId = id; titleInput.value = movie.title; yearInput.value = movie.year; ratingInput.value = movie.rating; posterInput.value = movie.poster; synopsisInput.value = movie.synopsis; draftCast = [...movie.cast];
  formTitle.textContent = 'Update movie'; submitButton.textContent = 'Update movie'; editBadge.hidden = false; showError(); renderDraftCast();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' }); titleInput.focus();
}

function deleteMovie(id) { movies = movies.filter(movie => movie.id !== id); if (editingId === id) resetForm(); renderMovies(); }

document.querySelector('#addCast').addEventListener('click', addCast);
castInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addCast(); } });
clearButton.addEventListener('click', resetForm);
form.addEventListener('submit', event => {
  event.preventDefault(); const error = validateMovie(); if (error) { showError(error); return; }
  const movie = { id: editingId ?? crypto.randomUUID(), title: titleInput.value.trim(), year: yearInput.value, rating: Number(ratingInput.value), poster: posterInput.value.trim(), synopsis: synopsisInput.value.trim(), cast: [...draftCast] };
  if (editingId) movies = movies.map(item => item.id === editingId ? movie : item); else movies.push(movie);
  renderMovies(); resetForm();
});
renderMovies();
