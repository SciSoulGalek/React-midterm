
import { API_CONFIG, DATA_KEY } from "./settings.js";
import { initialDataSample } from "./initial-data-sample.js";

const CATALOG_KEY = "questlog-catalog-v1";
const LIBRARY_KEY = "questlog-library-v1";

function fakeRequest(operation) {
  return new Promise((resolve, reject) => {
    const delay =
      Math.floor(
        Math.random() * (API_CONFIG.maxDelay - API_CONFIG.minDelay + 1),
      ) + API_CONFIG.minDelay;

    setTimeout(() => {
      if (Math.random() < API_CONFIG.errorChance) {
        reject(new Error("Simulated server error"));
        return;
      }

      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

function readStorage(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initializeDatabase() {
  if (localStorage.getItem(CATALOG_KEY)) return;

  const legacyData = readStorage(DATA_KEY);
  const catalog = initialDataSample.map((game) => {
    const savedGame = legacyData.find((item) => item.id === game.id);
    return savedGame ? { ...game, ...savedGame } : game;
  });

  const initialIds = new Set(initialDataSample.map((game) => game.id));
  const customGames = legacyData.filter((game) => !initialIds.has(game.id));

  writeStorage(CATALOG_KEY, [...catalog, ...customGames]);

  const legacyLibrary = customGames.map((game) => ({
    id: game.id,
    status: game.status || "Want to Play",
  }));

  writeStorage(LIBRARY_KEY, legacyLibrary);
}

function readCatalog() {
  initializeDatabase();
  return readStorage(CATALOG_KEY);
}

function readLibrary() {
  initializeDatabase();
  return readStorage(LIBRARY_KEY);
}

function getTrackedGame(game, library) {
  const entry = library.find((item) => item.id === game.id);

  return {
    ...game,
    inLibrary: Boolean(entry),
    status: entry?.status || null,
  };
}

export function getGamesList(query = "") {
  return fakeRequest(() => {
    const params = new URLSearchParams(query);
    const search = (params.get("search") || "").toLowerCase();
    const genre = params.get("genre") || "all";
    const platform = params.get("platform") || "all";
    const status = params.get("status") || "all";
    const sort = params.get("sort") || "name";
    const view = params.get("view") || "library";
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.max(1, Number(params.get("limit")) || 12);

    const catalog = readCatalog();
    const library = readLibrary();

    let games = catalog.map((game) => getTrackedGame(game, library));

    if (view === "library") {
      games = games.filter((game) => game.inLibrary);
    }

    if (search) {
      games = games.filter((game) =>
        [game.name, game.description, game.genre, game.developer].some(
          (value) => value?.toLowerCase().includes(search),
        ),
      );
    }

    if (genre !== "all") {
      games = games.filter((game) => game.genre === genre);
    }

    if (platform !== "all") {
      games = games.filter((game) => game.platforms.includes(platform));
    }

    if (status !== "all") {
      games = games.filter((game) => game.status === status);
    }

    games.sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rating":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "year":
          return b.releaseYear - a.releaseYear;
        case "year-asc":
          return a.releaseYear - b.releaseYear;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    const total = games.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(page, Math.max(1, totalPages));
    const start = (currentPage - 1) * limit;

    return {
      data: games.slice(start, start + limit),
      total,
      page: currentPage,
      limit,
      totalPages,
    };
  });
}

export function getGame(id) {
  return fakeRequest(() => {
    const game = readCatalog().find((item) => item.id === Number(id));

    if (!game) throw new Error("Game not found");

    return getTrackedGame(game, readLibrary());
  });
}

export function addToLibrary(id) {
  return fakeRequest(() => {
    const numericId = Number(id);
    const catalog = readCatalog();
    const game = catalog.find((item) => item.id === numericId);

    if (!game) throw new Error("Game not found");

    const library = readLibrary();

    if (!library.some((item) => item.id === numericId)) {
      writeStorage(LIBRARY_KEY, [
        ...library,
        { id: numericId, status: "Want to Play" },
      ]);
    }

    return getTrackedGame(game, readLibrary());
  });
}

export function removeFromLibrary(id) {
  return fakeRequest(() => {
    const numericId = Number(id);
    const library = readLibrary();

    if (!library.some((item) => item.id === numericId)) {
      throw new Error("Game is not in your library");
    }

    writeStorage(
      LIBRARY_KEY,
      library.filter((item) => item.id !== numericId),
    );

    return { success: true, id: numericId };
  });
}


export function createGame(data) {
  return fakeRequest(() => {
    const catalog = readCatalog();
    if (
      catalog.some(
        (game) => game.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
      )
    ) {
      throw new Error("A game with this title already exists.");
    }

    const nextId = catalog.length
      ? Math.max(...catalog.map((game) => game.id)) + 1
      : 1;

    const { destination, status, ...gameData } = data;

    const newGame = {
      ...gameData,
      id: nextId,
      platforms: Array.isArray(gameData.platforms)
        ? gameData.platforms
        : [],
    };

    writeStorage(CATALOG_KEY, [...catalog, newGame]);

    if (destination === "library") {
      writeStorage(LIBRARY_KEY, [
        ...readLibrary(),
        { id: nextId, status: status || "Want to Play" },
      ]);
    }

    return getTrackedGame(newGame, readLibrary());
  });
}


export function updateGame(id, changes) {
  return fakeRequest(() => {
    const numericId = Number(id);
    const catalog = readCatalog();
    const game = catalog.find((item) => item.id === numericId);

    if (!game) throw new Error("Game not found");

    const { status, inLibrary, ...gameChanges } = changes;
    const library = readLibrary();
    const entry = library.find((item) => item.id === numericId);

    if (status !== undefined && !entry) {
      throw new Error("Game is not in your library");
    }

    const updatedGame = {
      ...game,
      ...gameChanges,
      id: numericId,
    };

    writeStorage(
      CATALOG_KEY,
      catalog.map((item) => (item.id === numericId ? updatedGame : item)),
    );

    if (status !== undefined) {
      writeStorage(
        LIBRARY_KEY,
        library.map((item) =>
          item.id === numericId ? { ...item, status } : item,
        ),
      );
    }

    return getTrackedGame(updatedGame, readLibrary());
  });
}


export function deleteGame(id) {
  return removeFromLibrary(id);
}