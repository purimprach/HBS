import { readGames, writeGames } from "./gameStorage";
import { normalizeEmail } from "./accountTeamActions";

export function markRoleNoticeSeen(notice) {
  if (!notice) return false;

  const games = readGames();
  const g = games.find((x) => x.code === notice.gameCode);
  if (!g) return false;

  const t = (g.teams || []).find((x) => x.id === notice.teamId);
  if (!t) return false;

  const inv = (t.invites || []).find(
    (x) =>
      normalizeEmail(x.email) === normalizeEmail(notice.email) &&
      x.noticeType === "role_changed"
  );
  if (!inv) return false;

  inv.noticeSeen = true;
  writeGames(games);
  return true;
}

export function markHostNoticeSeen(notice) {
  if (!notice?.gameCode || !notice?.teamId || !notice?.email) return false;

  const games = readGames();
  const g = games.find((x) => x.code === notice.gameCode);
  if (!g) return false;

  const t = (g.teams || []).find((x) => x.id === notice.teamId);
  if (!t) return false;

  const inv = (t.invites || []).find(
    (x) =>
      normalizeEmail(x.email) === normalizeEmail(notice.email) &&
      (x.status === "left" || x.status === "denied")
  );
  if (!inv) return false;

  inv.hostNoticeSeen = true;
  writeGames(games);
  return true;
}

export function markTeamUpdateSeen(notice) {
  if (!notice) return false;

  const games = readGames();
  const g = games.find((x) => x.code === notice.gameCode);
  if (!g) return false;

  const t = (g.teams || []).find((x) => x.id === notice.teamId);
  if (!t) return false;

  const inv = (t.invites || []).find(
    (x) =>
      normalizeEmail(x.email) === normalizeEmail(notice.email) &&
      ["member_removed", "member_left"].includes(x.teamUpdateType)
  );
  if (!inv) return false;

  inv.teamUpdateSeen = true;
  writeGames(games);
  return true;
}

export function markRemovedNoticeSeen(notice) {
  if (!notice?.id || !notice?.gameCode) return false;

  const games = readGames();
  const g = games.find((x) => x.code === notice.gameCode);
  if (!g) return false;

  g.systemNotices = g.systemNotices || [];
  const n = g.systemNotices.find((x) => x.id === notice.id);
  if (!n) return false;

  n.seen = true;
  writeGames(games);
  return true;
}