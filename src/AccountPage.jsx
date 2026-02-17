import React, { useState, useEffect, useMemo } from "react";
import "./AccountPage.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  LogOut,
  Globe,
  User,
  Clock,
  ChevronRight,
  Megaphone,
  Building2,
  Share2,
  Edit3,
  ChevronDown,
  PlusCircle,
  Trash2,
} from "lucide-react";

/* =========================
   LocalStorage Keys
   ========================= */
const GAMES_KEY = "hbs_games";
const PLAYER_SESSION_KEY = "hbs_current_player"; // { id, name, email }
const ACCOUNT_DRAFT_KEY_BASE = "hbs_account_draft_v1";
const USERS_KEY = "hbs_players";
// แนะนำให้ RegisterPage เซฟเป็น array เช่น [{ id, name, email }]

function getDraftKeyForPlayer(playerId) {
  return `${ACCOUNT_DRAFT_KEY_BASE}_${playerId || "unknown"}`;
}

/* =========================
   Helpers
   ========================= */
  function getModeLabelEN(modeObj) {
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

      if (min != null && max != null)
        return `Team (${min}-${max} people)`;

      if (max != null)
        return `Team (1-${max} people)`;

      return "Team";
    }

    return "";
  }

function safeJSONParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function makeTeamId() {
  return `team-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * คำนวณ limit จาก mode
 * - team: min=max=teamSize (2-4)
 * - other: min=minTeams, max=maxTeams (2-4)
 */
function getTeamLimitFromMode(modeObj) {
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

function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

function isValidEmail(email) {
  const e = normalizeEmail(email);
  // แบบง่าย+พอใช้งานจริง (กัน "888" / "aaa@" / "a@b" ฯลฯ)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

function readGames() {
  return safeJSONParse(localStorage.getItem(GAMES_KEY), []);
}

function findGameByCode(code) {
  const c = (code || "").trim().toUpperCase();
  if (!c) return null;
  const games = readGames();
  return games.find((g) => (g.code || "").toUpperCase() === c) || null;
}

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const parsed = safeJSONParse(raw, []);

  // ✅ ถ้าเป็น array ใช้ได้เลย
  if (Array.isArray(parsed)) return parsed;

  // ✅ ถ้าเป็น object (เช่น {users:[...]})
  if (parsed && Array.isArray(parsed.users)) return parsed.users;

  // ✅ ถ้าเป็น map เช่น {"email@x.com": {...}}
  if (parsed && typeof parsed === "object") return Object.values(parsed);

  return [];
}

function isEmailRegistered(email) {
  const e = normalizeEmail(email);
  if (!e) return false;

  const users = readUsers();
  console.log("CHECK REGISTER:", e, "usersCount:", users.length, "sample:", users[0]);

  return users.some((u) => normalizeEmail(u?.email) === e);
}

function writeGames(games) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

function removeInvitesByHostDraft(games, hostPlayerId, gameCode, draftTeamId) {
  if (!hostPlayerId || !gameCode) return games;

  const idx = games.findIndex((g) => g.code === gameCode);
  if (idx === -1) return games;

  const game = games[idx];
  game.teams = game.teams || [];

  // ถ้ามี draftTeamId ให้ลบทีมนี้ทิ้งเลย (เพราะยังไม่กด OK จริง)
  if (draftTeamId) {
    game.teams = game.teams.filter((t) => t.id !== draftTeamId);
  } else {
    // fallback: ลบทีมที่ leaderPlayerId ตรง (กันกรณีไม่มี id)
    game.teams = game.teams.filter((t) => t.leaderPlayerId !== hostPlayerId);
  }

  // reset ผู้เล่นในเกมนี้ ให้ยังอยู่ใน players ได้ แต่ไม่ผูกทีม
  game.players = (game.players || []).map((p) =>
    p.playerId === hostPlayerId ? { ...p, teamId: null } : p
  );

  games[idx] = game;
  return games;
}

function deleteTeamAndNotifyMembers(games, hostPlayerId, gameCode, teamId, hostName) {
  if (!hostPlayerId || !gameCode || !teamId) return games;

  const code = (gameCode || "").trim().toUpperCase();
  const gameIdx = games.findIndex(
    (g) => (g.code || "").trim().toUpperCase() === code
  );
  if (gameIdx === -1) return games;

  const game = games[gameIdx];
  game.teams = game.teams || [];
  game.players = game.players || [];

  const team = game.teams.find((t) => t.id === teamId);
  if (!team) return games;

  // กันคนอื่นลบทีมที่ไม่ใช่ของตัวเอง
  if (team.leaderPlayerId !== hostPlayerId) return games;

  const teamNm = team.name || "your team";
  const gameNm = game.name || "Hotel Business Simulator";
  const gameCd = game.code || code;
  const byName = hostName || team.leaderName || "Host";

  // ✅ A) Soft delete: ทำเครื่องหมายว่าทีมถูกลบ (แต่ "ยังเก็บทีมไว้" เพื่อให้สแกน notice ได้)
  team.isDeleted = true;
  team.deletedAt = new Date().toISOString();
  team.deletedByName = byName;
  team.deletedByRole = "CEO";

  // ✅ B) แจ้งทุกคนใน invites (pending/accepted) -> removed
  team.invites = (team.invites || []).map((inv) => {
    const st = inv.status;
    if (st === "pending" || st === "accepted") {
      return {
        ...inv,
        status: "removed",
        removedReason: "delete_team",
        removedAt: new Date().toISOString(),
        removedByName: byName,
        removedByRole: "CEO",
        teamName: inv.teamName || teamNm,
        removedMessage:
          `CEO: ${byName} has deleted the team "${teamNm}"\n` +
          `from the game "${gameNm}" (Code: ${gameCd}).\n\n` +
          `All team members have been removed.`,
        noticeSeen: false,
      };
    }
    return inv;
  });

  // ✅ C) รีเซ็ตผู้เล่นที่อยู่ทีมนี้ให้หลุดทีม
  game.players = game.players.map((p) =>
    p.teamId === teamId ? { ...p, teamId: null } : p
  );

  games[gameIdx] = game;
  return games;
}

function pushRoleChangeNoticeToStorage({
  joinedGame,
  currentPlayer,
  draftTeamId,
  memberEmail,
  oldRole,
  newRole,
}) {
  const gameCode = joinedGame?.code;
  if (!gameCode || !draftTeamId || !memberEmail) return;

  const games = readGames();
  const gameIdx = games.findIndex((g) => g.code === gameCode);
  if (gameIdx === -1) return;

  const game = games[gameIdx];
  game.teams = game.teams || [];
  game.players = game.players || [];

  const team = game.teams.find((t) => t.id === draftTeamId);
  if (!team) return;

  team.invites = team.invites || [];

  const emailNorm = normalizeEmail(memberEmail);

  // หา invite ของคนนี้ (ต้อง accepted ถึงจะส่ง notice)
  const inv = team.invites.find((x) => normalizeEmail(x.email) === emailNorm);
  if (!inv || inv.status !== "accepted") return;

  inv.noticeType = "role_changed";
  inv.noticeSeen = false;

  inv.oldRole = oldRole || inv.oldRole || "-";
  inv.newRole = newRole || "-";

  inv.roleChangedAt = new Date().toISOString();
  inv.roleChangedByName = currentPlayer?.name || "Host";
  inv.roleChangedByRole = "CEO";

  games[gameIdx] = game;
  writeGames(games);
}

function updateInviteRoleInStorage({
  gameCode,
  teamId,
  memberEmail,
  newRole,
}) {
  if (!gameCode || !teamId || !memberEmail) return;

  const games = readGames();
  const gi = games.findIndex((g) => g.code === gameCode);
  if (gi === -1) return;

  const game = games[gi];
  const team = (game.teams || []).find((t) => t.id === teamId);
  if (!team) return;

  const emailNorm = normalizeEmail(memberEmail);
  const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === emailNorm);
  if (!inv) return;

  // ✅ เปลี่ยน role ใน invites ให้ฝั่งผู้เล่นเห็นทันที
  inv.role = newRole;

  games[gi] = game;
  writeGames(games);
}


function AccountPage() {
  const navigate = useNavigate();
  const [storageTick, setStorageTick] = useState(0);
  const [showOkModal, setShowOkModal] = useState(false);
  const [hostNotice, setHostNotice] = useState(null);
  const [roleNotice, setRoleNotice] = useState(null);
  const [teamUpdateNotice, setTeamUpdateNotice] = useState(null);
  
// { title, oldRole, newRole, at, byName, byRole, gameCode, teamId, email }

    // =========================
  // Invite / Register Modal
  // =========================
  const REGISTER_ROUTE = "/signup";

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState(null);

  // ✅ Remove Confirm Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); 
  const [showLeaveModal, setShowLeaveModal] = useState(false);
function openLeaveConfirm() {
  setShowLeaveModal(true);
}
function closeLeaveConfirm() {
  setShowLeaveModal(false);
}
function confirmLeaveTeam() {
  closeLeaveConfirm();
  leaveTeamAndNotifyHost(); // leave จริง + broadcast
}
  
function openRemoveConfirm(index) {
  const email = normalizeEmail(teamMembers[index]?.email);
  if (!email) return;

  setRemoveTarget({ index, email });
  setShowRemoveModal(true);
}

function closeRemoveConfirm() {
  setShowRemoveModal(false);
  setRemoveTarget(null);
}
function confirmRemoveAccepted() {
  if (!removeTarget) return;
  // ✅ เรียกลบจริงด้วย index เดิม
  handleRemoveAcceptedMember(removeTarget.index);
  closeRemoveConfirm();
}

function scanHostNotice() {
  if (!currentPlayer?.id || !joinedGame?.code) return null;

  const games = readGames();
  const game = games.find((g) => g.code === joinedGame.code);
  if (!game) return null;

  for (const t of (game.teams || [])) {
    // เฉพาะทีมที่เราเป็น host
    if (t.leaderPlayerId !== currentPlayer.id) continue;

    const inv = (t.invites || []).find(
      (x) => x.status === "left" && !x.hostNoticeSeen
    );

    if (inv) {
      inv.hostNoticeSeen = true;
      writeGames(games);
      setStorageTick((s) => s + 1);

      return {
        title: "Team Update",
        message: inv.hostNoticeMessage || `${inv.email} left the team.`,
      };
    }
  }
  return null;
}

  async function sendInviteEmailAPI(payload) {
  // payload: { toEmail, subject, text, inviteLink, registerLink, ... }
  const res = await fetch("/api/send-invite-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = "Failed to send email";
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

  function ensureDraftTeamIdReady(currentName) {
    const nameToUse = (currentName || teamName || "").trim() || "Draft Team";

    // ถ้ามีแล้ว -> แค่อัปเดตชื่อใน storage ให้ล่าสุด
    if (draftTeamId) {
      try {
        const games = readGames();
        const idx = games.findIndex((g) => g.code === joinedGame?.code);
        if (idx !== -1) {
          const ensured = ensureDraftTeamInStorage(
            games,
            idx,
            currentPlayer,
            joinedGame,
            draftTeamId,
            nameToUse
          );
          writeGamesAndRefresh(ensured.games);
        }
      } catch (e) {
        console.error(e);
      }
      return draftTeamId;
    }

    // ยังไม่มี -> สร้าง id + สร้าง draft team ลง storage
    const newId = makeTeamId();
    setDraftTeamId(newId);

    try {
      const games = readGames();
      const idx = games.findIndex((g) => g.code === joinedGame?.code);
      if (idx !== -1) {
        const ensured = ensureDraftTeamInStorage(
          games,
          idx,
          currentPlayer,
          joinedGame,
          newId,
          nameToUse
        );
        writeGamesAndRefresh(ensured.games);
      }
    } catch (e) {
      console.error(e);
    }

    return newId;
  }

  function writeGamesAndRefresh(games) {
  writeGames(games);
  setStorageTick((t) => t + 1);
}

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

function ensureDraftTeamInStorage(games, gameIdx, player, joinedGame, draftTeamId, teamName) {
  const game = games[gameIdx];
  game.teams = game.teams || [];

  const draftId = draftTeamId || makeTeamId();

  // หา draft team เดิม
  let t = game.teams.find((x) => x.id === draftId);

  // ถ้ายังไม่มี -> สร้าง draft team
  if (!t) {
    t = {
      id: draftId,
      name: teamName?.trim() || "Draft Team",
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
    // update ชื่อทีมเผื่อเปลี่ยน
    t.name = teamName?.trim() || t.name;
    t.isDraft = true;
  }

  games[gameIdx] = game;
  return { games, draftId, team: t };
}


  // -------------------------
  // Session Player
  // -------------------------
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    const p = safeJSONParse(localStorage.getItem(PLAYER_SESSION_KEY), null);

    // ถ้ายังไม่ login จริง ให้เดโม่ไว้ก่อน
    if (!p) {
      setCurrentPlayer({
        id: "demo-player",
        name: "Jane",
        email: "janeza@gmail.com",
      });
      return;
    }
    setCurrentPlayer(p);
  }, []);

  const MY_EMAIL = useMemo(
    () => currentPlayer?.email || "you@email.com",
    [currentPlayer]
  );

  // -------------------------
  // Join Game States
  // -------------------------
  const [joinCode, setJoinCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [joinedGame, setJoinedGame] = useState(null);

  // -------------------------
  // Join Team (Invite inbox)
  // -------------------------
  const [pendingInvite, setPendingInvite] = useState(null);
  const [acceptedInviteInfo, setAcceptedInviteInfo] = useState(null);
  const [isAcceptedInvite, setIsAcceptedInvite] = useState(false);
  
// { gameCode, gameName, teamId, teamName, hostName, hostEmail, role, invitedAt, adminDisplay }

  // { gameCode, gameName, teamId, teamName, teamNumber, hostName, hostEmail, role, invitedAt }
  const [systemNotice, setSystemNotice] = useState(null);
// { title, message, at }

  const scanSystemNotice = () => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      for (const t of (g.teams || [])) {
        const inv = (t.invites || []).find(
          (x) => normalizeEmail(x.email) === email && x.status === "removed" && !x.noticeSeen
        );

        if (inv) {
          return {
            title: inv.removedReason === "delete_team" ? "Team Deleted" : "Removed from Team",
            reason: inv.removedReason || "removed",
            gameCode: g.code,
            teamId: t.id,
            email,
            teamName: inv.teamName || t.name || "your team",
            removedBy: inv.removedByName || "host",
            message: inv.removedMessage || "",
            at: inv.removedAt,
          };
        }
      }
    }
    return null;
  };

  const scanRoleChangeNotice = () => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      for (const t of (g.teams || [])) {
        const inv = (t.invites || []).find(
          (x) =>
            normalizeEmail(x.email) === email &&
            x.status === "accepted" &&
            x.noticeType === "role_changed" &&
            x.noticeSeen === false
        );

        if (inv) {
          return {
            title: "Your role was changed.",
            oldRole: inv.oldRole || "-",
            newRole: inv.newRole || "-",
            at: inv.roleChangedAt,
            byName: inv.roleChangedByName || "Host",
            byRole: inv.roleChangedByRole || "CEO",
            gameCode: g.code,
            teamId: t.id,
            email,
          };
        }
      }
    }

    return null;
  };

  const scanTeamUpdateNotice = () => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      for (const t of (g.teams || [])) {
        const inv = (t.invites || []).find(
          (x) =>
            normalizeEmail(x.email) === email &&
            x.status === "accepted" &&
            ["member_removed", "member_left"].includes(x.teamUpdateType) &&
            x.teamUpdateSeen === false
        );

        if (inv) {
          return {
            title: "Team Update",
            message: inv.teamUpdateMessage || "Your team was updated.",
            at: inv.teamUpdateAt,
            gameCode: g.code,
            teamId: t.id,
            email,
          };
        }
      }
    }

    return null;
  };

  function markRoleNoticeSeen(notice) {
    if (!notice) return;

    const games = readGames();
    const g = games.find((x) => x.code === notice.gameCode);
    if (!g) return;

    const t = (g.teams || []).find((x) => x.id === notice.teamId);
    if (!t) return;

    const inv = (t.invites || []).find(
      (x) =>
        normalizeEmail(x.email) === normalizeEmail(notice.email) &&
        x.noticeType === "role_changed"
    );
    if (!inv) return;

    inv.noticeSeen = true;
    writeGamesAndRefresh(games);
  }

  function markTeamUpdateSeen(notice) {
    if (!notice) return;

    const games = readGames();
    const g = games.find((x) => x.code === notice.gameCode);
    if (!g) return;

    const t = (g.teams || []).find((x) => x.id === notice.teamId);
    if (!t) return;

    const inv = (t.invites || []).find(
      (x) =>
        normalizeEmail(x.email) === normalizeEmail(notice.email) &&
        ["member_removed", "member_left"].includes(x.teamUpdateType)
    );
    if (!inv) return;

    inv.teamUpdateSeen = true;
    writeGamesAndRefresh(games);
  }

  // ✅ เพิ่มฟังก์ชันนี้ใต้ scanSystemNotice
  function markRemovedNoticeSeen(notice) {
    if (!notice) return;

    const games = readGames();
    const g = games.find((x) => x.code === notice.gameCode);
    if (!g) return;

    const t = (g.teams || []).find((x) => x.id === notice.teamId);
    if (!t) return;

    const inv = (t.invites || []).find(
      (x) =>
        normalizeEmail(x.email) === normalizeEmail(notice.email) &&
        x.status === "removed"
    );
    if (!inv) return;

    inv.noticeSeen = true;
    writeGamesAndRefresh(games);
  }

  useEffect(() => {
  if (!currentPlayer?.email) return;

  const rn = scanRoleChangeNotice();
  const sn = scanSystemNotice();
  const hn = scanHostNotice();
  const tn = scanTeamUpdateNotice();

  if (rn) {
    setSystemNotice(null);
    setHostNotice(null);
    setTeamUpdateNotice(null);
    setRoleNotice(rn);
  } else if (sn) {
    setRoleNotice(null);
    setHostNotice(null);
    setTeamUpdateNotice(null);
    setSystemNotice(sn);
  } else if (tn) {
    setRoleNotice(null);
    setSystemNotice(null);
    setHostNotice(null);
    setTeamUpdateNotice(tn);
  } else if (hn) {
    setRoleNotice(null);
    setSystemNotice(null);
    setTeamUpdateNotice(null);
    setHostNotice(hn);
  }

  setPendingInvite(scanPendingInvite());
}, [currentPlayer, storageTick]);

// ✅ RESET PLAYER STATE เมื่อโดนลบทีม
useEffect(() => {
  if (!systemNotice) return;

  // ล้าง Join Team
  setPendingInvite(null);
  setAcceptedInviteInfo(null);
  setIsAcceptedInvite(false);

  // ล้าง draft team setup
  if (currentPlayer?.id) {
    localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
  }

  // refresh UI
  setStorageTick((t) => t + 1);
}, [systemNotice, currentPlayer]);

// ============================
// ✅ GUARD: ถ้า admin ลบเกมแล้ว -> reset ฝั่งผู้เล่น
// ============================
  useEffect(() => {
    if (!isJoined) return;

    const code = (joinedGame?.code || joinCode || "").trim().toUpperCase();
    if (!code) return;

    const alive = findGameByCode(code);

    if (!alive) {
      forceResetBecauseGameMissing(code);
      return;
    }

    setJoinedGame(alive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTick, isJoined, joinedGame?.code, joinCode]);

  // สแกนหา invite ที่ pending ของอีเมลนี้
  const scanPendingInvite = () => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();
    let found = null;

    for (const g of games) {
      for (let i = 0; i < (g.teams || []).length; i++) {
        const t = g.teams[i];
        if (t.isDeleted) continue;
        const inv = (t.invites || []).find(
          (x) => normalizeEmail(x.email) === email && x.status === "pending"
        );

        if (inv) {
          const adminDisplay =
            (g?.ownerAdminUsername || "").trim() ||
            (g?.ownerAdminName || "").trim() ||
            (g?.adminUsername || "").trim() ||
            (g?.adminName || "").trim() ||
            (g?.createdByUsername || "").trim() ||
            (g?.createdByName || "").trim() ||
            "-";

          found = {
            gameCode: g.code,
            gameName: g.name,
            teamId: t.id,
            teamName: t.name,
            teamNumber: i + 1,
            hostName: t.leaderName || "Host",
            hostEmail: t.leaderEmail || "",
            role: inv.role || "",
            invitedAt: inv.invitedAt,

            // ✅ เพิ่ม admin ตรงนี้
            adminDisplay,
          };
          break;
        }
      }
      if (found) break;
    }
    return found;
  };

  // ถ้าทดสอบ 2 แท็บ ให้ sync ทันทีเมื่อ localStorage เปลี่ยน
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === GAMES_KEY) {
        setPendingInvite(scanPendingInvite());
        setSystemNotice(scanSystemNotice());
        setHostNotice(scanHostNotice());
      }

      // ✅ สำคัญ: ถ้า USERS_KEY เปลี่ยน (สมัครใหม่) -> เด้ง storageTick เพื่อให้ host UI เปลี่ยนทันที (กรณีทำใน "อีกแท็บ")
      if (e.key === USERS_KEY) {
        setStorageTick((t) => t + 1);
      }

      if (e.key && e.key.startsWith(ACCOUNT_DRAFT_KEY_BASE)) {
        // optional
      }
    };

    // ✅ สำคัญ: ถ้ากลับมาหน้าเดิมหลังไป Register (แท็บเดียวกัน) -> storage event จะไม่ยิง
    const onFocus = () => setStorageTick((t) => t + 1);
    const onVisible = () => {
      if (!document.hidden) setStorageTick((t) => t + 1);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer]);

  // -------------------------
  // Announcement UI
  // -------------------------
  const [isExpanded, setIsExpanded] = useState(false);

  // -------------------------
  // Team Setup UI
  // -------------------------
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isTeamNameLocked, setIsTeamNameLocked] = useState(false); // ✅ NEW
  const [draftTeamId, setDraftTeamId] = useState(null); // ✅ เพิ่มบรรทัดนี้

  // Roles
  const HOST_ROLE = "CEO";
  const ROLES = useMemo(() => ["CEO", "Finance", "Marketing", "HR"], []);
  const MEMBER_ROLES = useMemo(() => ["Finance", "Marketing", "HR"], []); // ✅ ไม่มี CEO


  // Team setup state
  const [teamRoles, setTeamRoles] = useState({ you: "CEO" });
  const [teamMembers, setTeamMembers] = useState([]); // [{key, email, status}]

  // =========================
  // 🔒 Lock Host = CEO + Prevent Members from being CEO
  // =========================
  useEffect(() => {
    setTeamRoles((prev) => {
      if (!prev) return prev;

      let changed = false;
      const next = { ...prev };

      // 🔒 Host ต้องเป็น CEO เสมอ
      if (next.you !== HOST_ROLE) {
        next.you = HOST_ROLE;
        changed = true;
      }

      // 🚫 สมาชิกคนอื่นห้ามเป็น CEO
      Object.keys(next).forEach((k) => {
        if (k !== "you" && next[k] === "CEO") {
          next[k] = "";
          changed = true;
        }
      });

      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamMembers.length, HOST_ROLE]);

    // =========================
  // Auto-switch unregistered -> invite after register
  // =========================
  useEffect(() => {
    // ถ้ามีคนที่เคย unregistered แล้วตอนนี้สมัครแล้ว -> กลับมาให้กด Invite ได้
    setTeamMembers((prev) =>
      prev.map((m) => {
        const email = normalizeEmail(m.email);
        if (!email) return m;

        const registered = isEmailRegistered(email);
        if (m.status === "unregistered" && registered) {
          return { ...m, status: "typing" }; // กลับมาให้ปุ่ม Invite ได้
        }
        return m;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTick, isJoined, joinedGame, draftTeamId]);

  // ✅ NEW: รีเช็คตอนกลับมาหน้า Account (แท็บเดียวกัน / ปิดโมดอลแล้ว)
// เพราะ storage event จะไม่ยิงในแท็บเดียวกันเสมอ
  useEffect(() => {
    if (!showInviteModal) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          const email = normalizeEmail(m.email);
          if (!email) return m;

          if (m.status === "unregistered" && isEmailRegistered(email)) {
            return { ...m, status: "typing" };
          }
          return m;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTick, showInviteModal]);

  // ✅ NEW: Restore draft after login (keep this page state)
  useEffect(() => {
    if (!currentPlayer?.id) return;

    const key = getDraftKeyForPlayer(currentPlayer.id);
    const draftRaw = localStorage.getItem(key);
    const draft = safeJSONParse(draftRaw, null);
    if (!draft) return;

    setJoinCode(draft.joinCode || "");
    setIsJoined(!!draft.isJoined);
    setJoinedGame(draft.joinedGame || null);
    setShowTeamSetup(!!draft.showTeamSetup);

    setTeamName(draft.teamName || "");
    setTeamMembers(draft.teamMembers || []);
    setTeamRoles(draft.teamRoles || { you: "CEO" });
    setIsTeamNameLocked(!!draft.isTeamNameLocked);
    setDraftTeamId(draft.draftTeamId || null);

  }, [currentPlayer]);


  // ✅ NEW: Auto-save draft whenever state changes
  useEffect(() => {
    if (!currentPlayer?.id) return;

    const key = getDraftKeyForPlayer(currentPlayer.id);

    const draft = {
      joinCode,
      isJoined,
      joinedGame,
      showTeamSetup,
      teamName,
      isTeamNameLocked,
      teamMembers,
      teamRoles,
      draftTeamId,

    };

    localStorage.setItem(key, JSON.stringify(draft));
  }, [
    currentPlayer,
    joinCode,
    isJoined,
    joinedGame,
    showTeamSetup,
    teamName,
    isTeamNameLocked,
    teamMembers,
    teamRoles,
    draftTeamId,

  ]);

  // ✅ Sync ชื่อทีมลง storage ทันที (draft team) เพื่อให้ Admin เห็นใน Lobby
  useEffect(() => {
    if (!isJoined) return;
    if (!joinedGame?.code) return;

    const name = (teamName || "").trim();
    if (!name) return;

    // ต้องมี draftTeamId ก่อน
    const teamId = draftTeamId;
    if (!teamId) return;

    try {
      const games = readGames();
      const gameIdx = games.findIndex((g) => g.code === joinedGame.code);
      if (gameIdx === -1) return;

      const game = games[gameIdx];
      game.teams = game.teams || [];

      const t = game.teams.find((x) => x.id === teamId);
      if (!t) return;

      // อัปเดตเฉพาะตอนชื่อเปลี่ยนจริง
      if ((t.name || "").trim() !== name) {
        t.name = name;
        t.isDraft = true; // ยังไม่พร้อมจนกด OK
        t.updatedAt = new Date().toISOString();

        games[gameIdx] = game;
        writeGames(games);

        // ถ้าอยากให้ UI หน้านี้รีเฟรชด้วย
        setStorageTick((s) => s + 1);
      }
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName, isJoined, joinedGame?.code, draftTeamId]);

  // รีเซ็ต Team Setup ตอนเปิด (ยึดตาม mode ของเกมที่ join)
  useEffect(() => {
    if (!showTeamSetup) return;

    const modeObj = joinedGame?.settings?.mode;
    const { type, startTotal } = getTeamLimitFromMode(modeObj);

    // ✅ init เฉพาะตอนยังไม่มีสมาชิก (อย่าไปล้าง teamName)
    if (teamMembers.length === 0) {
      if (type === "single") {
        setTeamMembers([]);
        setTeamRoles({ you: "CEO" });
        return;
      }

      const otherCount = Math.max(0, startTotal - 1);
      const keys = ["member2", "member3", "member4"];

      const members = keys.slice(0, otherCount).map((k) => ({
        key: k,
        email: "",
        status: "idle",
      }));

      setTeamMembers(members);

      const rolesInit = { you: "CEO" };
      members.forEach((m) => (rolesInit[m.key] = ""));
      setTeamRoles(rolesInit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTeamSetup, joinedGame]);

  // -------------------------
  // Helpers: find host team in storage
  // -------------------------
  const getHostTeamFromStorage = () => {
    const code = joinedGame?.code;
    const hostId = currentPlayer?.id;
    if (!code || !hostId)
      return { games: [], gameIdx: -1, game: null, team: null };

    const games = readGames();
    const gameIdx = games.findIndex((g) => g.code === code);
    if (gameIdx === -1)
      return { games, gameIdx, game: null, team: null };

    const game = games[gameIdx];
    game.teams = game.teams || [];

    // ✅ 1) หา draft team จาก draftTeamId ก่อน
    let team = null;
    if (draftTeamId) {
      team = game.teams.find((t) => t.id === draftTeamId) || null;
    }

    // ✅ 2) fallback หา team ที่ host เป็น leader
    if (!team) {
      team =
        game.teams.find((t) => t.leaderPlayerId === hostId) || null;
    }

    return { games, gameIdx, game, team };
  };

  const isHost = useMemo(() => {
    if (!isJoined || !joinedGame || !currentPlayer?.id) return false;
    const { team } = getHostTeamFromStorage();
    return !!team && team.leaderPlayerId === currentPlayer.id;
  }, [isJoined, joinedGame, currentPlayer, storageTick, draftTeamId]);

  function leaveTeamAndNotifyHost() {
    const email = normalizeEmail(currentPlayer?.email);
    const pid = currentPlayer?.id;
    if (!email || !pid) return;

    // ✅ สำคัญ: หลัง Accept ผู้เล่นอาจ isJoined=false แต่มี inviteView อยู่
    const gameCode = (joinedGame?.code || inviteView?.gameCode || "").trim().toUpperCase();
    if (!gameCode) return;

    const games = readGames();
    const gameIdx = games.findIndex((g) => (g.code || "").trim().toUpperCase() === gameCode);
    if (gameIdx === -1) return;

    const game = games[gameIdx];
    game.players = game.players || [];
    game.teams = game.teams || [];

    // หา player ในเกม
    const me = game.players.find((p) => p.playerId === pid);
    const myTeamId = me?.teamId;
    if (!myTeamId) return;

    const team = game.teams.find((t) => t.id === myTeamId);
    if (!team) return;

    // 🚫 กัน host กด leave
    if (team.leaderPlayerId === pid) {
      alert("Host cannot leave. Please use Delete Team.");
      return;
    }

    const teamNm = team.name || "your team";
    const gameNm = game.name || "Hotel Business Simulator";

    // 1) หลุดทีมใน players
    if (me) me.teamId = null;

    // 2) เอาออกจาก members/roles
    team.members = (team.members || []).filter((id) => id !== pid);
    if (team.roles) delete team.roles[pid];

    // 3) mark invite เป็น left เพื่อให้ host รับรู้
    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === email);
    if (inv) {
      inv.status = "left";
      inv.leftAt = new Date().toISOString();
      inv.leftByEmail = email;

      inv.hostNoticeSeen = false;
      inv.hostNoticeMessage =
        `${email} has left the team "${teamNm}" in game "${gameNm}".`;
    }

    // ✅ 4) BROADCAST ไปยังผู้เล่น accepted คนอื่น ๆ
    (team.invites || []).forEach((x) => {
      const xEmail = normalizeEmail(x.email);
      if (!xEmail) return;

      // แจ้งเฉพาะคนที่ accepted และไม่ใช่คนที่กดออก
      if (x.status === "accepted" && xEmail !== email) {
        x.teamUpdateType = "member_left";
        x.teamUpdateSeen = false;
        x.teamUpdateAt = new Date().toISOString();

        x.teamUpdateMessage =
          `Player: ${email} has left the team "${teamNm}".`;
      }
    });

    games[gameIdx] = game;
    writeGamesAndRefresh(games);

    // ✅ 5) reset state ฝั่งตัวเอง กลับสภาพก่อน join
    setIsJoined(false);
    setJoinedGame(null);
    setShowTeamSetup(false);
    setJoinCode("");
    setTeamName("");
    setTeamMembers([]);
    setTeamRoles({ you: "CEO" });
    setDraftTeamId(null);
    setIsTeamNameLocked(false);

    // ✅ สำคัญ: เคลียร์โหมด accepted view ด้วย
    setPendingInvite(null);
    setAcceptedInviteInfo(null);
    setIsAcceptedInvite(false);

    // ล้าง draft กัน restore กลับมา
    if (currentPlayer?.id) {
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
    }
  }

  function removeInviteFromStorageByEmail(emailToRemove) {
    const email = normalizeEmail(emailToRemove);
    if (!email) return;

    let { games, gameIdx, game, team } = getHostTeamFromStorage();
    if (gameIdx === -1 || !game || !team) return;

    // 1) ลบ invite ของอีเมลนี้ออกจากทีม
    team.invites = (team.invites || []).filter(
      (inv) => normalizeEmail(inv.email) !== email
    );

    // 2) ถ้าคนนี้เคย accepted แล้วมี player ในเกม -> ลบออกจาก members/roles และ reset teamId
    const foundPlayer = (game.players || []).find(
      (p) => normalizeEmail(p.email) === email
    );

    if (foundPlayer) {
      team.members = (team.members || []).filter((id) => id !== foundPlayer.playerId);

      if (team.roles) delete team.roles[foundPlayer.playerId];

      // draft phase: ให้หลุดทีม
      foundPlayer.teamId = null;
    }

    games[gameIdx] = game;
    writeGamesAndRefresh(games); // ✅ สำคัญ: ให้ acceptedCount/okLabel รีเรนเดอร์
  }

  const getInviteStatusFromStorage = (email) => {
    const e = normalizeEmail(email);
    if (!e) return null;

    const { team } = getHostTeamFromStorage();
    if (!team) return null;

    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === e);
    return inv?.status || null; // pending/accepted/denied
  };

  function getReservedRolesFromStorage() {
    const { team } = getHostTeamFromStorage();
    if (!team) return new Map(); // emailNorm -> role

    const map = new Map();

    (team.invites || []).forEach((inv) => {
      const st = inv?.status;

      // ✅ ล็อคเฉพาะ waiting/pending เท่านั้น
      if (st !== "pending") return;

      const email = normalizeEmail(inv.email);
      const role = (inv.role || "").trim();
      if (!email || !role) return;

      map.set(email, role);
    });

    return map;
  }

  function updateInviteRoleInStorageByEmail(memberEmail, newRole) {
    const email = normalizeEmail(memberEmail);
    if (!email || !newRole) return;

    const { games, gameIdx, game, team } = getHostTeamFromStorage();
    if (gameIdx === -1 || !game || !team) return;

    team.invites = team.invites || [];

    const inv = team.invites.find((x) => normalizeEmail(x.email) === email);
    if (!inv) return;

    // ✅ อัปเดต role ใน invite
    inv.role = newRole;
    inv.roleUpdatedAt = new Date().toISOString();
    inv.roleUpdatedByName = currentPlayer?.name || "Host";
    inv.roleUpdatedByRole = teamRoles?.you || "CEO";

    games[gameIdx] = game;
    writeGamesAndRefresh(games);
  }

  useEffect(() => {
    if (!isJoined) return;

    setTeamMembers((prev) =>
      prev.map((m) => {
        if (!m?.email) return m;

        const st = getInviteStatusFromStorage(m.email); // pending/accepted/denied/removed/null

        // ✅ ถ้า accepted แล้ว ให้สะท้อนใน UI (กัน sent ค้าง)
        if (st === "accepted" && m.status === "sent") {
          return { ...m, status: "accepted" };
        }

        // ✅ ถ้า denied แล้วให้สะท้อน (optional)
        if (st === "denied" && m.status === "sent") {
          return { ...m, status: "denied" };
        }

        return m;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTick, isJoined, joinedGame?.code, draftTeamId]);
  
  // -------------------------
  // Role swap
  // -------------------------
  const handleRoleChange = (currentMemberKey, newRole) => {
    if (currentMemberKey === "you") return; // host lock
    if (newRole === "CEO") return;          // members cannot be CEO

    // หา member ที่ถูกเปลี่ยน (คนที่ Host คลิก)
    const memberA = teamMembers.find((m) => m.key === currentMemberKey);
    const emailA = memberA?.email || "";
    const statusA = getInviteStatusFromStorage(emailA);

    // ✅ waiting/pending ห้ามเปลี่ยน
    if (statusA === "pending") {
      alert("You cannot change role while the player is Waiting.");
      return;
    }

    setTeamRoles((prevRoles) => {
      const oldRoleA = prevRoles[currentMemberKey] || "";

      // หา key ของคนที่ “ถือ newRole อยู่เดิม” เพื่อทำ swap
      const memberBKey = Object.keys(prevRoles).find(
        (k) => k !== "you" && k !== currentMemberKey && prevRoles[k] === newRole
      );

      const next = { ...prevRoles };

      // 1) ตั้งค่า role ของ A
      next[currentMemberKey] = newRole;

      // 2) ถ้ามีคน B ถือ role นี้อยู่ -> swap ให้ B ไป oldRoleA
      if (memberBKey) {
        next[memberBKey] = oldRoleA; // อาจเป็น "" ได้ (ถ้า A เดิมยังไม่เลือก)
      }

      // =========================
      // ✅ เขียนลง storage + ยิง notice ให้ครบทุกคนที่ได้รับผล
      // =========================
      const gameCode = joinedGame?.code || "";
      const teamId = draftTeamId || "";

      // helper ยิง 1 คน (เฉพาะ accepted)
      const applyStorageAndNoticeForAccepted = (email, oldRole, newRoleX) => {
        const realStatus = getInviteStatusFromStorage(email);
        if (realStatus !== "accepted") return;

        // ✅ 1) เซฟ role ลง team.invites[].role
        updateInviteRoleInStorage({
          gameCode,
          teamId,
          memberEmail: email,
          newRole: newRoleX,
        });

        // ✅ 2) ยิง notice role_changed (ของเดิมคุณ)
        if (oldRole && newRoleX && oldRole !== newRoleX) {
          pushRoleChangeNoticeToStorage({
            joinedGame,
            currentPlayer,
            draftTeamId: teamId,
            memberEmail: email,
            oldRole,
            newRole: newRoleX,
          });
        }
      };

      // --- A: คนที่ Host เปลี่ยน ---
      applyStorageAndNoticeForAccepted(emailA, oldRoleA, newRole);

      // --- B: คนที่โดน swap อัตโนมัติ ---
      if (memberBKey) {
        const memberB = teamMembers.find((m) => m.key === memberBKey);
        const emailB = memberB?.email || "";
        const oldRoleB = prevRoles[memberBKey] || "";    // เดิมของ B คือ newRole
        const newRoleB = oldRoleA;                       // ใหม่ของ B คือ oldRoleA

        // ถ้า oldRoleA เป็น "" แปลว่า A เดิมยังไม่มี role -> ไม่ควรไปยัด "" ให้ B ใน storage
        // ดังนั้นทำเฉพาะเคสที่ newRoleB มีค่า
        if (newRoleB) {
          applyStorageAndNoticeForAccepted(emailB, oldRoleB, newRoleB);
        }
      }

      // ✅ กระตุก UI
      setStorageTick((t) => t + 1);

      return next;
    });
  };

  const handleEmailChange = (index, value) => {
    setTeamMembers((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;

      const valueNorm = normalizeEmail(value);

      // ✅ กันซ้ำกับช่องอื่น (รวมช่อง you ด้วย)
      const youEmail = normalizeEmail(MY_EMAIL);
      const duplicated =
        (valueNorm && valueNorm === youEmail) ||
        next.some((m, i) => i !== index && normalizeEmail(m.email) === valueNorm);

      if (duplicated) {
        alert("อีเมลนี้ถูกใช้แล้ว กรุณาใช้อีเมลอื่น");
        return prev; // ❌ ไม่อัปเดตค่า
      }

      // อนุญาตให้แก้ไขได้ถ้ายังไม่เป็น sent/unregistered
      const emailNorm = normalizeEmail(cur.email);
      const registeredNow = isEmailRegistered(emailNorm);
      const effectiveStatus =
        cur.status === "unregistered" && registeredNow ? "typing" : cur.status;

      if (effectiveStatus === "sent") return prev;
      if (effectiveStatus === "unregistered") return prev;

      next[index] = {
        ...cur,
        email: value,
        status: value.trim() !== "" ? "typing" : "idle",
      };
      return next;
    });
  };

  const handleEmailBlur = (index) => {
    setTeamMembers((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;

      // ถ้าเป็น sent/unregistered อย่าให้แก้สถานะ
      if (cur.status === "sent" || cur.status === "unregistered") return prev;

      const emailNorm = normalizeEmail(cur.email);

      // ✅ ยืนยันอีเมลเมื่อ blur เฉพาะตอน email valid จริง
      if (isValidEmail(emailNorm)) {
        next[index] = { ...cur, status: "ready" }; // ✅ ready = ยืนยันแล้ว
      } else {
        next[index] = { ...cur, status: cur.email.trim() ? "typing" : "idle" };
      }
      return next;
    });
  };

  // ✅ Send Invite: เขียนลง localStorage จริง
  const handleSendInvite = async (index) => {
    const targetMember = teamMembers[index];
    const memberKey = targetMember.key;

    const emailToSend = normalizeEmail(targetMember.email);
    const roleSelected = teamRoles[memberKey];

    if (emailToSend === "" || !roleSelected) return;

    // ✅ NEW: ต้องมีชื่อทีม + ห้ามซ้ำ ก่อนส่ง invite
    const teamCheck = validateTeamNameBeforeInvite();
    if (!teamCheck.ok) return;

    if (emailToSend === normalizeEmail(MY_EMAIL)) {
      alert("คุณไม่สามารถเชิญตัวเองได้");
      return;
    }

    const isDuplicate = teamMembers.some(
      (m, i) => i !== index && normalizeEmail(m.email) === emailToSend
    );
    if (isDuplicate) {
      alert("อีเมลนี้ถูกเพิ่มไปแล้วในช่องอื่น");
      return;
    }

    // ✅ NEW: เช็คว่าอีเมลสมัครแล้วหรือยัง
    const registered = isEmailRegistered(emailToSend);

    if (!registered) {
      openInviteModal(emailToSend, roleSelected, false);
      return;
    }

    // UI
    const updatedMembers = [...teamMembers];
    updatedMembers[index].status = "sent";
    setTeamMembers(updatedMembers);

    // Storage
    let { games, gameIdx, game, team } = getHostTeamFromStorage();

    if (gameIdx !== -1 && game && !team) {
      const ensured = ensureDraftTeamInStorage(
        games,
        gameIdx,
        currentPlayer,
        joinedGame,
        draftTeamId,
        teamCheck.name // ✅ ใช้ชื่อทีมที่ validate แล้ว
      );
      games = ensured.games;
      team = ensured.team;

      if (!draftTeamId) setDraftTeamId(ensured.draftId);
    }

    if (!game || !team || gameIdx === -1) return;

    // ✅ NEW: อัปเดตชื่อทีมลง draft team ใน storage ให้ตรงล่าสุดด้วย
    team.name = teamCheck.name;

    team.invites = team.invites || [];
    const existingIdx = team.invites.findIndex(
      (inv) => normalizeEmail(inv.email) === emailToSend
    );

    const payload = {
      email: emailToSend,
      role: roleSelected,
      status: "pending",
      invitedAt: new Date().toISOString(),

      // ✅ NEW: ส่งชื่อทีมไปด้วย
      teamName: teamCheck.name,
      teamId: team.id,
      gameCode: joinedGame?.code || "",
      hostEmail: currentPlayer?.email || "",
      hostName: currentPlayer?.name || "Host",
    };

    if (existingIdx >= 0) team.invites[existingIdx] = payload;
    else team.invites.push(payload);

    games[gameIdx] = game;
    // หลัง writeGamesAndRefresh(games);
    writeGamesAndRefresh(games);

    // ✅ ส่งอีเมลอัตโนมัติ (ไม่บล็อก UX)
    try {
      const details = buildInviteDetails({
        email: emailToSend,
        role: roleSelected,
        isRegistered: true,
      });

      await sendInviteEmailAPI({
        toEmail: emailToSend,
        subject: `[HBS] You are invited to join team "${details.teamName}"`,
        text: details.text,               // ข้อความเดียวกับใน modal ได้เลย
        inviteLink: details.inviteLink,
        gameCode: details.gameCode,
        gameName: details.gameName,
        teamName: details.teamName,
        role: details.role,
        adminName: details.adminName,
        adminEmail: details.adminEmail,
      });

      // optional: toast/alert
      // alert("Invite sent (in game + email).");
    } catch (err) {
      console.error(err);
      alert(`Invite saved in game, but email failed: ${err.message}`);
    }

  };

   const handleShareInvite = (email, role) => {
    if (!isJoined || !joinedGame) return;

    // ✅ NEW: ต้องมีชื่อทีม + ห้ามซ้ำ ก่อน share
    const teamCheck = validateTeamNameBeforeInvite();
    if (!teamCheck.ok) return;

    const teamId = draftTeamId;
    if (!teamId) {
      alert("Please join game first.");
      return;
    }

    const shareUrl = `${window.location.origin}/invite?code=${joinedGame.code}&team=${teamId}`;
    const text =
      `Join my team "${teamCheck.name}" as ${role || "Team Member"}\n` +
      `Code: ${joinedGame.code}\n` +
      `Link: ${shareUrl}`;

    navigator.clipboard.writeText(text).then(() => {
      alert("Copied invite link! You can send it to your friend.");
    });
  };

function buildInviteDetails({ email, role, isRegistered }) {
  const gameCode = joinedGame?.code || "";
  const gameName = joinedGame?.name || "";
  const adminName = currentPlayer?.name || "Host";
  const adminEmail = currentPlayer?.email || "";
  const teamId = ensureDraftTeamIdReady(teamName); 
  const teamNm = (teamName || "").trim() || "Hotel Team";

  const inviteLink = `${window.location.origin}/invite?code=${gameCode}&team=${teamId}`;
  const safeEmail = isValidEmail(email) ? normalizeEmail(email) : "";

  // ✅ แทน registerLink เดิม
  const registerLink = `${window.location.origin}${REGISTER_ROUTE}?email=${encodeURIComponent(
    safeEmail
  )}&code=${encodeURIComponent(gameCode)}&team=${encodeURIComponent(teamId)}`;


  const text =
    `Game: ${gameName}\n` +
    `Game Code: ${gameCode}\n` +
    `Team: ${teamNm}\n` +
    `Admin: ${adminName} (${adminEmail})\n` +
    `Role: ${role || "Team Member"}\n` +
    `Email: ${email || "-"}\n\n` +
    `Invite Link: ${inviteLink}\n` +
    (isRegistered ? "" : `Register Link: ${registerLink}\n`);

  return {
    email,
    role,
    isRegistered,
    gameName,
    gameCode,
    teamName: teamNm,
    adminName,
    adminEmail,
    inviteLink,
    registerLink,
    text,
  };
}

function openInviteModal(email, role, isRegistered) {
  ensureDraftTeamIdReady(teamName);
  const data = buildInviteDetails({ email, role, isRegistered });
  setInviteModalData(data);
  setShowInviteModal(true);
}

async function copyInviteText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  } catch {
    alert("Copy failed. Please copy manually.");
  }
}

async function shareInviteText(text) {
  try {
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Web Share not supported. Copied instead.");
    }
  } catch {
    // user cancelled share -> ignore
  }
}
  
  const handleEditClick = (index) => {
    const oldEmail = teamMembers[index]?.email;

    removeInviteFromStorageByEmail(oldEmail);

    const updatedMembers = [...teamMembers];
    updatedMembers[index].status = "typing";
    setTeamMembers(updatedMembers);

    // ✅ ปลด role ของช่องนี้ เพื่อให้เลือกใหม่ได้จริง ๆ
    const k = teamMembers[index]?.key;
    if (k) setTeamRoles((prev) => ({ ...prev, [k]: "" }));
  };

  const [showExitModal, setShowExitModal] = useState(false);
    const [exitMode, setExitMode] = useState(null); // "delete" | "leave"

    function openExitModal(mode) {
      setExitMode(mode);
      setShowExitModal(true);
    }
    function closeExitModal() {
      setShowExitModal(false);
      setExitMode(null);
    }

  // ✅ Add/remove member (only "other")
  const handleAddMember = () => {
    const modeObj = joinedGame?.settings?.mode;
    const limit = getTeamLimitFromMode(modeObj);
    if (limit.type !== "other") return;

    const currentTotal = 1 + teamMembers.length;
    if (currentTotal >= limit.maxTotal) return;

    const keys = ["member2", "member3", "member4"];
    const used = new Set(teamMembers.map((m) => m.key));
    const nextKey = keys.find((k) => !used.has(k));
    if (!nextKey) return;

    const newMember = { key: nextKey, email: "", status: "idle" };
    setTeamMembers((prev) => [...prev, newMember]);
    setTeamRoles((prev) => ({ ...prev, [nextKey]: "" }));
  };

  const handleRemoveMemberAt = (indexToRemove) => {
    const modeObj = joinedGame?.settings?.mode;
    const limit = getTeamLimitFromMode(modeObj);

    // โหมด team (fix) ไม่ควรลบสมาชิกเอง
    if (limit.type !== "other") return;

    const currentTotal = 1 + teamMembers.length;
    if (currentTotal <= limit.minTotal) return;

    const removed = teamMembers[indexToRemove];
    if (!removed) return;

    // ✅ NEW: ลบ invite/accepted ใน storage ด้วย
    removeInviteFromStorageByEmail(removed.email);

    // ลบ member ออกจาก list
    const nextMembers = teamMembers.filter((_, i) => i !== indexToRemove);

    // ลบ role ของ member คนนั้นด้วย
    setTeamRoles((prev) => {
      const next = { ...prev };
      delete next[removed.key];
      return next;
    });

    setTeamMembers(nextMembers);
  };

  function handleRemoveAcceptedMember(index) {
    const removedEmail = teamMembers[index]?.email;
    const email = normalizeEmail(removedEmail);
    if (!email) return;

    const { games, gameIdx, game, team } = getHostTeamFromStorage();
    if (gameIdx === -1 || !game || !team) return;

    // หา invite ของคนนี้
    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === email);
    if (!inv || inv.status !== "accepted") {
      alert("Remove ทำได้เฉพาะคนที่ Accepted แล้วเท่านั้น");
      return;
    }

    // ลบออกจากสมาชิกทีม + รีเซ็ต teamId ใน players
    const foundPlayer = (game.players || []).find((p) => normalizeEmail(p.email) === email);
    if (foundPlayer) {
      team.members = (team.members || []).filter((id) => id !== foundPlayer.playerId);
      if (team.roles) delete team.roles[foundPlayer.playerId];
      foundPlayer.teamId = null;
    }

    // ✅ เปลี่ยน invite เป็น removed + ใส่ข้อความแจ้งเตือน (ไม่ลบทิ้ง)
    const hostName = currentPlayer?.name || "Host";
    const hostRole = teamRoles?.you || "CEO";
    const teamNm = team?.name || teamName?.trim() || "Hotel Team";
    const gameNm = game?.name || joinedGame?.name || "Hotel Business Simulator";
    const gameCode = game?.code || joinedGame?.code || "";
    inv.teamName = teamNm; // ✅ เพิ่มบรรทัดนี้
    // ✅ FIX: ล้าง role-change notice เก่าทิ้ง (กันเด้งเป็น "เปลี่ยนตำแหน่ง")
    delete inv.noticeType;
    delete inv.oldRole;
    delete inv.newRole;
    delete inv.roleChangedAt;
    delete inv.roleChangedByName;
    delete inv.roleChangedByRole;
    inv.noticeSeen = true; // ปิด role notice เก่า (เดี๋ยวเราจะเปิด removed notice ต่อ)

    inv.status = "removed";
    inv.removedAt = new Date().toISOString();
    inv.removedByName = hostName;
    inv.removedByRole = hostRole;

    inv.teamName = teamNm; // ✅ เพิ่มบรรทัดนี้

    inv.removedMessage =
      `${hostName} (${hostRole}) has removed you from the team "${teamNm}"\n` +
      `in the game "${gameNm}" (Code: ${gameCode}).`;

    inv.noticeSeen = false; // ให้ฝั่งเพื่อนเห็น 1 ครั้ง

    // ✅ BROADCAST: แจ้งทุกคนที่ accepted คนอื่น (เช่น 777) ว่ามีคนถูก remove
    (team.invites || []).forEach((x) => {
      const xEmail = normalizeEmail(x.email);
      if (!xEmail) return;

      // แจ้งเฉพาะคนที่ accepted และไม่ใช่คนที่ถูก remove
      if (x.status === "accepted" && xEmail !== normalizeEmail(removedEmail)) {
        x.teamUpdateType = "member_removed";
        x.teamUpdateSeen = false;
        x.teamUpdateAt = new Date().toISOString();

        const hostNm = currentPlayer?.name || "Host";
        const teamNm2 = team?.name || teamName?.trim() || "Hotel Team";
        x.teamUpdateMessage =
          `CEO: ${hostNm} has removed ${normalizeEmail(removedEmail)} from the team "${teamNm2}".`;
      }
    });

    games[gameIdx] = game;
    writeGamesAndRefresh(games);

    // ✅ UI ฝั่ง host: ถอดปุ่ม Accepted/สถานะออกจากแถวนี้ (กลับไปให้พิมพ์ใหม่ได้)
    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "typing" } : m))
    );
  }

  const handleRemoveLastMember = () => {
    const modeObj = joinedGame?.settings?.mode;
    const limit = getTeamLimitFromMode(modeObj);
    if (limit.type !== "other") return;

    const currentTotal = 1 + teamMembers.length;
    if (currentTotal <= limit.minTotal) return;

    const last = teamMembers[teamMembers.length - 1];
    if (!last) return;

    // ✅ เพิ่มบรรทัดนี้
    removeInviteFromStorageByEmail(last.email);
    setTeamMembers((prev) => prev.slice(0, -1));
    setTeamRoles((prev) => {
      const next = { ...prev };
      delete next[last.key];
      return next;
    });
  };

  /* =========================
     Join Game
     ========================= */
  const handleJoinClick = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    const games = readGames();
    const player = currentPlayer;

    if (!player?.id) {
      alert("ยังไม่พบข้อมูลผู้เล่น กรุณา Login ใหม่");
      return;
    }

    const gameIndex = games.findIndex(
      (g) => (g.code || "").toUpperCase() === code
    );
    if (gameIndex === -1) {
      alert("ไม่พบเกมนี้ กรุณาตรวจสอบโค้ดอีกครั้ง");
      return;
    }

    const game = games[gameIndex];
    game.players = game.players || [];
    game.teams = game.teams || [];

    const already = game.players.some((p) => p.playerId === player.id);
    if (!already) {
      game.players.push({
        playerId: player.id,
        name: player.name || "Player",
        email: player.email || "",
        teamId: null,
        ready: false,
        joinedAt: new Date().toISOString(),
      });
    }

    games[gameIndex] = game;
    writeGamesAndRefresh(games);

    setIsJoined(true);
    setJoinedGame(games[gameIndex]);
    // หลัง setJoinedGame(game);
    let draftId = draftTeamId || makeTeamId();
    setDraftTeamId(draftId);

    try {
      const games2 = readGames();
      const idx2 = games2.findIndex((g) => g.code === game.code);
      if (idx2 !== -1) {
        const ensured = ensureDraftTeamInStorage(games2, idx2, player, game, draftId, teamName);
        writeGamesAndRefresh(ensured.games); // ✅ ให้ storageTick เด้ง
      }
    } catch (e) {
      console.error(e);
    }

    const modeType = game?.settings?.mode?.type;
    if (modeType === "single") {
      setShowTeamSetup(false);
      // ✅ draft clear only when leaving this page
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer?.id));
      navigate("/waiting-room", { state: { gameCode: game.code } });
      return;
    }

    setShowTeamSetup(true);

  };

  // ✅ NEW: Edit Code -> reset flow so user can join another game code
  function resetTeamAndGame_NoConfirm() {
    try {
      const code = (joinedGame?.code || "").trim().toUpperCase();
      const games = readGames();

      // ถ้าเกมถูกลบแล้วจริง ๆ -> reset ฝั่งตัวเองทันที
      if (code && !findGameByCode(code)) {
        forceResetBecauseGameMissing(code);
        return;
      }

      const newGames = deleteTeamAndNotifyMembers(
        games,
        currentPlayer?.id,
        code,
        draftTeamId,
        currentPlayer?.name
      );

      writeGamesAndRefresh(newGames);
      window.dispatchEvent(new Event("hbs:teams"));
    } catch (e) {
      console.error(e);
    }

    // รีเซ็ต state เหมือนเดิม
    setIsJoined(false);
    setJoinedGame(null);
    setShowTeamSetup(false);
    setJoinCode("");
    setTeamName("");
    setTeamMembers([]);
    setTeamRoles({ you: "CEO" });
    setDraftTeamId(null);
    setIsTeamNameLocked(false);
    setPendingInvite(null);

    if (currentPlayer?.id) {
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
    }
  }

  function forceResetBecauseGameMissing(missingCode) {
    // 1) reset state ฝั่งผู้เล่น
    setIsJoined(false);
    setJoinedGame(null);
    setShowTeamSetup(false);
    setJoinCode("");
    setTeamName("");
    setTeamMembers([]);
    setTeamRoles({ you: "CEO" });
    setDraftTeamId(null);
    setIsTeamNameLocked(false);
    setPendingInvite(null);

    // 2) ล้าง draft ที่ค้าง
    if (currentPlayer?.id) {
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
    }

    // 3) แจ้งเตือน (เลือกอย่างใดอย่างหนึ่ง)
    alert(`เกม ${missingCode || ""} ถูกลบโดย Admin แล้ว`);
  }

  const finalizeTeamAndGo = () => {
    const games = readGames();
    const player = currentPlayer;

    // 1. หา Game และ Team ก่อน (ต้องทำตรงนี้ก่อน!)
    const idx = games.findIndex((g) => g.code === joinedGame?.code);
    if (idx === -1) { alert("ไม่พบเกมในระบบ"); return; }
    const game = games[idx];

    // 2. หา Team (ใช้ draftTeamId)
    const teamId = draftTeamId;
    let team = game.teams?.find((t) => t.id === teamId);
    if (!team) {
      alert("ไม่พบข้อมูลทีมร่าง กรุณาลอง Join เกมใหม่อีกครั้ง");
      return;
    }

    if (team.leaderPlayerId !== player.id) {
      alert("คุณไม่ใช่หัวหน้าทีม ไม่สามารถกดยืนยันได้");
      return;
    }

    // 3. บันทึก Roles (ย้ายมาไว้ตรงนี้หลังจากมีตัวแปร team และ game แล้ว)
    team.roles = team.roles || {};
    team.roles[player.id] = teamRoles.you || "CEO";

    teamMembers.forEach((m) => {
      const status = getInviteStatusFromStorage(m.email); // ฟังก์ชันนี้ใช้ได้เพราะมันไปอ่าน storage ใหม่
      if (status === "accepted" && teamRoles[m.key]) {
        const foundMember = game.players.find(
          (p) => normalizeEmail(p.email) === normalizeEmail(m.email)
        );
        if (foundMember) {
          team.roles[foundMember.playerId] = teamRoles[m.key];
        }
      }
    });

    // 4. ตั้งค่าอื่นๆ ของทีม
    const finalTeamName = teamName.trim() || `Team ${Math.floor(Math.random() * 900 + 100)}`;
    team.name = finalTeamName;
    team.isDraft = false; // ปิดสถานะร่าง

    // 5. อัปเดตสมาชิกที่ตอบรับแล้วให้ผูกกับทีมนี้จริงๆ
    (team.invites || [])
      .filter((inv) => inv.status === "accepted")
      .forEach((inv) => {
        const p = game.players.find((pl) => normalizeEmail(pl.email) === normalizeEmail(inv.email));
        if (p) p.teamId = teamId;
      });

    // 6. บันทึกและไปต่อ
    games[idx] = game;
    writeGamesAndRefresh(games);
    localStorage.removeItem(getDraftKeyForPlayer(currentPlayer?.id));
    navigate("/waiting-room", { state: { gameCode: joinedGame.code } });
  };

  // ✅ helper: เช็คชื่อทีมซ้ำในเกมเดียวกัน (เทียบแบบ trim + case-insensitive)
  function isDuplicateTeamName(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;

    const games = readGames();
    const game = games.find((g) => g.code === joinedGame?.code);
    if (!game) return false;

    const myTeamId = draftTeamId;

    const lower = trimmed.toLowerCase();

    return (game.teams || []).some((t) => {
      if (!t?.name) return false;

      // ✅ ไม่เทียบกับทีมของตัวเอง (draft/ทีมที่กำลังแก้)
      if (myTeamId && t.id === myTeamId) return false;

      // (Optional) ถ้าอยากให้ "Draft Team" ของคนอื่นไม่นับ ให้เปิดบรรทัดนี้
      // if (t.isDraft) return false;

      return t.name.trim().toLowerCase() === lower;
    });
  };

  function validateTeamNameBeforeInvite() {
    const trimmedName = (teamName || "").trim();

    if (!trimmedName) {
      alert("กรุณาใส่ชื่อทีมก่อนส่งคำเชิญ");
      return { ok: false, name: "" };
    }

    if (isDuplicateTeamName(trimmedName)) {
      alert("ชื่อทีมนี้ถูกใช้แล้ว กรุณาเปลี่ยนชื่อทีมก่อนส่งคำเชิญ");
      return { ok: false, name: "" };
    }

    return { ok: true, name: trimmedName };
  }

  /* =========================
     OK -> Create Team
     ========================= */
    const handleOkClick = () => {

      if (!joinedGame) {
        alert("ยังไม่ได้ Join เกม");
        return;
      }
      // ✅ 1) ต้องมีชื่อทีมก่อน
      const trimmedName = (teamName || "").trim();
      if (!trimmedName) {
        alert("กรุณาใส่ชื่อทีม");
        return;
      }

       // ✅ 2) ห้ามชื่อซ้ำกับทีมอื่นใน Waiting Room (ทีมในเกมเดียวกัน)
      if (isDuplicateTeamName(trimmedName)) {
        alert("ชื่อทีมนี้ถูกใช้แล้ว กรุณาเปลี่ยนชื่อทีม");
        return;
      }
      if (!canOk) {
        alert(`Waiting accepted: ${totalReady}/${requiredTotal}`);
        return;
      }

      // ✅ แค่นี้พอ เปิด popup
      setShowOkModal(true);
    };

  /* =========================
     Accept / Deny Invite
     ========================= */
  const handleAcceptInvite = () => {
    if (!pendingInvite || !currentPlayer?.id) return;

    const email = normalizeEmail(currentPlayer.email);
    const games = readGames();
    const gameIdx = games.findIndex((g) => g.code === pendingInvite.gameCode);
    if (gameIdx === -1) return;

    const game = games[gameIdx];
    const team = game.teams?.find((t) => t.id === pendingInvite.teamId);
    if (!team) return;

    // 1. อัปเดตสถานะใน storage
    const inv = team.invites?.find((x) => normalizeEmail(x.email) === email);
    if (inv) {
      inv.status = "accepted";
      inv.acceptedAt = new Date().toISOString();
    }

    // 2. ผูก Player เข้ากับทีม
    let p = game.players.find((pp) => pp.playerId === currentPlayer.id);
    if (!p) {
      game.players.push({
        playerId: currentPlayer.id,
        name: currentPlayer.name,
        email: currentPlayer.email,
        teamId: team.id,
        ready: false,
      });
    } else {
      p.teamId = team.id;
    }

    writeGamesAndRefresh(games);

    // ✅ สิ่งที่เพิ่มเข้ามา:
    // ✅ จำ invite ไว้เพื่อใช้ render แบบ read-only หลัง accept
    setAcceptedInviteInfo(pendingInvite);

    setIsAcceptedInvite(true);
    setPendingInvite(null);
  };

  const handleDenyInvite = () => {
    if (!pendingInvite) return;

    const email = normalizeEmail(currentPlayer?.email);
    const games = readGames();

    const gameIdx = games.findIndex((g) => g.code === pendingInvite.gameCode);
    if (gameIdx === -1) return;

    const game = games[gameIdx];
    const team = (game.teams || []).find((t) => t.id === pendingInvite.teamId);
    if (!team) return;

    const inv = (team.invites || []).find(
      (x) => normalizeEmail(x.email) === email
    );
    if (inv) {
      inv.status = "denied";
      inv.deniedAt = new Date().toISOString();
    }

    games[gameIdx] = game;
    writeGamesAndRefresh(games);

    setPendingInvite(null);
  };

  // -------------------------
  // Mock Data
  // -------------------------
  const gameHistory = [
    {
      id: 1,
      name: "Grand Coastal Resort",
      detail: "Chiang Mai Series",
      info: "2nd Place of 8 players",
      turns: "12/12 Turns",
      date: "Nov 10, 2024",
      rankType: "silver",
    },
    {
      id: 2,
      name: "Metropolis Business Hotel",
      detail: "Bangkok League 2023",
      info: "1st Place of 6 players",
      turns: "10/10 Turns",
      date: "Oct 25, 2024",
      rankType: "gold",
    },
    {
      id: 3,
      name: "Sunset Beach Resort",
      detail: "Coastal Challenge",
      info: "5th Place of 10 players",
      turns: "8/8 Turns",
      date: "Oct 5, 2024",
      rankType: "trophy",
    },
  ];

  const allAnnouncements = [
    {
      id: 1,
      type: "important",
      title: "Important: Read Case Study Before Turn 3",
      desc: "All teams must review the industry analysis case study before making Turn 3 decisions.",
      author: "Dr. Somchai",
      date: "Nov 15, 2024",
      hasTag: true,
    },
    {
      id: 2,
      type: "normal",
      title: "Maintenance Notice",
      desc: "System maintenance scheduled.",
      author: "Admin",
      date: "Nov 13, 2024",
      hasTag: false,
    },
    {
      id: 3,
      type: "normal",
      title: "Week 2 Ranking Released",
      desc: "Leaderboard updated.",
      author: "Game Master",
      date: "Nov 12, 2024",
      hasTag: false,
    },
    {
      id: 4,
      type: "normal",
      title: "New Feature: Market Analysis",
      desc: "Competitor pricing view.",
      author: "Dev Team",
      date: "Nov 10, 2024",
      hasTag: false,
    },
  ];

  const displayedAnnouncements = isExpanded
    ? allAnnouncements
    : allAnnouncements.slice(0, 2);

  const greetingName = currentPlayer?.name || "Player";

  const inviteView = pendingInvite || acceptedInviteInfo;

  // เกมที่ใช้แสดง mode/limit ฝั่งผู้ถูกเชิญ (เพราะ joinedGame จะเป็น null)
  const effectiveGame = useMemo(() => {
    if (isJoined) return joinedGame;
    if (inviteView?.gameCode) return findGameByCode(inviteView.gameCode);
    return null;
  }, [isJoined, joinedGame, inviteView?.gameCode, storageTick]);

 const teamSetupModeLabel = useMemo(() => {
  return getModeLabelEN(effectiveGame?.settings?.mode);
}, [effectiveGame, storageTick]);

const teamLimit = useMemo(() => {
  return getTeamLimitFromMode(effectiveGame?.settings?.mode);
}, [effectiveGame, storageTick]);

  const currentTotalMembers = 1 + teamMembers.length;

  // ✅ นับ accepted จาก invites ใน storage (ของทีม host)
  const acceptedCount = useMemo(() => {
    const { team } = getHostTeamFromStorage();
    if (!team) return 0;
    return (team.invites || []).filter((x) => x.status === "accepted").length;
  }, [storageTick, joinedGame, draftTeamId, currentPlayer]);

  // ✅ จำนวนสมาชิกที่ "ต้องมีในทีมทั้งหมด" ตาม mode
  const requiredTotal = teamLimit.type === "single" ? 1 : teamLimit.minTotal;

  // ✅ host = 1 คน + accepted คนอื่น ๆ
  const totalReady = 1 + acceptedCount;

  // ✅ เปิดปุ่ม OK เมื่อครบตามที่ต้องมี
  const canOk =
  isJoined &&
  totalReady >= teamLimit.minTotal &&
  totalReady <= teamLimit.maxTotal;

  // ✅ Team Setup visibility
  const canViewTeamSetup = isJoined || !!inviteView || isAcceptedInvite;
  const isTeamSetupReadOnly = (!isJoined && !!inviteView) || isAcceptedInvite;
  const isTeamSetupLocked = !canViewTeamSetup;

  const okLabel = useMemo(() => {
    if (teamLimit.type === "single") return `${totalReady}/1`;
    if (teamLimit.type === "team")
      return `${totalReady}/${teamLimit.minTotal}`; // fixed size
    // other (range)
    return `${totalReady}/${teamLimit.maxTotal}`; // เช่น 3/4
  }, [teamLimit, totalReady]);

  // ✅ Data สำหรับ OK Modal (เฉพาะ Accepted)
  const okModalData = useMemo(() => {
  const { team } = getHostTeamFromStorage();

  const accepted = (team?.invites || [])
    .filter((x) => x.status === "accepted")
    .map((x) => ({
      email: x.email,
      role: x.role || "-",
    }));

  return {
    gameName: joinedGame?.name || "-",
    gameCode: joinedGame?.code || "-",
    modeLabel: getModeLabelEN(joinedGame?.settings?.mode) || "-",
    teamName: teamName?.trim() || "Hotel Team",
    hostName: currentPlayer?.name || "Host",
    hostEmail: currentPlayer?.email || "",
    accepted,
  };
}, [storageTick, joinedGame, draftTeamId, currentPlayer, teamName]);

useEffect(() => {
    // ถ้าเรากดยอมรับคำเชิญแล้ว ให้คอยเช็คว่า Host กดยืนยันทีมหรือยัง
    if (isAcceptedInvite) {
      const games = readGames();
      // หาเกมและทีมที่เราอยู่
      for (const g of games) {
        const myTeam = g.teams?.find(t => 
          t.invites?.some(inv => normalizeEmail(inv.email) === normalizeEmail(MY_EMAIL) && inv.status === 'accepted')
        );

        // ✅ ถ้าเจอทีมเรา และ Host กด OK แล้ว (isDraft เป็น false)
        if (myTeam && myTeam.isDraft === false) {
          setIsAcceptedInvite(false); // ล้างสถานะ
          setAcceptedInviteInfo(null);
          navigate("/waiting-room", { state: { gameCode: g.code } });
          break;
        }
      }
    }
    // ใช้ storageTick เป็นตัวกระตุ้นให้ฟังก์ชันนี้ทำงานเมื่อมีการเปลี่ยนแปลงข้อมูลในเครื่อง
  }, [storageTick, isAcceptedInvite, MY_EMAIL, navigate]);

const getInvitedTeamData = () => {
  if (!inviteView) return null;
  const games = readGames();
  const game = games.find((g) => g.code === inviteView.gameCode);
  if (!game) return null;

  const t = game.teams?.find((x) => x.id === inviteView.teamId) || null;
  if (!t || t.isDeleted) return null; // ✅ สำคัญ
  return t;
};

  return (
    <div className="account-container">
      <nav className="account-header">
        <div className="header-left">
          <Building2 size={24} color="#1a1a1a" />
          <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="lang-btn">
            <Globe size={18} /> EN
          </button>
          <Link to="/settings" className="header-btn settings-btn">
            <Settings size={16} /> Settings
          </Link>
          <Link to="/login" className="header-btn logout-btn">
            <LogOut size={16} /> Log Out
          </Link>
        </div>
      </nav>

      <main className="main-content">
        {/* ✅ Greeting Banner (เหมือนรูป) */}
        <div className="greeting-hero">
          <div className="greeting-hero-inner">
            <div className="greeting-text">
              <div className="greeting-title">
                Hello, {greetingName} <span className="wave">👋</span>
              </div>
              <div className="greeting-subtitle">
                Get back to managing your hotel empire now. This season’s competition is fierce!
              </div>
            </div>

            {/* optional: ไอคอนจางๆ ด้านขวา */}
            <div className="greeting-hero-mark" aria-hidden="true" />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="left-column">
            <div className="join-top-row">
              {/* Join Game */}
              <div className="card join-game-card">
                <h3>Join Game</h3>

                <input
                  type="text"
                  className="join-input"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder={isJoined ? (joinedGame?.code || "") : "Enter game code"}
                  disabled={false} // ✅ allow edit anytime
                />

                <p className="helper-text">
                  If you don't have a game access code, <a href="#">click here.</a>
                </p>

                <button
                  className={`join-btn ${!isJoined && joinCode.trim() !== "" ? "active" : ""}`}
                  disabled={isJoined || joinCode.trim() === ""}
                  onClick={handleJoinClick}
                >
                  Join
                </button>

                {isJoined && joinedGame && (() => {
                  const adminDisplay =
                    (joinedGame?.ownerAdminUsername || "").trim() ||
                    (joinedGame?.ownerAdminName || "").trim() ||
                    (joinedGame?.adminUsername || "").trim() ||
                    (joinedGame?.adminName || "").trim() ||
                    (joinedGame?.createdByUsername || "").trim() ||
                    (joinedGame?.createdByName || "").trim() ||
                    "-";

                  return (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#374151" }}>
                    <div>
                      ✅ Joined: <strong>{joinedGame.name}</strong>
                    </div>

                    <div style={{ marginTop: 4, color: "#6B7280" }}>
                      👑 Admin:{" "}
                      <strong style={{ color: "#374151" }}>
                        {adminDisplay}
                      </strong>
                    </div>
                  </div>
                  );
                })()}
              </div>

              {/* ✅ Join Team (Invite inbox) */}
              <div className="card join-team-card">
                <h3>Join Team</h3>

                {inviteView ? (
                  <>
                    <div className="team-invite-box">
                      <div>
                        Game : <strong>{inviteView.gameName}</strong>
                      </div>

                      <div>
                        Team : <strong>{inviteView.teamName}</strong>
                      </div>

                      <div>
                        Host : <strong>{inviteView.hostName}</strong>
                      </div>

                      <div>
                        👑 Admin : <strong>{inviteView.adminDisplay || "-"}</strong>
                      </div>
                    </div>

                    <div className="join-team-actions">
                      <button className="btn-deny" onClick={handleDenyInvite} disabled={isAcceptedInvite}>
                        Deny
                      </button>
                      <button className="btn-accept" onClick={handleAcceptInvite} disabled={isAcceptedInvite}>
                        Accept
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="team-invite-placeholder" />
                    <div className="join-team-actions">
                      <button className="btn-deny" disabled>
                        Deny
                      </button>
                      <button className="btn-accept" disabled>
                        Accept
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Announcements */}
            <div className="card announcements-card">
              <div className="card-header-row">
                <div className="header-with-icon">
                  <Megaphone size={20} className="icon-megaphone" />
                  <h3>Announcements</h3>
                </div>
                <span className="badge-count">{allAnnouncements.length}</span>
              </div>

              <div className="announcement-list">
                {displayedAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className={`announcement-item ${item.type}`}
                  >
                    {item.hasTag && <div className="admin-tag">Admin</div>}
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <div className="ann-meta">
                      <span>👤 {item.author}</span>
                      <span>📅 {item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="view-all-ann">
                <span
                  className="view-all-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "View Less" : "View All"}{" "}
                  <ChevronRight
                    size={14}
                    style={{
                      transform: isExpanded ? "rotate(-90deg)" : "rotate(0deg)",
                      transition: "0.2s",
                    }}
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="right-column">
            {/* ✅ Team Setup (show always, lock when NOT joined) */}
            <div className={`team-setup-card-inline ${isTeamSetupLocked ? "locked" : ""}`}>
              <div className="team-setup-header-tag">
                Team Setup {isJoined ? `: ${teamSetupModeLabel || ""}` : ""}
              </div>

              <div className="team-form-body">
                {/* ===== ใช้ฟอร์มเดิมของคุณได้เลย แต่เพิ่ม disabled={!isJoined} ===== */}
                <div className="form-group">
                  <label>Team name</label>
                  <input
                    type="text"
                    placeholder="Enter Team name"
                    className="form-input teamname-input"
                    value={isTeamSetupReadOnly ? (inviteView?.teamName || "") : teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={!isJoined || isTeamSetupReadOnly}
                  />
                </div>

                <div className="form-group">
                  <div className="member-grid-header">
                    <div></div>
                    <div></div>
                    <div className="role-header-text">
                      Role Selection <span className="q-mark">?</span>
                    </div>
                    <div></div>
                  </div>

                  <div className="members-grid-container">
                    {/* ✅ Read-only preview สำหรับคนที่ถูกเชิญ (มีอยู่แล้วในโค้ดคุณ) */}
                    {isTeamSetupReadOnly ? (
                      <>
                        {/* 1. แสดงแถวของ Host (CEO) เสมอ */}
                        <div className="member-row">
                          <div className="col-label">Host</div>
                          <div className="col-input">
                            <input
                              type="text"
                              value={inviteView?.hostEmail || ""}
                              readOnly
                              className="form-input readonly"
                              disabled
                            />
                          </div>
                          <div className="col-role">
                            <div className="role-fixed">CEO</div>
                          </div>
                          <div className="col-action">
                            <span className="status-pill accepted">Host</span>
                          </div>
                        </div>

                        {/* 2. ดึงข้อมูลทีมจริงมาวนลูปแสดงเพื่อนร่วมทีมคนอื่นๆ */}
                        {(() => {
                          const invitedTeam = getInvitedTeamData();
                          if (!invitedTeam) return null;

                          // ✅ 1) กรองเฉพาะสถานะที่ต้องแสดงจริง
                          const visibleInvites = (invitedTeam.invites || []).filter((inv) =>
                            ["pending", "accepted", "denied"].includes(inv?.status)
                            // ❌ removed จะไม่ผ่าน filter -> 888 หายไปจาก 777 ทันที
                          );

                          return visibleInvites.map((inv, idx) => {
                            const isMe = normalizeEmail(inv.email) === normalizeEmail(MY_EMAIL);

                            const pillClass =
                              inv.status === "denied"
                                ? "denied"
                                : inv.status === "pending"
                                ? "waiting"
                                : "accepted";

                            const pillText =
                              inv.status === "pending"
                                ? "Waiting"
                                : inv.status === "denied"
                                ? "Denied"
                                : "Accepted";

                            return (
                              <div key={`${inv.email}-${inv.status}-${idx}`} className="member-row">
                                <div className="col-label">{idx === 0 ? "Other" : ""}</div>

                                <div className="col-input">
                                  <input
                                    type="text"
                                    value={inv.email || ""}
                                    readOnly
                                    className={`form-input readonly ${isMe ? "highlight-me" : ""}`}
                                    disabled
                                  />
                                </div>

                                <div className="col-role">
                                  <div className="role-fixed">{inv.role || "Member"}</div>
                                </div>

                                <div className="col-action">
                                  <span className={`status-pill ${pillClass}`}>{pillText}</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </>
                    ) : (
                      <>
                        {/* ✅ ส่วนสำหรับ Host หรือคนที่ Join แล้ว (ส่วนที่หายไป) */}
                        <div className="member-row">
                          <div className="col-label">You</div>
                          <div className="col-input">
                            <input
                              type="text"
                              value={MY_EMAIL}
                              readOnly
                              className="form-input readonly"
                              disabled={!isJoined}
                            />
                          </div>
                          <div className="col-role">
                            <div className="role-fixed">{HOST_ROLE}</div>
                          </div>
                          <div className="col-action"></div>
                        </div>

                        {/* ✅ วนลูปแสดงสมาชิกที่คุณแอดไว้ */}
                        {teamMembers.map((member, index) => {
                          const emailNorm = normalizeEmail(member.email);
                          const emailReady = member.status === "ready";
                          const isDupEmail =
                            !!emailNorm &&
                            (emailNorm === normalizeEmail(MY_EMAIL) ||
                              teamMembers.some(
                                (m, i) => i !== index && normalizeEmail(m.email) === emailNorm
                              ));

                          const registeredNow = emailReady ? isEmailRegistered(emailNorm) : false;
                          const realStatus = getInviteStatusFromStorage(member.email);
                          const isDenied = realStatus === "denied";
                          const roleValue = teamRoles[member.key];
                          const hasRole = !!roleValue;
                          const canShowAction = emailReady && hasRole && !isDupEmail;
                          const isSentUI = member.status === "sent";
                          const isUnregisteredUI = member.status === "unregistered";
                          const isWaiting = realStatus === "pending";
                          const isAccepted = realStatus === "accepted"; // (คุณมีอยู่แล้วก็ใช้ตัวเดิมได้)

                          const isRoleLocked = isWaiting || (isSentUI && !isAccepted);
                          const reservedMap = getReservedRolesFromStorage();
                          const reservedEntries = Array.from(reservedMap.entries()); // [ [email, role], ... ]

                          // role ที่คนอื่น "จอง" อยู่ (pending/accepted) ยกเว้นคนนี้เอง
                          const takenByOthers = new Set(
                            reservedEntries
                              .filter(([em]) => em !== normalizeEmail(member.email))
                              .map(([, role]) => role)
                          );
                         
                          return (
                            <div key={member.key} className="member-row">
                              <div className="col-label">{index === 0 ? "Other" : ""}</div>
                              <div className="col-input input-icon-wrapper">
                                <input
                                  type="text"
                                  placeholder="example@email.com"
                                  className={`form-input ${isSentUI || isUnregisteredUI ? "readonly" : ""}`}
                                  value={member.email}
                                  onChange={(e) => handleEmailChange(index, e.target.value)}
                                  onBlur={() => handleEmailBlur(index)}
                                  readOnly={isSentUI || isUnregisteredUI}
                                  disabled={!isJoined}
                                />
                                {(isSentUI || isUnregisteredUI) && (
                                  <Edit3
                                    size={14}
                                    className="input-icon clickable"
                                    onClick={() => isJoined && handleEditClick(index)}
                                  />
                                )}
                              </div>

                              <div className="col-role">
                                <div className={`select-wrapper ${roleValue ? "purple" : "gray"}`}>
                                  <select
                                    className="role-select"
                                    value={roleValue || ""}
                                    onChange={(e) => handleRoleChange(member.key, e.target.value)}
                                    disabled={!isJoined || isRoleLocked || isDenied}
                                  >
                                    <option value="" disabled>Select Role</option>

                                    {(() => {
                                      const reservedMap = getReservedRolesFromStorage(); // ✅ pending เท่านั้น (หลังคุณแก้ function แล้ว)
                                      const reservedEntries = Array.from(reservedMap.entries());

                                      // role ที่ถูก "pending" จองอยู่ โดยคนอื่น (ยกเว้นคนนี้)
                                      const takenByPendingOthers = new Set(
                                        reservedEntries
                                          .filter(([em]) => em !== normalizeEmail(member.email))
                                          .map(([, role]) => role)
                                      );

                                      // ✅ แสดงครบ 3 role เสมอ แต่ role ที่ pending จองไว้จะ disabled
                                      return MEMBER_ROLES.map((role) => {
                                        const disabledByPending =
                                          takenByPendingOthers.has(role) && role !== roleValue; // คนนี้เลือกไว้แล้วให้ยังเลือกได้

                                        return (
                                          <option key={role} value={role} disabled={disabledByPending}>
                                            {role}
                                          </option>
                                        );
                                      });
                                    })()}
                                  </select>
                                  <ChevronDown size={14} className="select-arrow" />
                                </div>
                              </div>

                              <div className="col-action">
                                {isDupEmail ? (
                                  <span className="status-pill denied">Duplicate</span>
                                ) : isAccepted ? (
                                  <>
                                    <span className="status-pill accepted">Accepted</span>
                                    <button
                                      type="button"
                                      className="pill-btn danger"
                                      onClick={() => isJoined && openRemoveConfirm(index)}
                                      disabled={!isJoined}
                                    >
                                      <Trash2 size={14} /> Remove
                                    </button>
                                  </>
                                ) : isSentUI ? (
                                  <span className={`status-pill ${isDenied ? "denied" : "waiting"}`}>
                                    {isDenied ? "Denied" : "Waiting"}
                                  </span>
                                ) : canShowAction ? (
                                  <button
                                    className={`pill-btn ${registeredNow ? "send" : "share"}`}
                                    type="button"
                                    onClick={() => registeredNow ? handleSendInvite(index) : openInviteModal(emailNorm, roleValue, false)}
                                    disabled={!isJoined}
                                  >
                                    {registeredNow ? "Invite" : "Share"}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}

                        {/* ปุ่ม Add member สำหรับโหมด other */}
                        {joinedGame?.settings?.mode?.type === "other" && (
                          <div className="member-row">
                            <div className="col-label"></div>
                            <div className="col-input" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <button
                                type="button"
                                className="pill-btn send"
                                onClick={() => isJoined && handleAddMember()}
                                disabled={!isJoined}
                              >
                                <PlusCircle size={14} /> Add member
                              </button>
                            </div>
                            <div className="col-role"></div>
                            <div className="col-action"></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="team-bottom-bar">
                  <button
                    className="team-exit-btn"
                    type="button"
                    onClick={() => {
                      if (isHost) openExitModal("delete");
                      else openLeaveConfirm(); // ✅ ใช้ popup leave ของเรา
                    }}
                    disabled={isHost ? (!isJoined || isTeamSetupReadOnly) : (!isJoined && !isAcceptedInvite)} // ✅ accepted กดได้
                  >
                    {isHost ? "Delete Team" : "Leave Team"}
                  </button>

                  <button
                    className={`footer-btn ok ${canOk ? "active" : "disabled"}`}
                    onClick={handleOkClick}
                    type="button"
                    disabled={!canOk || isTeamSetupReadOnly}
                  >
                    OK ({okLabel})
                  </button>
                </div>

                {/* ✅ LOCK OVERLAY */}
                {isTeamSetupLocked && (
                  <div className="team-setup-lock">
                    <div className="lock-card">
                      <div className="lock-icon">🔒</div>
                      <div className="lock-title">This section is Locked</div>
                      <div className="lock-desc">
                        Please enter <span className="lock-highlight">Game Code</span> to create team
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* History */}
            <div className="card history-card-section">
              <div className="card-header-row">
                <div className="header-with-icon">
                  <Clock size={20} className="icon-clock" />
                  <h3>History</h3>
                </div>
                <span className="badge-count">3</span>
              </div>

              <div className="history-list">
                {gameHistory.map((game) => (
                  <div key={game.id} className="history-item">
                    <div className="history-top-row">
                      <h4>{game.name}</h4>
                      <div className="rank-icon">
                        {game.rankType === "silver" && (
                          <span className="medal silver">🥈</span>
                        )}
                        {game.rankType === "gold" && (
                          <span className="medal gold">🥇</span>
                        )}
                        {game.rankType === "trophy" && (
                          <span className="medal trophy">🏆</span>
                        )}
                      </div>
                    </div>

                    <p className="sub-detail">{game.detail}</p>
                    <p className="sub-detail">{game.info}</p>

                    <div className="history-footer">
                      <span>{game.turns}</span>
                      <span className="date-text">📅 {game.date}</span>
                    </div>

                    <div className="view-report-link">
                      <a href="#">
                        View Report <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
           {/* ================= OK MODAL ================= */}
          {showOkModal && (
            <div className="okmodal-backdrop">
              <div className="okmodal-card">
                <h3>Confirm Team Setup</h3>

                <p><b>Game:</b> {okModalData.gameName}</p>
                <p><b>Team:</b> {okModalData.teamName}</p>
                <p><b>Ready:</b> {totalReady}/{requiredTotal}</p>

                <h4>Accepted Members</h4>
                {okModalData.accepted.length === 0 ? (
                  <p>-</p>
                ) : (
                  okModalData.accepted.map((m) => (
                    <div key={m.email}>
                      {m.email} ({m.role})
                    </div>
                  ))
                )}

                <div className="okmodal-actions">
                  <button
                    className="okmodal-btn cancel"
                    onClick={() => setShowOkModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="okmodal-btn confirm"
                    onClick={() => {
                      setShowOkModal(false);
                      finalizeTeamAndGo();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ================= END OK MODAL ================= */}
          {showInviteModal && inviteModalData && (
            <div className="invmodal-backdrop">
              <div className="invmodal-card">
                <button
                  className="invmodal-close"
                  onClick={() => setShowInviteModal(false)}
                  aria-label="Close"
                  type="button"
                >
                  ✕
                </button>

                <h3>
                  {inviteModalData.isRegistered ? "Invite Details" : "Email not registered yet"}
                </h3>

                <div className="invmodal-textbox">
                  {inviteModalData.text}
                </div>

                <div className="invmodal-actions">
                  <button
                    className="invmodal-btn"
                    type="button"
                    onClick={() => copyInviteText(inviteModalData.text)}
                  >
                    Copy
                  </button>

                  <button
                    className="invmodal-btn primary"
                    type="button"
                    onClick={() => shareInviteText(inviteModalData.text)}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= REMOVE CONFIRM MODAL ================= */}
          {showRemoveModal && removeTarget && (
            <div className="remmodal-backdrop">
              <div className="remmodal-card">
                <div className="remmodal-header">
                  <div className="remmodal-title">
                    <span className="remmodal-usericon" aria-hidden="true">👤</span>
                    Confirm Remove Player
                  </div>

                  <button
                    className="remmodal-close"
                    onClick={closeRemoveConfirm}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="remmodal-body">
                  <div className="remmodal-question">
                    Are you sure you want to remove this player?
                  </div>

                  <div className="remmodal-player">
                    <span className="remmodal-playericon" aria-hidden="true">👥</span>
                    <span className="remmodal-email">{removeTarget.email}</span>
                  </div>
                </div>

                <div className="remmodal-actions">
                  <button
                    className="remmodal-btn cancel"
                    onClick={closeRemoveConfirm}
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    className="remmodal-btn confirm"
                    onClick={confirmRemoveAccepted}
                    type="button"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ================= END REMOVE CONFIRM MODAL ================= */}

          {/* ================= REMOVED NOTICE MODAL (for removed player) ================= */}
          {systemNotice && (
            <div className="sysmodal-backdrop">
              <div className="sysmodal-card">
                <div className="sysmodal-header">
                  <div className="sysmodal-title">
                    <span className="sysmodal-icon" aria-hidden="true">👤</span>
                    {systemNotice.title || "Team Update"}
                  </div>

                  <button
                    className="sysmodal-close"
                    onClick={() => {
                      markRemovedNoticeSeen(systemNotice);
                      setSystemNotice(null);
                    }}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="sysmodal-body">
                  <div className="sysmodal-message">
                    {systemNotice.message}
                  </div>
                </div>

                <div className="sysmodal-actions">
                  <button
                    className="sysmodal-btn"
                    type="button"
                    onClick={() => {
                      markRemovedNoticeSeen(systemNotice); // ✅ mark ว่าอ่านแล้ว
                      setSystemNotice(null);              // ✅ ปิด modal
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {teamUpdateNotice && (
            <div className="sysmodal-backdrop">
              <div className="sysmodal-card">
                <div className="sysmodal-header">
                  <div className="sysmodal-title">
                    <span className="sysmodal-icon" aria-hidden="true">👤</span>
                    {teamUpdateNotice.title}
                  </div>

                  <button
                    className="sysmodal-close"
                    onClick={() => {
                      markTeamUpdateSeen(teamUpdateNotice);
                      setTeamUpdateNotice(null);
                    }}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="sysmodal-body">
                  <div className="sysmodal-message">
                    {teamUpdateNotice.message}
                  </div>
                </div>

                <div className="sysmodal-actions">
                  <button
                    className="sysmodal-btn"
                    type="button"
                    onClick={() => {
                      markTeamUpdateSeen(teamUpdateNotice);
                      setTeamUpdateNotice(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= END REMOVED NOTICE MODAL ================= */}
          {hostNotice && (
            <div className="sysmodal-backdrop">
              <div className="sysmodal-card">
                <div className="sysmodal-header">
                  <div className="sysmodal-title">
                    <span className="sysmodal-icon" aria-hidden="true">👤</span>
                    {hostNotice.title}
                  </div>
                  <button
                    className="sysmodal-close"
                    onClick={() => setHostNotice(null)}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="sysmodal-body">
                  <div className="sysmodal-message">{hostNotice.message}</div>
                </div>

                <div className="sysmodal-actions">
                  <button className="sysmodal-btn" type="button" onClick={() => setHostNotice(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {showExitModal && (
            <div className="remmodal-backdrop">
              <div className="remmodal-card">
                <div className="remmodal-header">
                  <div className="remmodal-title">
                    <span className="remmodal-usericon" aria-hidden="true">👤</span>
                    {exitMode === "delete" ? "Confirm Delete Team" : "Confirm Leave Team"}
                  </div>

                  <button
                    className="remmodal-close"
                    onClick={closeExitModal}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="remmodal-body">
                  <div className="remmodal-question">
                    {exitMode === "delete"
                      ? "Are you sure you want to delete this team? All draft/invites will be cleared."
                      : "Are you sure you want to leave this team?"}
                  </div>
                </div>

                <div className="remmodal-actions">
                  <button className="remmodal-btn cancel" onClick={closeExitModal} type="button">
                    Cancel
                  </button>

                  <button
                    className="remmodal-btn confirm"
                    type="button"
                    onClick={() => {
                      closeExitModal();
                      if (exitMode === "delete") resetTeamAndGame_NoConfirm();
                      else leaveTeamAndNotifyHost();
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          {showLeaveModal && (
            <div className="remmodal-backdrop">
              <div className="remmodal-card">
                <div className="remmodal-header">
                  <div className="remmodal-title">
                    <span className="remmodal-usericon" aria-hidden="true">👤</span>
                    Confirm Leave Team
                  </div>

                  <button
                    className="remmodal-close"
                    onClick={closeLeaveConfirm}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="remmodal-body">
                  <div className="remmodal-question">
                    Are you sure you want to leave team{" "}
                    <b>"{(inviteView?.teamName || teamName || "this team").trim()}"</b>?
                  </div>
                </div>

                <div className="remmodal-actions">
                  <button
                    className="remmodal-btn cancel"
                    onClick={closeLeaveConfirm}
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    className="remmodal-btn confirm"
                    onClick={confirmLeaveTeam}
                    type="button"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          {roleNotice && (
            <div className="rolemodal-backdrop">
              <div className="rolemodal-card">
                <div className="rolemodal-topbar">
                  <div className="rolemodal-top-title">Your role was changed.</div>
                </div>

                <div className="rolemodal-body">
                  <div className="rolemodal-compare">
                    <div className="rolemodal-col">
                      <div className="rolemodal-label">Old role</div>
                      <div className="rolemodal-pill">{roleNotice.oldRole}</div>
                    </div>

                    <div className="rolemodal-arrow">→</div>

                    <div className="rolemodal-col">
                      <div className="rolemodal-label new">New role</div>
                      <div className="rolemodal-pill new">{roleNotice.newRole}</div>
                    </div>
                  </div>

                  <button
                    className="rolemodal-closebtn"
                    type="button"
                    onClick={() => {
                      markRoleNoticeSeen(roleNotice);
                      setRoleNotice(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}

export default AccountPage;
