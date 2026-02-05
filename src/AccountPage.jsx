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
    return JSON.parse(raw);
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
    const minTeams = clamp(parseInt(modeObj?.minTeams || 2, 10) || 2, 2, 4);
    const maxTeams = clamp(
      parseInt(modeObj?.maxTeams || 4, 10) || 4,
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  useEffect(() => {
    if (!currentPlayer?.email) return;
    setPendingInvite(scanPendingInvite());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer]);

  // ถ้าทดสอบ 2 แท็บ ให้ sync ทันทีเมื่อ localStorage เปลี่ยน
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === GAMES_KEY) setPendingInvite(scanPendingInvite());
      if (e.key && e.key.startsWith(ACCOUNT_DRAFT_KEY_BASE)) {
  // optional: ไม่ต้องทำอะไรก็ได้
}

    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
    if (gameIdx === -1) return { games, gameIdx, game: null, team: null };

    const game = games[gameIdx];
    const team =
      (game.teams || []).find((t) => t.leaderPlayerId === hostId) || null;

    return { games, gameIdx, game, team };
  };

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
    const updatedMembers = [...teamMembers];
    updatedMembers[index].email = value;
    if (updatedMembers[index].status !== "sent") {
      updatedMembers[index].status = value.trim() !== "" ? "typing" : "idle";
    }
    setTeamMembers(updatedMembers);
  };

  // ✅ Send Invite: เขียนลง localStorage จริง
  const handleSendInvite = (index) => {
    const targetMember = teamMembers[index];
    const memberKey = targetMember.key;

    const emailToSend = normalizeEmail(targetMember.email);
    const roleSelected = teamRoles[memberKey];

    if (emailToSend === "" || !roleSelected) return;

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

    // UI
    const updatedMembers = [...teamMembers];
    updatedMembers[index].status = "sent";
    setTeamMembers(updatedMembers);

    // Storage
    const { games, gameIdx, game, team } = getHostTeamFromStorage();
    if (!game || !team || gameIdx === -1) return;

    team.invites = team.invites || [];
    const existingIdx = team.invites.findIndex(
      (inv) => normalizeEmail(inv.email) === emailToSend
    );

    const payload = {
      email: emailToSend,
      role: roleSelected,
      status: "pending",
      invitedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) team.invites[existingIdx] = payload;
    else team.invites.push(payload);

    games[gameIdx] = game;
    writeGames(games);
  };

  const handleEditClick = (index) => {
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
    const nextKey = keys[teamMembers.length];
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


  const handleRemoveLastMember = () => {
    const modeObj = joinedGame?.settings?.mode;
    const limit = getTeamLimitFromMode(modeObj);
    if (limit.type !== "other") return;

    const currentTotal = 1 + teamMembers.length;
    if (currentTotal <= limit.minTotal) return;

    const last = teamMembers[teamMembers.length - 1];
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
    writeGames(games);

    setIsJoined(true);
    setJoinedGame(game);

    const modeType = game?.settings?.mode?.type;
    if (modeType === "single") {
      setShowTeamSetup(false);
      // ✅ draft clear only when leaving this page
      localStorage.removeItem(getDraftKeyForPlayer(currentPlayer?.id));
      navigate("/waiting-room", { state: { gameCode: game.code } });
      return;
    }

    setShowTeamSetup(true);
    setDraftTeamId((prev) => prev || makeTeamId()); // ✅ เพิ่ม

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


  /* =========================
     OK -> Create Team
     ========================= */
  const handleOkClick = () => {
    if (!joinedGame) {
      alert("ยังไม่ได้ Join เกม");
      return;
    }

    const games = readGames();
    const player = currentPlayer;

    const idx = games.findIndex((g) => g.code === joinedGame.code);
    if (idx === -1) {
      alert("ไม่พบเกมในระบบ (อาจถูกลบ)");
      return;
    }

    const game = games[idx];
    game.players = game.players || [];
    game.teams = game.teams || [];

    const mode = game?.settings?.mode || {};
    const limit = getTeamLimitFromMode(mode);

    const totalNow = 1 + teamMembers.length;

    if (limit.type === "team" && totalNow !== limit.minTotal) {
      alert(`โหมดนี้ต้องมีสมาชิกทั้งหมด ${limit.minTotal} คน`);
      return;
    }

    if (
      limit.type === "other" &&
      (totalNow < limit.minTotal || totalNow > limit.maxTotal)
    ) {
      alert(`โหมดนี้ต้องมีสมาชิกทั้งหมด ${limit.minTotal}-${limit.maxTotal} คน`);
      return;
    }

    const finalTeamName =
      teamName.trim() || `Team ${Math.floor(Math.random() * 900 + 100)}`;

    const teamId = makeTeamId();

    const rolesMap = {};
    rolesMap[player.id] = teamRoles.you || "CEO";

    const inviteList = teamMembers
      .filter((m) => normalizeEmail(m.email) !== "")
      .map((m) => ({
        email: normalizeEmail(m.email),
        role: teamRoles[m.key] || "",
        status: "pending",
        invitedAt: new Date().toISOString(),
      }));

    game.teams.push({
      id: teamId,
      name: finalTeamName,
      leaderPlayerId: player.id,
      leaderName: player.name || "Host",
      leaderEmail: player.email || "",
      members: [player.id],
      roles: rolesMap,
      invites: inviteList,
      createdAt: new Date().toISOString(),
    });

    const pInGame = game.players.find((p) => p.playerId === player.id);
    if (pInGame) pInGame.teamId = teamId;

    games[idx] = game;
    writeGames(games);

    setShowTeamSetup(false);

    // ✅ clear draft because user is leaving this page
    localStorage.removeItem(getDraftKeyForPlayer(currentPlayer?.id));

    navigate("/waiting-room", { state: { gameCode: joinedGame.code } });
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

    // add to team.members
    team.members = team.members || [];
    if (!team.members.includes(currentPlayer.id)) {
      team.members.push(currentPlayer.id);
    }

    games[gameIdx] = game;
    writeGames(games);

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
    writeGames(games);

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
  }, [joinedGame]);


  const teamLimit = useMemo(() => {
    return getTeamLimitFromMode(joinedGame?.settings?.mode);
  }, [joinedGame]);

  const currentTotalMembers = 1 + teamMembers.length;

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
            {/* Team Setup */}
            {showTeamSetup && (
              <div className="team-setup-card-inline">
                <div className="team-setup-header-tag">
                  Team Setup : {teamSetupModeLabel || "Team mode"}
                </div>

                <div className="team-form-body">
                  <div className="form-group">
                    <label>Team name</label>
                    <input
                      type="text"
                      placeholder="Enter Team name"
                      className="form-input teamname-input"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
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
                          />
                        </div>

                        <div className="col-role">
                          <div
                            className={`select-wrapper ${
                              teamRoles.you ? "purple" : "gray"
                            }`}
                          >
                            <select
                              className="role-select"
                              value={teamRoles.you}
                              onChange={(e) =>
                                handleRoleChange("you", e.target.value)
                              }
                            >
                              <option value="" disabled>
                                Select Role
                              </option>
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                          </div>
                        </div>

                        <div className="col-action"></div>
                      </div>

                      {/* Other members */}
                      {teamMembers.map((member, index) => {
                        const roleValue = teamRoles[member.key];
                        const hasEmail = member.email.trim() !== "";
                        const hasRole = roleValue && roleValue !== "";
                        const canSend = hasEmail && hasRole;
                        const isSentUI = member.status === "sent";

                        // status จริงจาก storage
                        const realStatus = getInviteStatusFromStorage(member.email);
                        const isAccepted = realStatus === "accepted";
                        const isDenied = realStatus === "denied";

                        return (
                          <div key={member.key} className="member-row">
                            <div className="col-label">
                              {index === 0 ? "Other" : ""}
                            </div>

                            <div className="col-input input-icon-wrapper">
                              <input
                                type="text"
                                placeholder="example@email.com"
                                className={`form-input ${
                                  isSentUI ? "readonly" : ""
                                }`}
                                value={member.email}
                                onChange={(e) =>
                                  handleEmailChange(index, e.target.value)
                                }
                                readOnly={isSentUI}
                              />
                              {isSentUI && (
                                <Edit3
                                  size={14}
                                  className="input-icon clickable"
                                  onClick={() => handleEditClick(index)}
                                />
                              )}
                            </div>

                            <div className="col-role">
                              <div
                                className={`select-wrapper ${
                                  roleValue ? "purple" : "gray"
                                }`}
                              >
                                <select
                                  className="role-select"
                                  value={roleValue || ""}
                                  onChange={(e) =>
                                    handleRoleChange(member.key, e.target.value)
                                  }
                                >
                                  <option value="" disabled>
                                    Select Role
                                  </option>
                                  {ROLES.map((role) => (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="select-arrow" />
                              </div>
                            </div>

                            <div className="col-action">
                              {isSentUI ? (
                                <>
                                  {isAccepted ? (
                                    <span className="status-pill accepted">
                                      Accepted
                                    </span>
                                  ) : isDenied ? (
                                    <span className="status-pill denied">
                                      Denied
                                    </span>
                                  ) : (
                                    <span className="status-pill waiting">
                                      Waiting
                                    </span>
                                  )}

                                  <button className="pill-btn share" type="button">
                                    <Share2 size={12} /> Share
                                  </button>

                                  {/* ✅ ลบรายคน */}
                                  <button
                                    type="button"
                                    className="pill-btn danger"
                                    onClick={() => handleRemoveMemberAt(index)}
                                    disabled={currentTotalMembers <= teamLimit.minTotal}
                                    title={`ลดได้ต่ำสุด ${teamLimit.minTotal} คน`}
                                  >
                                    <Trash2 size={14} /> ลบ
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className={`pill-btn ${
                                      canSend ? "send" : "disabled"
                                    }`}
                                    onClick={() =>
                                      canSend && handleSendInvite(index)
                                    }
                                    disabled={!canSend}
                                    type="button"
                                  >
                                    Send
                                  </button>
                                  <button className="pill-btn share" type="button">
                                    <Share2 size={12} /> Share
                                  </button>

                                  {/* ✅ ลบรายคน */}
                                  <button
                                    type="button"
                                    className="pill-btn danger"
                                    onClick={() => handleRemoveMemberAt(index)}
                                    disabled={currentTotalMembers <= teamLimit.minTotal}
                                    title={`ลดได้ต่ำสุด ${teamLimit.minTotal} คน`}
                                  >
                                    <Trash2 size={14} /> ลบ
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add/Remove members (เฉพาะ other) */}
                      {joinedGame?.settings?.mode?.type === "other" && (
                        <div className="member-row">
                          <div className="col-label"></div>

                          {/* ปุ่มใต้คอลัมน์ email ตามที่คุณทำไว้ */}
                          <div
                            className="col-input"
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                            }}
                          >

                            <button
                              type="button"
                              className="pill-btn send"
                              onClick={handleAddMember}
                              disabled={currentTotalMembers >= teamLimit.maxTotal}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              title={`เพิ่มได้สูงสุด ${teamLimit.maxTotal} คน`}
                            >
                              <PlusCircle size={14} /> เพิ่มสมาชิก
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
                      className="footer-btn edit"
                      onClick={() => alert("Edit: (เดี๋ยวทำต่อขั้นหน้า)")}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="footer-btn ok"
                      onClick={handleOkClick}
                      type="button"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
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
      </main>
    </div>
  );
}

export default AccountPage;
