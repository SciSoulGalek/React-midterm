export default function GameFilters({
  view,
  search,
  setSearch,
  genre,
  setGenre,
  platform,
  setPlatform,
  status,
  setStatus,
  sort,
  setSort,
  genres,
}) {
  return (
    <section className="filters">
      <input
        className="search-input"
        type="search"
        placeholder="Search games, genres, developers..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select value={genre} onChange={(event) => setGenre(event.target.value)}>
        <option value="all">All genres</option>
        {genres.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
        <option value="all">All platforms</option>
        {["PC", "PlayStation", "Xbox", "Switch", "Mobile"].map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {view === "library" && (
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {["Want to Play", "Playing", "Completed", "Dropped"].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      )}

      <select value={sort} onChange={(event) => setSort(event.target.value)}>
        <option value="name">Name: A–Z</option>
        <option value="name-desc">Name: Z–A</option>
        <option value="rating">Highest rated</option>
        <option value="rating-asc">Lowest rated</option>
        <option value="year">Newest first</option>
        <option value="year-asc">Oldest first</option>
      </select>
    </section>
  );
}
