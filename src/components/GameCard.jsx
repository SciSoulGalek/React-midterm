
export default function GameCard({ game, onSelect, view, onAddToLibrary }) {
  return (
    <article className="game-card">
      <div
        className="game-cover"
        onClick={() => onSelect(game.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(game.id);
          }
        }}
      >
        {game.cover ? (
          <img src={game.cover} alt={game.name} />
        ) : (
          <div className="cover-placeholder">
            <span>Q</span>
            <small>{game.genre}</small>
          </div>
        )}

        <span className="rating">★ {game.rating}</span>
      </div>

      <div className="game-card-info">
        <div>
          <h3>{game.name}</h3>
          <p>{game.genre} · {game.releaseYear}</p>
        </div>
        <button
          className="card-arrow"
          aria-label={`View ${game.name} details`}
          onClick={() => onSelect(game.id)}
        >
          ↗
        </button>
      </div>

      {view === "library" ? (
        game.status && (
          <span
            className={`game-status status-${game.status.toLowerCase().replaceAll(" ", "-")}`}
          >
            {game.status}
          </span>
        )
      ) : (
        <button
          className="library-action"
          disabled={game.inLibrary}
          onClick={() => onAddToLibrary(game.id)}
        >
          {game.inLibrary ? "In your library" : "+ Add to Library"}
        </button>
      )}
    </article>
  );
}
