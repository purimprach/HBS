export function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function makeTeamId() {
  return `team-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function safeParse(raw, fallback = null) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function isEmailRegistered(email) {
  try {
    const users = JSON.parse(localStorage.getItem("hbs_players") || "[]");
    return users.some(
      (u) => (u.email || "").toLowerCase() === (email || "").toLowerCase()
    );
  } catch {
    return false;
  }
}

export function getInvitedTeamData(inviteView, readGames) {
  if (!inviteView) return null;

  const games = readGames();
  const game = games.find((g) => g.code === inviteView.gameCode);
  if (!game) return null;

  const team = game.teams?.find((x) => x.id === inviteView.teamId) || null;
  if (!team || team.isDeleted) return null;

  return team;
}

export function getMyInviteState({
  currentPlayer,
  pendingInvite,
  acceptedInviteInfo,
  memberView,
  readGames,
  normalizeEmail,
}) {
  const email = normalizeEmail(currentPlayer?.email);
  if (!email) return { accepted: false, waitingHostOk: false };

  const info = pendingInvite || acceptedInviteInfo || memberView;
  if (!info?.gameCode || !info?.teamId) {
    return { accepted: false, waitingHostOk: false };
  }

  const games = readGames();
  const game = games.find(
    (x) => (x.code || "").toUpperCase() === (info.gameCode || "").toUpperCase()
  );
  const team = (game?.teams || []).find((x) => x?.id === info.teamId && !x?.isDeleted);
  if (!team) return { accepted: false, waitingHostOk: false };

  const inv = (team.invites || []).find(
    (x) => normalizeEmail(x.email) === email
  );

  const accepted = inv?.status === "accepted";
  const waitingHostOk = accepted && team.isDraft !== false;

  return { accepted, waitingHostOk };
}

export function getMyAcceptedStatusInTeam({
  currentPlayer,
  acceptedInviteInfo,
  memberView,
  readGames,
  normalizeEmail,
}) {
  const email = normalizeEmail(currentPlayer?.email);
  if (!email) return { accepted: false, waitingHostOk: false };

  const info = acceptedInviteInfo || memberView;
  if (!info?.gameCode || !info?.teamId) {
    return { accepted: false, waitingHostOk: false };
  }

  const games = readGames();
  const game = games.find(
    (x) => (x.code || "").toUpperCase() === (info.gameCode || "").toUpperCase()
  );
  const team = (game?.teams || []).find((x) => x?.id === info.teamId && !x?.isDeleted);
  if (!team) return { accepted: false, waitingHostOk: false };

  const inv = (team.invites || []).find(
    (x) => normalizeEmail(x.email) === email
  );

  const accepted = inv?.status === "accepted";
  const waitingHostOk = accepted && team.isDraft !== false;

  return { accepted, waitingHostOk };
}