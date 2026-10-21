
import { useState } from "react";

const emptyForm = {
  name: "",
  genre: "RPG",
  releaseYear: "",
  developer: "",
  rating: "7.0",
  description: "",
  platforms: ["PC"],
  destination: "library",
  status: "Want to Play",
  cover: "",
};

const availablePlatforms = [
  "PC",
  "PlayStation",
  "Xbox",
  "Switch",
  "Mobile",
];

export default function GameForm({ genres, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePlatformChange(platform) {
    setForm((current) => ({
      ...current,
      platforms: current.platforms.includes(platform)
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform],
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.developer.trim()) {
      setError("Please enter a game title and developer.");
      return;
    }

    if (form.platforms.length === 0) {
      setError("Select at least one platform.");
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      developer: form.developer.trim(),
      releaseYear: Number(form.releaseYear),
      rating: Number(form.rating),
      description: form.description.trim(),
    });
  }

  return (
    <section className="form-panel">
      <div className="form-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h2>Add a game</h2>
        </div>
        <button type="button" className="cancel-button" onClick={onCancel}>
          Close
        </button>
      </div>

      <form className="game-form" onSubmit={handleSubmit}>
        <label>
          Game title
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Hollow Knight"
            required
          />
        </label>

        <div className="form-row">
          <label>
            Genre
            <select name="genre" value={form.genre} onChange={handleChange}>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
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
              placeholder="Studio name"
              required
            />
          </label>

          <label>
            Rating (0–10)
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
            placeholder="What is this game about?"
            rows="3"
          />
        </label>

        <fieldset className="platform-options">
          <legend>Platforms</legend>
          {availablePlatforms.map((platform) => (
            <label key={platform} className="platform-option">
              <input
                type="checkbox"
                checked={form.platforms.includes(platform)}
                onChange={() => handlePlatformChange(platform)}
              />
              {platform}
            </label>
          ))}
        </fieldset>

        <label>
          Add to
          <select
            name="destination"
            value={form.destination}
            onChange={handleChange}
          >
            <option value="discover">Discover only</option>
            <option value="library">My Library</option>
          </select>
        </label>

        {form.destination === "library" && (
          <label>
            Library status
            <select name="status" value={form.status} onChange={handleChange}>
              {["Want to Play", "Playing", "Completed", "Dropped"].map(
                (status) => (
                  <option key={status} value={status}>{status}</option>
                ),
              )}
            </select>
          </label>
        )}

        <label>
          Cover image URL (optional)
          <input
            name="cover"
            type="url"
            value={form.cover}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="add-button">
            {form.destination === "library" ? "Add to library" : "Add to Discover"}
          </button>
        </div>
      </form>
    </section>
  );
}
