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

function readGames() {
  return safeJSONParse(localStorage.getItem(GAMES_KEY), []);
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


function AccountPage() {
  const navigate = useNavigate();
  const [storageTick, setStorageTick] = useState(0);
  const [showOkModal, setShowOkModal] = useState(false);
    // =========================
  // Invite / Register Modal
  // =========================
  const REGISTER_ROUTE = "/signup";

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState(null);

  // ✅ Remove Confirm Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); 
  // { index, email }
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

  function ensureDraftTeamIdReady() {
    if (draftTeamId) return draftTeamId;

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
          teamName
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
            title: "Removed from Team",
            gameCode: g.code,
            teamId: t.id,
            email, // ของคนที่ถูกลบ
            teamName: inv.teamName || t.name || "your team",
            removedBy: inv.removedByName || "host",
            message:
              inv.removedMessage ||
              `You have been removed from the team ${inv.teamName || t.name || ""} by ${inv.removedByName || "host"}`,
            at: inv.removedAt,
          };
        }
      }
    }
    return null;
  };

  useEffect(() => {
  if (!currentPlayer?.email) return;

  setPendingInvite(scanPendingInvite());
  setSystemNotice(scanSystemNotice());
}, [currentPlayer, storageTick]);


  // สแกนหา invite ที่ pending ของอีเมลนี้
  const scanPendingInvite = () => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();
    let found = null;

    for (const g of games) {
      for (let i = 0; i < (g.teams || []).length; i++) {
        const t = g.teams[i];
        const inv = (t.invites || []).find(
          (x) => normalizeEmail(x.email) === email && x.status === "pending"
        );

        if (inv) {
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
  const ROLES = useMemo(() => ["CEO", "Finance", "Marketing", "HR"], []);

  // Team setup state
  const [teamRoles, setTeamRoles] = useState({ you: "CEO" });
  const [teamMembers, setTeamMembers] = useState([]); // [{key, email, status}]

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

  // -------------------------
  // Role swap
  // -------------------------
  const handleRoleChange = (currentMemberKey, newRole) => {
    setTeamRoles((prevRoles) => {
      const memberHoldingThisRole = Object.keys(prevRoles).find(
        (key) => prevRoles[key] === newRole && key !== currentMemberKey
      );
      const oldRole = prevRoles[currentMemberKey];

      let newState = { ...prevRoles, [currentMemberKey]: newRole };
      if (memberHoldingThisRole) {
        newState[memberHoldingThisRole] = oldRole;
      }
      return newState;
    });
  };

  const handleEmailChange = (index, value) => {
  setTeamMembers((prev) => {
    const next = [...prev];
    const cur = next[index];
    if (!cur) return prev;

    // อนุญาตให้แก้ไขได้ถ้ายังไม่เป็น 'sent'
    const emailNorm = normalizeEmail(cur.email);
    const registeredNow = isEmailRegistered(emailNorm);
    const effectiveStatus =
      cur.status === "unregistered" && registeredNow ? "typing" : cur.status;

    if (effectiveStatus === "sent") return prev;
    // ถ้า unregistered แต่สมัครแล้ว -> จะไม่ block แล้ว
    if (effectiveStatus === "unregistered") return prev;

    next[index] = {
      ...cur,
      email: value,
      status: value.trim() !== "" ? "typing" : "idle",
    };
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
  const teamId = ensureDraftTeamIdReady();
  const teamNm = (teamName || "").trim() || "Hotel Team";

  const inviteLink = `${window.location.origin}/invite?code=${gameCode}&team=${teamId}`;
  const registerLink = `${window.location.origin}${REGISTER_ROUTE}?email=${encodeURIComponent(
    email || ""
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
  ensureDraftTeamIdReady();
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

    // ✅ ลบ invite เก่าออกก่อน (กันค้าง acceptedCount)
    removeInviteFromStorageByEmail(oldEmail);

    const updatedMembers = [...teamMembers];
    updatedMembers[index].status = "typing";
    setTeamMembers(updatedMembers);
  };

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

    inv.status = "removed";
    inv.removedAt = new Date().toISOString();
    inv.removedByName = hostName;
    inv.removedByRole = hostRole;

    inv.teamName = teamNm; // ✅ เพิ่มบรรทัดนี้

    inv.removedMessage =
      `ขณะนี้ ${hostName} ตำแหน่ง ${hostRole} ได้ลบคุณออกจากทีม "${teamNm}" ` +
      `ในเกม "${gameNm}" (Code: ${gameCode})`;

    inv.noticeSeen = false; // ให้ฝั่งเพื่อนเห็น 1 ครั้ง

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
    setJoinedGame(game);
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
  const handleEditCode = () => {
  // ถ้ายังไม่มีอะไรให้ล้าง ก็รีเซ็ตเลย
    const hasTeamDraftData =
      showTeamSetup ||
      (teamName && teamName.trim() !== "") ||
      (teamMembers && teamMembers.length > 0) ||
      draftTeamId;

    if (!hasTeamDraftData) {
      setIsJoined(false);
      setJoinedGame(null);
      setShowTeamSetup(false);
      setJoinCode("");
      setTeamName("");
      setTeamMembers([]);
      setTeamRoles({ you: "CEO" });
      setDraftTeamId(null);
      setIsTeamNameLocked(false);
      return;
    }

    const ok = window.confirm(
      "หากเปลี่ยนรหัสเกม ข้อมูลใน Team Setup และคำเชิญที่ส่งไปแล้วจะถูกล้างทั้งหมด\n\nต้องการเปลี่ยนรหัสเกมหรือไม่?"
    );

    if (!ok) return;

    // ✅ 1) ล้างทีม draft + invites ที่เคยส่งไว้ใน storage (ให้ต้อง send ใหม่จริง)
    try {
      const games = readGames();
      const newGames = removeInvitesByHostDraft(
        games,
        currentPlayer?.id,
        joinedGame?.code,
        draftTeamId
      );
      writeGames(newGames);
    } catch (e) {
      // ไม่ต้องทำอะไร แค่กันพัง
      console.error(e);
    }

    // ✅ 2) รีเซ็ต state ในหน้า
    setIsJoined(false);
    setJoinedGame(null);
    setShowTeamSetup(false);
    setJoinCode("");

    setTeamName("");
    setTeamMembers([]);
    setTeamRoles({ you: "CEO" });
    setDraftTeamId(null);
    setIsTeamNameLocked(false);

    // ✅ 3) ล้าง draft ของ player นี้ (กัน restore กลับมาเอง)
    if (currentPlayer?.id) {
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
    }
  };

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
    game.players = game.players || [];
    game.teams = game.teams || [];

    const team = game.teams.find((t) => t.id === pendingInvite.teamId);
    if (!team) return;

    // mark invite accepted
    team.invites = team.invites || [];
    const inv = team.invites.find((x) => normalizeEmail(x.email) === email);
    if (!inv) return;

    inv.status = "accepted";
    inv.acceptedAt = new Date().toISOString();

    // ensure player exists + set teamId
    let p = game.players.find((pp) => pp.playerId === currentPlayer.id);
    if (!p) {
      p = {
        playerId: currentPlayer.id,
        name: currentPlayer.name || "Player",
        email: currentPlayer.email || "",
        teamId: team.id,
        ready: false,
        joinedAt: new Date().toISOString(),
      };
      game.players.push(p);
    } else {
      p.teamId = team.id;
    }

    const mode = game?.settings?.mode || {};
    const limit = getTeamLimitFromMode(mode);

    team.members = team.members || [];

  // ถ้าตัวเองยังไม่อยู่ใน members -> คาดว่าจะเพิ่ม 1
  const nextTotal = team.members.includes(currentPlayer.id)
    ? team.members.length
    : team.members.length + 1;

  if (nextTotal > limit.maxTotal) {
    alert("This team is already full.");
    return;
  }

    // add to team.members
    team.members = team.members || [];
    if (!team.members.includes(currentPlayer.id)) {
      team.members.push(currentPlayer.id);
    }

    games[gameIdx] = game;
    writeGamesAndRefresh(games);

    setPendingInvite(null);

    // ✅ leaving this page
    localStorage.removeItem(getDraftKeyForPlayer(currentPlayer?.id));
    navigate("/waiting-room", { state: { gameCode: game.code } });
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

 const teamSetupModeLabel = useMemo(() => {
    return getModeLabelEN(joinedGame?.settings?.mode);
  }, [joinedGame, storageTick]); // ✅ เพิ่ม storageTick

  const teamLimit = useMemo(() => {
    return getTeamLimitFromMode(joinedGame?.settings?.mode);
  }, [joinedGame, storageTick]); // ✅ เพิ่ม storageTick

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
                className={`join-btn ${
                  (joinCode.trim() !== "" && !isJoined) || isJoined ? "active" : ""
                }`}
                disabled={!isJoined && joinCode.trim() === ""}
                onClick={() => (isJoined ? handleEditCode() : handleJoinClick())}
              >
                {isJoined ? "Edit Code" : "Join"}
              </button>

              {isJoined && joinedGame && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#374151" }}>
                  ✅ Joined: <strong>{joinedGame.name}</strong> —{" "}
                  <span style={{ color: "#6B7280" }}>
                    Mode: {getModeLabelEN(joinedGame?.settings?.mode)}
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Join Team (Invite inbox) */}
            <div className="card join-team-card">
              <h3>Join Team</h3>

              {pendingInvite ? (
                <>
                  <div className="team-invite-box">
                    <div>
                      Game Name : <strong>{pendingInvite.gameName}</strong>
                    </div>
                    <div>
                      Team Name : <strong>{pendingInvite.teamName}</strong>
                    </div>
                    <div>
                      Role : <strong>{pendingInvite.role || "-"}</strong>
                    </div>
                    <div>
                      Host name: <strong>{pendingInvite.hostName}</strong>
                    </div>
                  </div>

                  <div className="join-team-actions">
                    <button className="btn-deny" onClick={handleDenyInvite}>
                      Deny
                    </button>
                    <button className="btn-accept" onClick={handleAcceptInvite}>
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

          <div className="right-column">
            {/* ✅ Team Setup (show always, lock when NOT joined) */}
<div className={`team-setup-card-inline ${!isJoined ? "locked" : ""}`}>
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
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        disabled={!isJoined}
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
        {/* Row 1: You */}
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
            <div className={`select-wrapper ${teamRoles.you ? "purple" : "gray"}`}>
              <select
                className="role-select"
                value={teamRoles.you}
                onChange={(e) => handleRoleChange("you", e.target.value)}
                disabled={!isJoined}
              >
                <option value="" disabled>Select Role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>

          <div className="col-action"></div>
        </div>

        {/* Other members (ของเดิมคุณ) */}
        {teamMembers.map((member, index) => {
          const roleValue = teamRoles[member.key];
          const hasEmail = member.email.trim() !== "";
          const hasRole = roleValue && roleValue !== "";
          const canSend = hasEmail && hasRole;
          const isSentUI = member.status === "sent";
          const isUnregisteredUI = member.status === "unregistered";


          const realStatus = getInviteStatusFromStorage(member.email);
          const isAccepted = realStatus === "accepted";
          const isDenied = realStatus === "denied";

          return (
            <div key={member.key} className="member-row">
              <div className="col-label">{index === 0 ? "Other" : ""}</div>

              <div className="col-input input-icon-wrapper">
                <input
                  type="text"
                  placeholder="example@email.com"
                  className={`form-input ${(isSentUI || isUnregisteredUI) ? "readonly" : ""}`}
                  value={member.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
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
                    disabled={!isJoined}
                  >
                    <option value="" disabled>Select Role</option>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>
            <div className="col-action">
              {(() => {
                const emailNorm = normalizeEmail(member.email);
                const registeredNow = isEmailRegistered(emailNorm);

                const realStatus = getInviteStatusFromStorage(member.email);
                const isAccepted = realStatus === "accepted";
                const isDenied = realStatus === "denied";

                const roleValue = teamRoles[member.key];
                const hasEmail = (member.email || "").trim() !== "";
                const hasRole = !!roleValue;
                const canSend = hasEmail && hasRole;

                const isSentUI = member.status === "sent"; // sent = ส่ง invite จริงแล้วเท่านั้น

                // ✅ Accepted -> แสดงเป็น "ปุ่มสถานะ" (ไม่เทา) + ยังมี Remove ได้เหมือน Waiting/Deny
                if (isAccepted) {
                  return (
                    <>
                      <span className="status-pill accepted">Accepted</span>

                      <button
                        type="button"
                        className="pill-btn danger"
                        onClick={() => isJoined && openRemoveConfirm(index)}
                        disabled={!isJoined}
                      >
                        <Trash2 className="trash-icon" /> Remove
                      </button>
                    </>
                  );
                }

                // ✅ ถ้าส่ง invite แล้ว (registered เท่านั้น) -> Waiting/Denied + Remove
                if (isSentUI) {
                  return isDenied ? (
                    <span className="status-pill denied">Denied</span>
                  ) : (
                    <span className="status-pill waiting">Waiting</span>
                  );
                }

                // - ถ้า NOT registered -> ให้ปุ่มหลักเป็น Share (ตำแหน่งเดียวกับ Invite) และ "ไม่ต้องมี Not registered"
                if (!registeredNow) {
                  return (
                    <button
                      className={`pill-btn ${canSend && isJoined ? "share" : "disabled"}`}
                      type="button"
                      disabled={!isJoined || !canSend}
                      onClick={() => openInviteModal(emailNorm, roleValue, false)}
                    >
                      Share
                    </button>
                  );
                }

                // ✅ Registered และยังไม่ส่ง -> Invite (เหมือนเดิม)
                return (
                  <button
                    className={`pill-btn ${canSend && isJoined ? "send" : "disabled"}`}
                    onClick={() => isJoined && canSend && handleSendInvite(index)}
                    disabled={!isJoined || !canSend}
                    type="button"
                  >
                    Invite
                  </button>
                );
              })()}
            </div>
            </div>
          );
        })}

        {/* Add member (เฉพาะ other) */}
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
      </div>
    </div>

    <div className="form-footer">
      <button
        className={`footer-btn ok ${canOk ? "active" : "disabled"}`}
        onClick={handleOkClick}
        type="button"
        disabled={!canOk}
      >
        OK ({okLabel})
      </button>
    </div>

    {/* ✅ LOCK OVERLAY */}
    {!isJoined && (
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
                    onClick={() => setSystemNotice(null)}
                    aria-label="Close"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div className="sysmodal-body">
                  <div className="sysmodal-message">
                    You have been removed from the team{" "}
                    <b>{systemNotice.teamName || "your team"}</b>{" "}
                    by <span className="sysmodal-by">{systemNotice.removedBy || "-"}</span>
                  </div>

                  {/* ถ้าอยากแสดงข้อความแบบเต็ม (ไทย/ยาว) จาก removedMessage ก็เปิดบรรทัดนี้ */}
                  {/* <div className="sysmodal-sub">{systemNotice.message}</div> */}
                </div>

                <div className="sysmodal-actions">
                  <button
                    className="sysmodal-btn"
                    type="button"
                    onClick={() => setSystemNotice(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ================= END REMOVED NOTICE MODAL ================= */}
        </main>
    </div>
  );
}

export default AccountPage;
