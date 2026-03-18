const GAMES_KEY = "hbs_games";

export function safeJSONParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

export function readGames() {
  return safeJSONParse(localStorage.getItem(GAMES_KEY), []);
}

export function writeGames(games) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  window.dispatchEvent(new Event("hbs:games"));
}

export function findGameByCode(code) {
  const normalized = normalizeCode(code);
  return (
    readGames().find((g) => normalizeCode(g.code) === normalized) || null
  );
}

export function updateGameByCode(code, updater) {
  const normalized = normalizeCode(code);
  const games = readGames();

  const updatedGames = games.map((game) => {
    if (normalizeCode(game.code) !== normalized) return game;
    return updater(game);
  });

  writeGames(updatedGames);

  return (
    updatedGames.find((g) => normalizeCode(g.code) === normalized) || null
  );
}