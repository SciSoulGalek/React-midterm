
import { useState } from "react";

export default function GameDetails({
  game,
  onClose,
  onUpdate,
  onDelete,
  onAddToLibrary,
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: game.name,
    genre: game.genre,
    releaseYear: String(game.releaseYear),
    developer: game.developer,
    rating: String(game.rating),
    description: game.description,
    cover: game.cover || "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onUpdate({
        name: form.name.trim(),
        genre: form.genre.trim(),
        releaseYear: Number(form.releaseYear),
        developer: form.developer.trim(),
        rating: Number(form.rating),
        description: form.description,
        cover: form.cover,
      });
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(event) {
    setError("");

    try {
      await onUpdate({ status: event.target.value });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleAddToLibrary() {
    setSaving(true);
    setError("");

    try {
      await onAddToLibrary(game.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove "${game.name}" from your library?`)) {
      return;
    }

    setError("");

    try {
      await onDelete(game.id);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="details-backdrop" onClick={onClose}>
      <section
        className="details-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="details-top">
          <span className="eyebrow">GAME DETAILS</span>
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>
        </div>

        {game.cover && (
          <img className="details-cover" src={game.cover} alt={game.name} />
        )}

        {editing && game.inLibrary ? (
          <form className="game-form" onSubmit={handleSave}>
            <label>
              Title
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Genre
                <input
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Release year
                <input
                  name="releaseYear"
                  type="number"
                  min="1970"
                  max={new Date().getFullYear() + 5}
                  value={form.releaseYear}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Developer
                <input
                  name="developer"
                  value={form.developer}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Rating
                <input
                  name="rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </label>

            <label>
              Cover image URL
              <input
                name="cover"
                type="url"
                value={form.cover}
                onChange={handleChange}
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="add-button" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 id="details-title">{game.name}</h2>
            <p className="details-subtitle">
              {game.genre} · {game.releaseYear}
            </p>

            <div className="details-rating">★ {game.rating} / 10</div>

            <p className="details-description">
              {game.description || "No description available."}
            </p>

            <div className="details-facts">
              <div>
                <span>DEVELOPER</span>
                <strong>{game.developer}</strong>
              </div>
              <div>
                <span>PLATFORMS</span>
                <strong>{game.platforms.join(", ") || "Not specified"}</strong>
              </div>
            </div>

            {game.inLibrary ? (
              <>
                <label className="details-status">
                  Library status
                  <select value={game.status || ""} onChange={handleStatusChange}>
                    {["Want to Play", "Playing", "Completed", "Dropped"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <div className="form-actions">
                  <button className="cancel-button" onClick={handleDelete}>
                    Remove from library
                  </button>
                  <button
                    className="add-button"
                    onClick={() => setEditing(true)}
                  >
                    Edit game
                  </button>
                </div>
              </>
            ) : (
              <div className="form-actions">
                <button
                  className="add-button"
                  disabled={saving}
                  onClick={handleAddToLibrary}
                >
                  {saving ? "Adding..." : "+ Add to Library"}
                </button>
              </div>
            )}
          </>
        )}

        {error && <p className="form-error">{error}</p>}
      </section>
    </div>
  );
}
