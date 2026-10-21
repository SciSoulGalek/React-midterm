
import { useEffect, useState } from "react";
import Header from "./components/Header";
import GameCard from "./components/GameCard";
import GameFilters from "./components/GameFilters";
import Pagination from "./components/Pagination";
import GameForm from "./components/GameForm";
import GameDetails from "./components/GameDetails";
import { getGamesList, createGame, updateGame, deleteGame, addToLibrary, } from "./api/gamesApi";
import { initialDataSample } from "./api/initial-data-sample";

const genres = [...new Set(initialDataSample.map((game) => game.genre))].sort();

export default function App() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePage, setActivePage] = useState("library");

  
useEffect(() => {
  let active = true;

  const params = new URLSearchParams({
    search,
    genre,
    platform,
    status: activePage === "discover" ? "all" : status,
    sort,
    view: activePage,
    page: String(page),
    limit: "12",
  });

  setLoading(true);
  setError("");

  getGamesList(params.toString())
    .then((result) => {
      if (!active) return;

      setGames(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      setLoading(false);
    })
    .catch((requestError) => {
      if (!active) return;

      setError(requestError.message);
      setLoading(false);
    });

  return () => {
    active = false;
  };
}, [search, genre, platform, status, sort, page, refreshKey, activePage]);


  function resetPage(setter, value) {
    setter(value);
    setPage(1);
    setNotice("");
  }

  async function handleAddToLibrary(id) {
    const addedGame = await addToLibrary(id);
    setSelectedGame(addedGame);
    setRefreshKey((current) => current + 1);
    setNotice("Game added to your library.");
  }

  async function handleAddGame(gameData) {
    setSaving(true);
    setFormError("");

    try {
      await createGame(gameData);
      
      setNotice(
        gameData.destination === "library"
          ? "Game added to your library."
          : "Game added to Discover.",
      );
      setShowForm(false);
      setSearch("");
      setGenre("all");
      setPlatform("all");
      setStatus("all");
      setSort("name");
      setPage(1);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateGame(changes) {
    const updatedGame = await updateGame(selectedGame.id, changes);

    setSelectedGame(updatedGame);
    setRefreshKey((current) => current + 1);
    setNotice("Game updated successfully.");
  }

  async function handleDeleteGame(id) {
    await deleteGame(id);

    setSelectedGame(null);
    setRefreshKey((current) => current + 1);
    setNotice("Game deleted from your library.");
  }

  return (
    <>
      <Header
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setPage(1);
          setNotice("");
          setSelectedGame(null);
        }}
        onAddGame={() => {
          setShowForm((current) => !current);
          setNotice("");
          setFormError("");
        }}
      />

      <main className="page-container" id="library">
        <section className="page-heading">
          <div>
            <p className="eyebrow">
              {activePage === "library" ? "YOUR GAMING COLLECTION" : "FIND YOUR NEXT ADVENTURE"}
            </p>
            <h1>
              {activePage === "library" ? "Your library" : "Discover games"}<span>.</span>
            </h1>
            <p className="page-description">
              {activePage === "library"
                ? "Your games, your progress, your collection."
                : "Explore the catalog and find your next adventure."}
            </p>
          </div>

          <div className="library-count">
            <strong>{total}</strong>
            <span>GAMES</span>
          </div>
        </section>

        {notice && <p className="success-message">{notice}</p>}

        {showForm && (
          <>
            <GameForm
              genres={genres}
              onSubmit={handleAddGame}
              onCancel={() => {
                setShowForm(false);
                setFormError("");
              }}
            />
            {formError && <p className="form-error">{formError}</p>}
          </>
        )}

        <GameFilters
          view={activePage}
          search={search}
          setSearch={(value) => resetPage(setSearch, value)}
          genre={genre}
          setGenre={(value) => resetPage(setGenre, value)}
          platform={platform}
          setPlatform={(value) => resetPage(setPlatform, value)}
          status={status}
          setStatus={(value) => resetPage(setStatus, value)}
          sort={sort}
          setSort={(value) => resetPage(setSort, value)}
          genres={genres}
        />

        {error && (
          <div className="status-message error-message">
            <p>{error}</p>
            <button onClick={() => setRefreshKey((current) => current + 1)}>
              Try again
            </button>
          </div>
        )}

        {loading && <p className="status-message">Loading your library...</p>}

        {!loading && !error && games.length === 0 && (
          <div className="status-message empty-message">
            {activePage === "library" && search.trim() === "" && genre === "all" && platform === "all" && status === "all" ? (
              <>
                <h2>Your library is empty</h2>
                <p>Discover games and add some to get started.</p>
                <button
                  className="add-button"
                  onClick={() => setActivePage("discover")}
                >
                  Explore games
                </button>
              </>
            ) : (
              <>
                <h2>
                  {activePage === "discover"
                    ? "No games found in the catalog"
                    : "No games match your search or filters"}
                </h2>
                <p>Try changing your search or filters to find games.</p>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setSearch("");
                    setGenre("all");
                    setPlatform("all");
                    setStatus("all");
                    setSort("name");
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <>
            <div className="results-heading">
              <span>Showing {games.length} of {total} games</span>
            </div>

            <div className="game-grid">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  view={activePage}
                  onSelect={(id) =>
                    setSelectedGame(games.find((item) => item.id === id))
                  }
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}

        {saving && <p className="status-message">Saving your game...</p>}

        {selectedGame && (
          <GameDetails
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
            onUpdate={handleUpdateGame}
            onDelete={handleDeleteGame}
            onAddToLibrary={handleAddToLibrary}
          />
        )}
      </main>
    </>
  );
}
