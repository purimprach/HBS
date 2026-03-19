import { findGameByCode } from "./gameStorage";
import { getDraftKeyForPlayer, safeJSONParse } from "./accountHelpers";

export function loadAccountDraft(currentPlayerId) {
    if (!currentPlayerId) return null;

    const key = getDraftKeyForPlayer(currentPlayerId);
    const draftRaw = localStorage.getItem(key);
    let draft = safeJSONParse(draftRaw, null);

    if (draft?.joinedGame && !draft.joinedGameCode) {
        draft = {
            ...draft,
            joinedGameCode: (draft.joinedGame?.code || "").trim().toUpperCase(),
        };
        delete draft.joinedGame;
        localStorage.setItem(key, JSON.stringify(draft));
    }

    return draft;
}

export function saveAccountDraft(currentPlayerId, draft) {
    if (!currentPlayerId) return false;

    const key = getDraftKeyForPlayer(currentPlayerId);
    localStorage.setItem(key, JSON.stringify(draft));
    return true;
}

export function removeAccountDraft(currentPlayerId) {
    if (!currentPlayerId) return false;

    const key = getDraftKeyForPlayer(currentPlayerId);
    localStorage.removeItem(key);
    return true;
}

export function getActiveGameCode() {
    return (sessionStorage.getItem("hbs_active_game_code_v1") || "")
        .trim()
        .toUpperCase();
}

export function setActiveGameCode(code) {
    sessionStorage.setItem("hbs_active_game_code_v1", (code || "").trim().toUpperCase());
}

export function clearActiveGameCode() {
    sessionStorage.removeItem("hbs_active_game_code_v1");
}

export function getFreshJoinedGame(joinedGameCode) {
    const code = (joinedGameCode || "").trim().toUpperCase();
    if (!code) return null;
    return findGameByCode(code) || null;
}

import { readGames, writeGames } from "./gameStorage";
import { ensureDraftTeamInStorage } from "./accountHostTeamStorage";

export function joinGameAndCreateDraft({
    joinCode,
    currentPlayer,
    teamName,
}) {
    const code = (joinCode || "").trim().toUpperCase();
    if (!code) return { ok: false, error: "INVALID_CODE" };

    const games = readGames();
    const gameIndex = games.findIndex((g) => (g.code || "").toUpperCase() === code);

    if (gameIndex === -1) {
        return { ok: false, error: "GAME_NOT_FOUND" };
    }

    const game = games[gameIndex];
    const player = currentPlayer;

    if (!player?.id) {
        return { ok: false, error: "NO_PLAYER" };
    }

    const modeType = game?.settings?.mode?.type;

    let initialTeamName = teamName || "";
    if (modeType === "single" && !initialTeamName.trim()) {
        initialTeamName = (player?.name || "Player").trim();
    }

    const draftId = `team-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

    const ensured = ensureDraftTeamInStorage({
        games,
        gameIdx: gameIndex,
        player,
        draftTeamId: draftId,
        teamName: initialTeamName,
    });

    const team = ensured.games[gameIndex].teams.find((t) => t.id === draftId);
    if (team) {
        team.removedByAdmin = false;
    }

    writeGames(ensured.games);

    const freshGame = findGameByCode(code);

    return {
        ok: true,
        code,
        freshGame,
        draftTeamId: draftId,
    };
}