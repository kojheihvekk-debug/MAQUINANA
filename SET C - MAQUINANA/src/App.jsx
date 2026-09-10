import { useRef, useState } from 'react';

const emptyMovie = { title: '', year: '', rating: '', poster: '', synopsis: '' };
const years = Array.from({ length: 10 }, (_, index) => 2024 - index);

function App() {
  const [movies, setMovies] = useState([]);
  const [movie, setMovie] = useState(emptyMovie);
  const [castMember, setCastMember] = useState('');
  const [cast, setCast] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const isEditing = editingId !== null;

  function resetForm() {
    setMovie(emptyMovie);
    setCastMember('');
    setCast([]);
    setEditingId(null);
    setError('');
  }

  function addCast() {
    const name = castMember.trim();
    if (!name) return;
    setCast((members) => [...members, name]);
    setCastMember('');
  }

  function removeCast(index) {
    if (cast.length === 1) {
      setError('A movie must have at least one cast member. Add another member before removing this one.');
      return;
    }

    const name = cast[index];
    if (!window.confirm(`Remove ${name} from the cast?`)) return;
    setCast((members) => members.filter((_, memberIndex) => memberIndex !== index));
    setError('');
  }

  function removeMovie(savedMovie) {
    if (!window.confirm(`Delete “${savedMovie.title}” from your collection?`)) return;
    setMovies((currentMovies) => currentMovies.filter((item) => item.id !== savedMovie.id));
    if (editingId === savedMovie.id) resetForm();
  }

  function validateMovie() {
    if (Object.values(movie).some((value) => !String(value).trim())) return 'Please fill in all fields.';
    if (movies.some((savedMovie) => savedMovie.id !== editingId && savedMovie.title.toLowerCase() === movie.title.trim().toLowerCase())) return 'A movie with this title is already in your collection.';
    const rating = Number(movie.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) return 'Movie rating must be a whole number from 1 to 10.';
    if (!cast.length) return 'Add at least one movie cast member.';
    try { new URL(movie.poster); } catch { return 'Please enter a valid poster URL.'; }
    return '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateMovie();
    if (validationError) { setError(validationError); return; }
    const savedMovie = {
      ...movie,
      id: editingId ?? crypto.randomUUID(),
      title: movie.title.trim(),
      poster: movie.poster.trim(),
      synopsis: movie.synopsis.trim(),
      rating: Number(movie.rating),
      cast: [...cast],
    };
    setMovies((currentMovies) => isEditing ? currentMovies.map((item) => item.id === editingId ? savedMovie : item) : [...currentMovies, savedMovie]);
    resetForm();
  }

  function startEdit(savedMovie) {
    setEditingId(savedMovie.id);
    setMovie({ title: savedMovie.title, year: savedMovie.year, rating: String(savedMovie.rating), poster: savedMovie.poster, synopsis: savedMovie.synopsis });
    setCast(savedMovie.cast);
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => titleRef.current?.focus(), 300);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setMovie((currentMovie) => ({ ...currentMovie, [name]: value }));
  }

  return (
    <main className="app-shell">
      <header><h1>Movie Collection</h1></header>
      <section className="workspace" aria-label="Movie manager">
        <form ref={formRef} className="movie-form" noValidate onSubmit={handleSubmit}>
          <div className="form-heading"><div><p className="eyebrow">Movie details</p><h2>{isEditing ? 'Update movie' : 'Add a movie'}</h2></div>{isEditing && <span className="edit-badge">Editing</span>}</div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="fields">
            <label>Movie title<input ref={titleRef} name="title" value={movie.title} onChange={updateField} type="text" maxLength="80" placeholder="e.g. Interstellar" required /></label>
            <label>Year release<select name="year" value={movie.year} onChange={updateField} required><option value="">Select a Year</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
            <label>Movie rating <span className="hint">1–10</span><input name="rating" value={movie.rating} onChange={updateField} type="number" min="1" max="10" step="1" placeholder="10" required /></label>
            <label>Poster URL<input name="poster" value={movie.poster} onChange={updateField} type="url" maxLength="500" placeholder="https://example.com/poster.jpg" required /></label>
          </div>
          <label className="synopsis-label">Synopsis<textarea name="synopsis" value={movie.synopsis} onChange={updateField} maxLength="500" placeholder="Write a short summary of the movie..." required /></label>
          <fieldset className="cast-fieldset">
            <legend>Movie cast</legend><p className="field-help">Add at least one cast member.</p>
            <div className="cast-add"><input value={castMember} onChange={(event) => setCastMember(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCast(); } }} type="text" maxLength="60" placeholder="Cast member name" aria-label="Cast member name" /><button type="button" onClick={addCast}>Add cast</button></div>
            <ul className="cast-draft" aria-live="polite">{cast.map((member, index) => <li key={`${member}-${index}`}>{member}<button type="button" onClick={() => removeCast(index)} aria-label={`Remove ${member}`}>×</button></li>)}</ul>
          </fieldset>
          <div className="form-actions"><button className="primary" type="submit">{isEditing ? 'Update movie' : 'Create movie'}</button><button className="secondary" type="button" onClick={resetForm}>Clear</button></div>
        </form>
        <section className="collection" aria-labelledby="collectionTitle">
          <div className="collection-heading"><div><p id="collectionTitle" className="eyebrow">Movie List</p></div><span className="movie-count">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</span></div>
          <div className="movie-list" aria-live="polite">
            {movies.length === 0 ? <div className="empty-state">No movies saved yet. Add your first one from the form.</div> : movies.map((savedMovie, index) => <article className="movie-card" key={savedMovie.id}>
              <span className="movie-number">Movie Number {index + 1}</span><img className="poster" src={savedMovie.poster} alt={`${savedMovie.title} poster`} />
              <div className="movie-content"><h3>{savedMovie.title}</h3><p className="movie-meta">Released {savedMovie.year} · Rating {savedMovie.rating}/10</p><p className="synopsis">{savedMovie.synopsis}</p><span className={`recommendation${savedMovie.rating > 4 ? ' high' : ''}`}>{savedMovie.rating} – {savedMovie.rating < 5 ? 'Not Recommended' : 'Highly Recommended'}</span><ol className="cast-list">{savedMovie.cast.map((member, castIndex) => <li key={`${member}-${castIndex}`}>{member}</li>)}</ol><div className="card-actions"><button className="edit" type="button" onClick={() => startEdit(savedMovie)}>Edit</button><button className="delete" type="button" onClick={() => removeMovie(savedMovie)}>Delete</button></div></div>
            </article>)}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
