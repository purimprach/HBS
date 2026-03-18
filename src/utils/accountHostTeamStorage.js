import { readGames, writeGames } from "./gameStorage";
import { makeTeamId, normalizeEmail } from "./accountTeamActions";

function pickLatest(arr) {
  if (!arr || !arr.length) return null;
  return [...arr].sort((a, b) => {
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  })[0];
}

export function ensureDraftTeamInStorage({
  games,
  gameIdx,
  player,
  draftTeamId,
  teamName,
}) {
  const game = games[gameIdx];
  game.teams = game.teams || [];

  const draftId = draftTeamId || makeTeamId();

  let t = game.teams.find((x) => x.id === draftId);

  if (!t) {
    t = {
      id: draftId,
      name: (teamName || "").trim(),
      leaderPlayerId: player.id,
      leaderName: player.name || "Host",
      leaderEmail: player.email || "",
      members: [player.id],
      roles: { [player.id]: "CEO" },
      invites: [],
      isDraft: true,
      createdAt: new Date().toISOString(),
    };
    game.teams.push(t);
  } else {
    const nextName = (teamName || "").trim();
    if (nextName) t.name = nextName;
    t.isDraft = true;
  }

  games[gameIdx] = game;
  return { games, draftId, team: t };
}

export function getHostTeamFromStorage({
  joinedGameCode,
  currentPlayerId,
  draftTeamId,
}) {
  const code = joinedGameCode;
  const hostId = currentPlayerId;

  if (!code || !hostId) {
    return { games: [], gameIdx: -1, game: null, team: null };
  }

  const games = readGames();
  const gameIdx = games.findIndex(
    (g) => (g.code || "").toUpperCase() === (code || "").toUpperCase()
  );
  if (gameIdx === -1) return { games, gameIdx, game: null, team: null };

  const game = games[gameIdx];
  game.teams = game.teams || [];
  game.players = game.players || [];

  const me = (game.players || []).find((p) => p.playerId === hostId);
  const myTeamId = me?.teamId || null;
  if (myTeamId) {
    const t0 = game.teams.find((t) => t?.id === myTeamId && !t?.isDeleted) || null;
    if (t0) return { games, gameIdx, game, team: t0 };
  }

  if (draftTeamId) {
    const t1 = game.teams.find((t) => t?.id === draftTeamId && !t?.isDeleted) || null;
    if (t1) return { games, gameIdx, game, team: t1 };
  }

  const mine = game.teams.filter((t) => t?.leaderPlayerId === hostId && !t?.isDeleted);
  const nonDraftMine = mine.filter((t) => t?.isDraft === false);
  const draftMine = mine.filter((t) => t?.isDraft);

  const team = pickLatest(nonDraftMine) || pickLatest(draftMine) || null;
  return { games, gameIdx, game, team };
}

export function ensureDraftTeamIdReady({
  joinedGameCode,
  currentPlayer,
  draftTeamId,
  teamName,
}) {
  const nameToUse = (teamName || "").trim();

  if (draftTeamId) {
    try {
      if (nameToUse) {
        const games = readGames();
        const idx = games.findIndex((g) => g.code === joinedGameCode);
        if (idx !== -1) {
          const ensured = ensureDraftTeamInStorage({
            games,
            gameIdx: idx,
            player: currentPlayer,
            draftTeamId,
            teamName: nameToUse,
          });
          writeGames(ensured.games);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return draftTeamId;
  }

  const newId = makeTeamId();

  try {
    const games = readGames();
    const idx = games.findIndex((g) => g.code === joinedGameCode);
    if (idx !== -1) {
      ensureDraftTeamInStorage({
        games,
        gameIdx: idx,
        player: currentPlayer,
        draftTeamId: newId,
        teamName: nameToUse,
      });
      writeGames(games);
    }
  } catch (e) {
    console.error(e);
  }

  return newId;
}

export function removeInviteFromStorageByEmail({
  emailToRemove,
  joinedGameCode,
  currentPlayerId,
  draftTeamId,
}) {
  const email = normalizeEmail(emailToRemove);
  if (!email) return false;

  const { games, gameIdx, game, team } = getHostTeamFromStorage({
    joinedGameCode,
    currentPlayerId,
    draftTeamId,
  });

  if (gameIdx === -1 || !game || !team) return false;

  team.invites = (team.invites || []).filter(
    (inv) => normalizeEmail(inv.email) !== email
  );

  const foundPlayer = (game.players || []).find(
    (p) => normalizeEmail(p.email) === email
  );

  if (foundPlayer) {
    team.members = (team.members || []).filter((id) => id !== foundPlayer.playerId);
    if (team.roles) delete team.roles[foundPlayer.playerId];
    foundPlayer.teamId = null;
  }

  games[gameIdx] = game;
  writeGames(games);
  return true;
}