export function getDraftKeyForPlayer(playerId) {
  return `hbs_account_draft_v1_${playerId || "unknown"}`;
}

export function getModeLabelEN(modeObj) {
  if (!modeObj) return "";
  const type = modeObj.type;

  if (type === "single") return "Single";

  if (type === "team") {
    const n = modeObj.teamSize;
    return n ? `Team (${n} people)` : "Team";
  }

  if (type === "other") {
    const min = modeObj.minTeams;
    const max = modeObj.maxTeams;

    if (min != null && max != null) return `Team (${min}-${max} people)`;
    if (max != null) return `Team (1-${max} people)`;

    return "Team";
  }

  return "";
}

export function safeJSONParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function makeTeamId() {
  return `team-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function getTeamLimitFromMode(modeObj) {
  const type = modeObj?.type;

  if (type === "team") {
    const teamSize = clamp(parseInt(modeObj?.teamSize || 4, 10) || 4, 2, 4);
    return {
      type,
      minTotal: teamSize,
      maxTotal: teamSize,
      startTotal: teamSize,
    };
  }

  if (type === "other") {
    const minTeams = clamp(parseInt(modeObj?.minTeams ?? 1, 10) || 1, 1, 4);
    const maxTeams = clamp(
      parseInt(modeObj?.maxTeams ?? 4, 10) || 4,
      minTeams,
      4
    );
    return {
      type,
      minTotal: minTeams,
      maxTotal: maxTeams,
      startTotal: minTeams,
    };
  }

  return { type: "single", minTotal: 1, maxTotal: 1, startTotal: 1 };
}

export function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  const e = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}