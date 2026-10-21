
export default function Header({ activePage, onNavigate, onAddGame }) {
  return (
    <header className="header">
      <a
        className="logo"
        href="#library"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("library");
        }}
      >
        <span className="logo-mark">Q</span>
        <span>QUESTLOG</span>
      </a>

      <nav className="navigation">
        <button
          className={`nav-link ${activePage === "library" ? "active" : ""}`}
          onClick={() => onNavigate("library")}
        >
          Library
        </button>
        <button
          className={`nav-link ${activePage === "discover" ? "active" : ""}`}
          onClick={() => onNavigate("discover")}
        >
          Discover
        </button>
      </nav>

      <button className="add-button" onClick={onAddGame}>
        <span>+</span> Add game
      </button>
    </header>
  );
}
