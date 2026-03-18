import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { readGames, writeGames, findGameByCode } from "./utils/gameStorage";
import "./AccountPage.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AccountPageModals from "./AccountPageModals";
import AccountTeamSetupSection from "./AccountTeamSetupSection";
import useAccountNoticeScans from "./hooks/useAccountNoticeScans";
import { joinGameAndCreateDraft } from "./utils/accountDraftStorage";
import useAccountTeam from "./hooks/useAccountTeam";
import useAccountInvite from "./hooks/useAccountInvite";
import { leaveTeamAndNotifyHostAction } from "./utils/accountInviteActions";

import {
  markRoleNoticeSeen,
  markHostNoticeSeen,
  markTeamUpdateSeen,
  markRemovedNoticeSeen,
} from "./utils/accountNoticeActions";

import {
  ensureDraftTeamInStorage as ensureDraftTeamInStorageUtil,
  getHostTeamFromStorage as getHostTeamFromStorageUtil,
  ensureDraftTeamIdReady as ensureDraftTeamIdReadyUtil,
  removeInviteFromStorageByEmail as removeInviteFromStorageByEmailUtil,
} from "./utils/accountHostTeamStorage";

import {
  normalizeEmail,
  isValidEmail,
  isEmailRegistered,
  getInvitedTeamData,
  getMyInviteState,
} from "./utils/accountTeamActions";

import {
  getDraftKeyForPlayer,
  getModeLabelEN,
  safeJSONParse,
  clamp,
  getTeamLimitFromMode,
} from "./utils/accountHelpers";

import {
  loadAccountDraft,
  saveAccountDraft,
  removeAccountDraft,
  getActiveGameCode,
  setActiveGameCode,
  clearActiveGameCode,
  getFreshJoinedGame,
} from "./utils/accountDraftStorage";

import {
  Settings,
  LogOut,
  Globe,
  Clock,
  ChevronRight,
  Megaphone,
  Building2,
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
const ACCOUNT_NOTICE_KEY = "hbs_account_notice";

function hasMembershipInGame(game, playerId) {
  if (!game || !playerId) return false;
  const me = (game.players || []).find((p) => p.playerId === playerId);
  // ต้องมี teamId จริงถึงถือว่าอยู่ในห้อง/ทีม
  return !!me?.teamId;
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

  // ✅ NEW: เก็บ notice ในระดับเกม (ไม่ผูกกับทีม)
  game.systemNotices = game.systemNotices || [];

  const affectedEmails = new Set();
  (team.invites || []).forEach((inv) => {
    const e = normalizeEmail(inv.email);
    if (!e) return;
    if (["pending", "accepted"].includes(inv.status)) affectedEmails.add(e);
  });

  affectedEmails.forEach((email) => {
    game.systemNotices.push({
      id: `team_deleted_${teamId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: "team_deleted",
      toEmail: email,
      seen: false,
      createdAt: new Date().toISOString(),
      message:
        `CEO: ${byName} has deleted the team "${teamNm}"\n` +
        `from the game "${gameNm}" (Code: ${gameCd}).\n\n` +
        `You have been removed from the team.`,
    });
  });

  // ✅ ล้าง teamId ของผู้เล่นที่อยู่ทีมนี้
  game.players = game.players.map((p) =>
    p.teamId === teamId ? { ...p, teamId: null } : p
  );

  // ✅ HARD DELETE: ลบทีมทิ้งจากเกม (ชื่อทีมก็หายไปด้วย)
  game.teams = game.teams.filter((t) => t.id !== teamId);

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

function enforceUniqueMemberRoles(prevRoles, memberKeys) {
  const allowed = new Set(["Finance", "Marketing", "HR"]);
  const next = { ...(prevRoles || {}), you: "CEO" };

  const used = new Set();
  memberKeys.forEach((k) => {
    const r = (next[k] || "").trim();
    if (!r) return;

    if (!allowed.has(r)) {
      next[k] = "";
      return;
    }
    if (used.has(r)) {
      next[k] = ""; // ซ้ำ -> เคลียร์ช่องหลัง
      return;
    }
    used.add(r);
  });

  return next;
}

function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [storageTick, setStorageTick] = useState(0);
  const [showOkModal, setShowOkModal] = useState(false);
  const [hostNotice, setHostNotice] = useState(null);
  const [roleNotice, setRoleNotice] = useState(null);
  const [teamUpdateNotice, setTeamUpdateNotice] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [accountNotice, setAccountNotice] = useState("");
  const didHydrateRef = useRef(false);
  const didInitTeamNameRef = useRef(false);

  const [memberView, setMemberView] = useState(null);

  const [joinCode, setJoinCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [joinedGame, setJoinedGame] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showTeamNameWarning, setShowTeamNameWarning] = useState(false);

  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isTeamNameLocked, setIsTeamNameLocked] = useState(false);
  const [draftTeamId, setDraftTeamId] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitMode, setExitMode] = useState(null);
  const [systemNotice, setSystemNotice] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    scanHostNotice,
    scanPendingInvite,
    scanSystemNotice,
    scanRoleChangeNotice,
    scanTeamUpdateNotice,
  } = useAccountNoticeScans({ currentPlayer, joinedGame });

  const {
    pendingInvite,
    setPendingInvite,
    acceptedInviteInfo,
    setAcceptedInviteInfo,
    isAcceptedInvite,
    setIsAcceptedInvite,
    handleAcceptInvite,
    handleDenyInvite,
  } = useAccountInvite({
    currentPlayer,
    setStorageTick,
    setJoinCode,
    setIsJoined,
    setJoinedGame,
    setShowTeamSetup,
  });

  const inviteView = pendingInvite || acceptedInviteInfo || memberView;

  const effectiveGame = useMemo(() => {
    if (isJoined) return joinedGame;
    if (inviteView?.gameCode) return findGameByCode(inviteView.gameCode);
    return null;
  }, [isJoined, joinedGame, inviteView?.gameCode]);

  const teamSetupModeLabel = useMemo(() => {
    return getModeLabelEN(effectiveGame?.settings?.mode);
  }, [effectiveGame]);

  const teamLimit = useMemo(() => {
    return getTeamLimitFromMode(effectiveGame?.settings?.mode);
  }, [effectiveGame]);

  useEffect(() => {
    const msg = localStorage.getItem(ACCOUNT_NOTICE_KEY);
    if (!msg) return;

    setAccountNotice(msg);
    localStorage.removeItem(ACCOUNT_NOTICE_KEY);
  }, []);

  useEffect(() => {
    const msg = location.state?.teamRemovedNotice;
    if (!msg) return;

    alert(msg);

    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  useEffect(() => {
    const msg = location.state?.toast;
    if (msg) alert(msg);
  }, [location.state]);

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

  useEffect(() => {
    const bump = () => setStorageTick((t) => t + 1);

    window.addEventListener("hbs:games", bump);
    window.addEventListener("hbs:teams", bump);

    return () => {
      window.removeEventListener("hbs:games", bump);
      window.removeEventListener("hbs:teams", bump);
    };
  }, []);

  useEffect(() => {
    if (!currentPlayer?.id) return;

    if (!isJoined || !joinedGame?.code) return;

    const games = readGames();
    const g = games.find(
      (x) =>
        (x.code || "").toUpperCase() ===
        (joinedGame.code || "").toUpperCase()
    );
    if (!g) return;

    const myTeamId = (g.players || []).find((p) => p.playerId === currentPlayer?.id)?.teamId;
    const myTeam = (g.teams || []).find((t) => t.id === myTeamId);

    if (g.phase === "waiting" && myTeam && myTeam.isDraft === false) {
      navigate("/waiting-room", { state: { gameCode: g.code } });
    }
  }, [storageTick, isJoined, joinedGame?.code, currentPlayer?.id, navigate]);

  // =========================
  // Invite / Register Modal
  // =========================
  const REGISTER_ROUTE = "/signup";

  function pickLatestTeam(arr) {
    if (!arr || !arr.length) return null;
    return [...arr].sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    })[0];
  }

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

    const result = handleRemoveAcceptedMember(removeTarget.index);

    if (!result?.ok) {
      if (result?.alertMsg) alert(result.alertMsg);
      return;
    }

    setStorageTick((t) => t + 1);
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
      } catch (err) {
        console.error("sendInviteEmailAPI: parse error", err);
      }
      throw new Error(msg);
    }

    return res.json();
  }

  function ensureDraftTeamIdReady(currentName) {
    const ensuredId = ensureDraftTeamIdReadyUtil({
      joinedGameCode: joinedGame?.code,
      currentPlayer,
      draftTeamId,
      teamName: currentName || teamName || "",
    });

    if (!draftTeamId && ensuredId) {
      setDraftTeamId(ensuredId);
    }

    return ensuredId;
  }

  function writeGamesAndRefresh(games) {
    writeGames(games);
    setStorageTick((t) => t + 1);
  }

  // -------------------------
  // Helpers: find host team in storage
  // -------------------------
  const getHostTeamFromStorage = useCallback(() => {
    return getHostTeamFromStorageUtil({
      joinedGameCode: joinedGame?.code,
      currentPlayerId: currentPlayer?.id,
      draftTeamId,
    });
  }, [joinedGame?.code, currentPlayer?.id, draftTeamId]);

  const getInviteStatusFromStorage = useCallback((email) => {
    const e = normalizeEmail(email);
    if (!e || !joinedGame?.code || !draftTeamId) return null;

    const games = readGames();
    const game = games.find((g) => g.code === joinedGame.code);
    if (!game) return null;

    const team = (game.teams || []).find((t) => t.id === draftTeamId);
    if (!team) return null;

    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === e);
    return inv?.status || null;
  }, [joinedGame?.code, draftTeamId]);

  // Team setup state
  const {
    teamMembers,
    setTeamMembers,
    teamRoles,
    setTeamRoles,
    handleRoleChange,
    handleRemoveAcceptedMember,
  } = useAccountTeam({
    joinedGame,
    draftTeamId,
    currentPlayer,
    teamName,
    getHostTeamFromStorage,
    getInviteStatusFromStorage,
    updateInviteRoleInStorage,
    pushRoleChangeNoticeToStorage,
  });

  const resetAllUIState = useCallback(({ alertMsg } = {}) => {
    setIsJoined(false);
    setJoinedGame(null);
    setShowTeamSetup(false);
    setJoinCode("");
    setTeamName("");
    setTeamMembers([]);
    setTeamRoles({ you: "CEO" });
    setDraftTeamId(null);
    setIsTeamNameLocked(false);

    didInitTeamNameRef.current = false;

    setPendingInvite(null);
    setAcceptedInviteInfo(null);
    setIsAcceptedInvite(false);
    setMemberView(null);

    clearActiveGameCode();

    if (currentPlayer?.id) {
      removeAccountDraft(currentPlayer.id);
    }

    if (alertMsg) alert(alertMsg);
  }, [setPendingInvite, setAcceptedInviteInfo, setIsAcceptedInvite, setTeamMembers, setTeamRoles, currentPlayer?.id]);

  const scanMyMembership = useCallback((preferGameCode) => {
    const pid = currentPlayer?.id;
    if (!pid) return null;

    const prefer = (preferGameCode || "").trim().toUpperCase();
    const games = readGames();

    if (prefer) {
      const g = games.find((x) => (x.code || "").trim().toUpperCase() === prefer);
      if (g) {
        const me = (g.players || []).find((p) => p.playerId === pid);
        if (me?.teamId) {
          const t = (g.teams || []).find((x) => x.id === me.teamId && !x.isDeleted);
          if (t) return { gameCode: g.code, game: g, team: t };
        }
      }
      return null;
    }

    for (const g of games) {
      const me = (g.players || []).find((p) => p.playerId === pid);
      if (!me?.teamId) continue;
      const t = (g.teams || []).find((x) => x.id === me.teamId && !x.isDeleted);
      if (!t) continue;
      return { gameCode: g.code, game: g, team: t };
    }
    return null;
  }, [currentPlayer?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // =========================
  // ✅ HYDRATE ONCE (restore draft)
  // =========================
  useEffect(() => {
    if (!currentPlayer?.id) return;

    // ✅ run once จริง ๆ
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;

    let draft = loadAccountDraft(currentPlayer.id);
    const activeCode = getActiveGameCode();

    if (draft) {
      setJoinCode(draft.joinCode || "");

      const code = (draft.joinedGameCode || "").trim().toUpperCase();
      const freshGame = getFreshJoinedGame(code);

      setIsJoined(!!draft.isJoined && !!freshGame);
      setJoinedGame(freshGame || null);
      setShowTeamSetup(!!draft.showTeamSetup && !!freshGame);

      setTeamName(draft.teamName || "");
      setIsTeamNameLocked(!!draft.isTeamNameLocked);
      setTeamMembers(Array.isArray(draft.teamMembers) ? draft.teamMembers : []);
      setTeamRoles(draft.teamRoles || { you: "CEO" });
      setDraftTeamId(draft.draftTeamId || null);
      setIsAcceptedInvite(!!draft.isAcceptedInvite);
      setAcceptedInviteInfo(draft.acceptedInviteInfo || null);
    } else if (activeCode) {
      const g = findGameByCode(activeCode);

      // ✅ ถ้า game ไม่มี หรือ player ไม่ได้อยู่ในทีมจริง -> ล้าง activeCode ทิ้ง
      if (!g || !hasMembershipInGame(g, currentPlayer.id)) {
        clearActiveGameCode();
      } else {
        setJoinCode(activeCode);
        setIsJoined(true);
        setJoinedGame(g);
        setShowTeamSetup(true);
      }
    }

    // ✅ fallback membership: ให้เช็คเฉพาะ activeCode เท่านั้น (ห้ามสุ่มเกมอื่น)
    const mem = scanMyMembership(activeCode);
    if (mem?.gameCode) {
      const code = (mem.gameCode || "").trim().toUpperCase();
      setJoinCode(code);
      setIsJoined(true);
      setJoinedGame(findGameByCode(code));
      setShowTeamSetup(true);
      setActiveGameCode(code);
    }

    setHydrated(true);
  }, [setAcceptedInviteInfo, setIsAcceptedInvite, setTeamMembers, setTeamRoles, currentPlayer?.id, scanMyMembership]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentPlayer?.id) return;
    if (!isJoined || !joinedGame?.code) return;

    const code = (joinedGame.code || "").trim().toUpperCase();
    const games = readGames();
    const g = games.find((x) => (x.code || "").trim().toUpperCase() === code);
    if (!g) return;

    const hostId = currentPlayer.id;

    // หา “ทีมของ Host” ในเกมนี้
    const mine = (g.teams || []).filter(
      (t) => t && !t.isDeleted && t.leaderPlayerId === hostId
    );
    if (!mine.length) return;

    // prefer draft ก่อน (ตอนยังไม่กด OK) ไม่งั้นเอาอันล่าสุด
    const hostDraft = pickLatestTeam(mine.filter((t) => t.isDraft));
    const hostTeam = hostDraft || pickLatestTeam(mine);
    if (!hostTeam) return;

    // ✅ 1) บังคับให้ draftTeamId ชี้ทีม Host ที่เจอจริง
    if (!draftTeamId || !(g.teams || []).some((t) => t.id === draftTeamId)) {
      setDraftTeamId(hostTeam.id);
    }

    // ✅ 2) Sync ชื่อทีมจาก storage (แก้ปัญหาชื่อทีมว่าง)
    const storageName = (hostTeam.name || "").trim();

    // ✅ sync จาก storage แค่ "ครั้งแรก" เท่านั้น
    if (!didInitTeamNameRef.current) {
      if (storageName) {
        setTeamName(storageName);
      }
      didInitTeamNameRef.current = true;
    }

    const visibleInvs = (hostTeam.invites || []).filter((inv) =>
      ["pending", "accepted", "denied"].includes(inv?.status)
    );

    if (visibleInvs.length > 0) {
      const desiredOtherCount = Math.max(0, (teamLimit?.minTotal || 1) - 1);
      const keys = ["member2", "member3", "member4"].slice(0, desiredOtherCount);

      setTeamMembers((prev) => {
        const prevSafe = Array.isArray(prev) ? prev : [];
        const byKey = new Map(prevSafe.map((m) => [m.key, m]));

        // map slotKey -> invite
        const invBySlot = new Map();
        visibleInvs.forEach((inv) => {
          if (inv?.slotKey) invBySlot.set(inv.slotKey, inv);
        });

        return keys.map((k) => {
          const inv = invBySlot.get(k);
          if (inv) {
            return {
              key: k,
              email: inv.email || "",
              status: inv.status === "accepted" ? "accepted" : "sent",
            };
          }
          // ไม่มี invite ของ slot นี้ -> คงช่องเดิมไว้
          return byKey.get(k) || { key: k, email: "", status: "idle" };
        });
      });

      setTeamRoles((prev) => {
        const next = { ...(prev || {}), you: "CEO" };

        const invBySlot = new Map();
        visibleInvs.forEach((inv) => {
          if (inv?.slotKey) invBySlot.set(inv.slotKey, inv);
        });

        keys.forEach((k) => {
          const inv = invBySlot.get(k);
          if (inv) {
            next[k] = (inv.role || "").trim();
          } else {
            if (next[k] == null) next[k] = "";
          }
        });

        return next;
      });
    }

  }, [
    hydrated,
    storageTick,
    isJoined,
    joinedGame?.code,
    currentPlayer?.id,
    draftTeamId,
    teamLimit?.minTotal,
    teamName, setTeamMembers, setTeamRoles,
  ]);

  const MY_EMAIL = useMemo(
    () => currentPlayer?.email || "you@email.com",
    [currentPlayer]
  );

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
  }, [
    currentPlayer,
    storageTick,
    scanHostNotice,
    scanPendingInvite,
    scanRoleChangeNotice,
    scanSystemNotice,
    scanTeamUpdateNotice,
    setPendingInvite
  ]);

  // ============================
  // ✅ GUARD: ถ้าทีมถูกลบ (admin hard delete) -> reset ฝั่งผู้เล่น
  // ============================
  useEffect(() => {
    if (!currentPlayer?.id) return;

    const games = readGames();

    // 1) ถ้ากำลัง Join เกมอยู่
    if (isJoined && joinedGame?.code) {
      const g = games.find((x) => (x.code || "").toUpperCase() === (joinedGame.code || "").toUpperCase());
      if (!g) return; // เกมหาย เดี๋ยว guard เกมคุณจัดการเอง

      const me = (g.players || []).find((p) => p.playerId === currentPlayer.id);
      const myTeamId = me?.teamId;

      if (myTeamId) {
        const myTeam = (g.teams || []).find((t) => t?.id === myTeamId);

        const teamRemoved =
          !myTeam ||
          myTeam?.isDeleted ||
          myTeam?.removedByAdmin;

        if (teamRemoved) {
          if (me) me.teamId = null;

          const gi = games.findIndex((x) => x.code === g.code);
          if (gi !== -1) {
            games[gi] = g;
            writeGamesAndRefresh(games);
          }

          const removedMsg =
            "แอดมินได้นำทีมของท่านออกจากเกม กรุณาะจัดทีมใหม่อีกครั้ง";

          resetAllUIState();

          localStorage.setItem(ACCOUNT_NOTICE_KEY, removedMsg);
          setAccountNotice(removedMsg);
        }
      }
      return;
    }

    // 2) ถ้าอยู่ใน acceptedInvite view (isAcceptedInvite) แต่ host/ทีมถูกลบไปแล้ว
    if (isAcceptedInvite && acceptedInviteInfo?.gameCode && acceptedInviteInfo?.teamId) {
      const g = games.find((x) => (x.code || "").toUpperCase() === (acceptedInviteInfo.gameCode || "").toUpperCase());
      const teamAlive = (g?.teams || []).some((t) => t?.id === acceptedInviteInfo.teamId && !t?.isDeleted);
      if (!g || !teamAlive) {
        setPendingInvite(null);
        setAcceptedInviteInfo(null);
        setIsAcceptedInvite(false);

        if (currentPlayer?.id) {
          localStorage.removeItem(getDraftKeyForPlayer(currentPlayer.id));
        }

        alert("ทีมที่คุณยอมรับคำเชิญถูกลบแล้ว");
      }
    }
  }, [
    storageTick,
    isJoined,
    joinedGame?.code,
    isAcceptedInvite,
    acceptedInviteInfo?.teamId,
    acceptedInviteInfo?.gameCode,
    currentPlayer?.id,
    resetAllUIState,
    setPendingInvite,
    setAcceptedInviteInfo,
    setIsAcceptedInvite
  ]);

  // ถ้าทดสอบ 2 แท็บ ให้ sync ทันทีเมื่อ localStorage เปลี่ยน
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === GAMES_KEY) {
        setStorageTick((t) => t + 1);
        return;
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
  }, [currentPlayer]);

  // Roles
  const HOST_ROLE = "CEO";
  const ROLES = useMemo(() => ["CEO", "Finance", "Marketing", "HR"], []);
  const MEMBER_ROLES = useMemo(() => ["Finance", "Marketing", "HR"], []); // ✅ ไม่มี CEO

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
  }, [setTeamMembers, setTeamRoles, storageTick, isJoined, joinedGame, draftTeamId]);

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
  }, [setTeamMembers, storageTick, showInviteModal]);

  // ✅ NEW: Auto-save draft whenever state changes
  useEffect(() => {
    if (!currentPlayer?.id) return;
    if (!hydrated) return;

    const draft = {
      joinCode,
      isJoined,
      joinedGameCode: (joinedGame?.code || "").trim().toUpperCase(),
      showTeamSetup,
      teamName,
      isTeamNameLocked,
      teamMembers,
      teamRoles,
      draftTeamId,
      isAcceptedInvite,
      acceptedInviteInfo,
    };

    saveAccountDraft(currentPlayer.id, draft);
  }, [
    currentPlayer?.id,
    joinCode,
    isJoined,
    joinedGame?.code,
    showTeamSetup,
    teamName,
    isTeamNameLocked,
    teamMembers,
    teamRoles,
    draftTeamId,
    isAcceptedInvite,
    acceptedInviteInfo,
    hydrated,
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
      }
    } catch (e) {
      console.error(e);
    }
  }, [teamName, isJoined, joinedGame?.code, draftTeamId]);

  // รีเซ็ต Team Setup ตอนเปิด (ยึดตาม mode ของเกมที่ join)
  useEffect(() => {
    if (!isJoined || !joinedGame) return;

    // 1. ดึงข้อมูลทีมของ Host จาก Storage มาดูก่อน
    const { team } = getHostTeamFromStorage();

    // 🚩 เช็คว่า: มีทีมนี้อยู่จริงไหม และ มีข้อมูลสมาชิก (Invites) ค้างอยู่หรือเปล่า
    if (team && Array.isArray(team.invites) && team.invites.length > 0) {
      // ✅ ดึงข้อมูลสมาชิกเดิมมาใส่ State
      const restoredMembers = team.invites.map((inv, idx) => ({
        key: `member${idx + 2}`,
        email: inv.email,
        status: inv.status === "accepted" ? "accepted" : "sent",
      }));

      setTeamMembers(restoredMembers);

      // ✅ ดึงตำแหน่งเดิมมาใส่ State
      const restoredRoles = { you: team.roles?.[currentPlayer?.id] || "CEO" };
      restoredMembers.forEach((m) => {
        const inv = team.invites.find(x => x.email === m.email);
        restoredRoles[m.key] = inv?.role || "";
      });
      setTeamRoles(restoredRoles);
      setTeamName(team.name || "");

      // ดึงข้อมูลเดิมมาใส่เสร็จแล้ว ให้หยุดการทำงาน (ไม่ต้องไป Init ใหม่ข้างล่าง)
      return;
    }

    // -----------------------------------------------------------
    // 2. Logic เดิม (สำหรับกรณี "ไม่มี" ทีมใน Storage หรือสร้างใหม่ครั้งแรก)
    // -----------------------------------------------------------
    const modeObj = joinedGame?.settings?.mode;
    const { type, startTotal } = getTeamLimitFromMode(modeObj);

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
  }, [isJoined, joinedGame, currentPlayer?.id]); // เพิ่ม currentPlayer?.id ใน dependency

  const isHost = useMemo(() => {
    if (!isJoined || !joinedGame?.code || !currentPlayer?.id) return false;

    const code = (joinedGame.code || "").trim().toUpperCase();
    const games = readGames();
    const g = games.find((x) => (x.code || "").trim().toUpperCase() === code);
    if (!g) return false;

    const myId = currentPlayer.id;
    const myEmail = normalizeEmail(currentPlayer.email);

    // ✅ ถือว่าเป็น Host ถ้า leaderPlayerId ตรง "หรือ" leaderEmail ตรง
    return (g.teams || []).some((t) => {
      if (!t || t.isDeleted) return false;
      const leaderEmail = normalizeEmail(t.leaderEmail);
      return t.leaderPlayerId === myId || (myEmail && leaderEmail === myEmail);
    });
  }, [isJoined, joinedGame?.code, currentPlayer?.id, currentPlayer?.email]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentPlayer?.id || !currentPlayer?.email) return;
    if (!isJoined || !joinedGame?.code) return;

    const pid = currentPlayer.id;
    const email = normalizeEmail(currentPlayer.email);
    const code = (joinedGame.code || "").trim().toUpperCase();

    const games = readGames();
    const g = games.find((x) => (x.code || "").trim().toUpperCase() === code);

    // เกมหาย
    if (!g) {
      resetAllUIState({ alertMsg: `เกม ${code} ถูกลบแล้ว` });
      return;
    }

    const me = (g.players || []).find((p) => p.playerId === pid) || null;
    const myTeamId = me?.teamId || null;

    // ✅ ถ้ามี teamId แต่ทีมถูกลบ -> รีเซ็ต
    if (myTeamId) {
      const alive = (g.teams || []).some((t) => t?.id === myTeamId && !t?.isDeleted);
      if (!alive) {
        if (me) me.teamId = null;
        const gi = games.findIndex((x) => x.code === g.code);
        if (gi !== -1) {
          games[gi] = g;
          writeGamesAndRefresh(games);
        }
        resetAllUIState({ alertMsg: "ทีมของคุณถูกลบแล้ว ระบบออกจากทีมให้อัตโนมัติ" });
      }
      return;
    }

    // ✅ ถ้าไม่มี teamId → ต้องมี “ทีมของฉันที่เป็น host/draft” อยู่ ไม่งั้นคือค้างหลังลบทีม
    const hasMyHostTeam = (g.teams || []).some((t) => {
      if (!t || t.isDeleted) return false;
      const leaderEmail = normalizeEmail(t.leaderEmail);
      return t.leaderPlayerId === pid || (email && leaderEmail === email);
    });

    // ถ้าไม่มีทั้ง teamId และไม่มี host/draft team ของตัวเอง → reset
    if (!hasMyHostTeam) {
      resetAllUIState();
    }
  }, [
    hydrated,
    storageTick,
    isJoined,
    joinedGame?.code,
    currentPlayer?.id,
    currentPlayer?.email,
    resetAllUIState,
  ]);

  useEffect(() => {
    if (!currentPlayer?.id || !currentPlayer?.email) return;

    // เฉพาะคนที่ join เกมแล้ว แต่ไม่ใช่ host
    if (!isJoined || !joinedGame?.code || isHost) {
      setMemberView(null);
      return;
    }

    const games = readGames();
    const g = games.find(
      (x) => (x.code || "").toUpperCase() === (joinedGame.code || "").toUpperCase()
    );
    if (!g) {
      setMemberView(null);
      return;
    }

    const me = (g.players || []).find((p) => p.playerId === currentPlayer.id);
    const myTeamId = me?.teamId;

    const t = (g.teams || []).find(
      (x) => x.id === myTeamId && !x.isDeleted && !x.removedByAdmin
    );
    if (!t) {
      setMemberView(null);
      return;
    }

    const adminDisplay =
      (g?.ownerAdminUsername || "").trim() ||
      (g?.ownerAdminName || "").trim() ||
      (g?.adminUsername || "").trim() ||
      (g?.adminName || "").trim() ||
      (g?.createdByUsername || "").trim() ||
      (g?.createdByName || "").trim() ||
      "-";

    setMemberView({
      gameCode: g.code,
      gameName: g.name,
      teamId: t.id,
      teamName: t.name,
      hostName: t.leaderName || "Host",
      hostEmail: t.leaderEmail || "",
      adminDisplay,
    });
  }, [storageTick, isJoined, joinedGame?.code, isHost, currentPlayer?.id, currentPlayer?.email]);

  // =========================
  // 🔒 Lock Host = CEO + Prevent Members from being CEO
  // =========================
  useEffect(() => {
    // ✅ สำคัญ: ล็อค CEO เฉพาะ Host เท่านั้น
    if (!isHost) return;

    setTeamRoles((prev) => {
      if (!prev) return prev;

      let changed = false;
      const next = { ...prev };

      // Host ต้องเป็น CEO เสมอ
      if (next.you !== HOST_ROLE) {
        next.you = HOST_ROLE;
        changed = true;
      }

      // สมาชิกคนอื่นห้ามเป็น CEO
      Object.keys(next).forEach((k) => {
        if (k !== "you" && next[k] === "CEO") {
          next[k] = "";
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [setTeamRoles, teamMembers.length, HOST_ROLE, isHost]);

  function leaveTeamAndNotifyHost() {
    const result = leaveTeamAndNotifyHostAction({
      currentPlayer,
      joinedGame,
      acceptedInviteInfo,
    });

    if (!result.ok) {
      if (result.alertMsg) alert(result.alertMsg);
      return;
    }

    setStorageTick((t) => t + 1);
    resetAllUIState(result.alertMsg ? { alertMsg: result.alertMsg } : undefined);
  }

  function removeInviteFromStorageByEmail(emailToRemove) {
    const ok = removeInviteFromStorageByEmailUtil({
      emailToRemove,
      joinedGameCode: joinedGame?.code,
      currentPlayerId: currentPlayer?.id,
      draftTeamId,
    });

    if (ok) {
      setStorageTick((t) => t + 1);
    }
  }

  useEffect(() => {
    if (!isJoined) return;

    setTeamMembers((prev) =>
      prev.map((m) => {
        if (!m?.email) return m;

        const st = getInviteStatusFromStorage(m.email); // pending/accepted/denied/removed/null
        if (!st) return m;

        // ✅ sync ให้ตรง storage เสมอ
        if (st === "pending") {
          // pending = waiting (ฝั่ง host มักจะเห็นเป็น sent)
          if (m.status !== "sent") return { ...m, status: "sent" };
          return m;
        }

        if (st === "accepted") {
          if (m.status !== "accepted") return { ...m, status: "accepted" };
          return m;
        }

        if (st === "denied") {
          if (m.status !== "denied") return { ...m, status: "denied" };
          return m;
        }

        if (st === "removed") {
          // removed = กลับไปให้พิมพ์/เชิญใหม่ได้
          if (m.status !== "typing") return { ...m, status: "typing" };
          return m;
        }

        return m;
      })
    );
  }, [setTeamMembers, storageTick, isJoined, joinedGame?.code, draftTeamId, getInviteStatusFromStorage]);

  function handleEmailChange(index, value) {
    const email = value.trim();

    setTeamMembers((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;

        // ✅ typing ระหว่างพิมพ์
        if (!isValidEmail(email)) {
          return { ...m, email, status: "typing" };
        }

        // ✅ email valid → พร้อม invite ทันที
        return { ...m, email, status: "ready" };
      })
    );
  }

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
      const gameIdx = games.findIndex((g) => g.code === joinedGame?.code);
      const nextTeamName = (teamName || "").trim();

      const ensured = ensureDraftTeamInStorageUtil({
        games,
        gameIdx,
        player: currentPlayer,
        draftTeamId,
        teamName: nextTeamName,
      });
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
      slotKey: memberKey,
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
        text: details.text,
        inviteLink: details.inviteLink,
        gameCode: details.gameCode,
        gameName: details.gameName,
        teamName: details.teamName,
        role: details.role,
        adminName: details.adminName,
        adminEmail: details.adminEmail,
      });

    } catch (err) {
      console.warn("Email failed (ignored in dev):", err?.message);
    }

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

  /* =========================
     Join Game
  ========================= */
  const handleJoinClick = () => {
    const result = joinGameAndCreateDraft({
      joinCode,
      currentPlayer,
      teamName,
    });

    if (!result.ok) {
      if (result.error === "GAME_NOT_FOUND") {
        alert("Game not found. Please check your code.");
      } else if (result.error === "NO_PLAYER") {
        alert("กรุณา Login ใหม่");
      }
      return;
    }

    setJoinCode(result.code);
    setIsJoined(true);
    setJoinedGame(result.freshGame);
    setShowTeamSetup(true);
    setDraftTeamId(result.draftTeamId);

    setActiveGameCode(result.code);

    setStorageTick((t) => t + 1);
  };
  // ✅ NEW: Edit Code -> reset flow so user can join another game code
  function resetTeamAndGame_NoConfirm() {
    if (!isHost) {
      resetAllUIState();
      return;
    }

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
    } catch (e) {
      console.error(e);
    }

    // ✅ reset ทีเดียวให้ครบทุก state/keys
    resetAllUIState();
  }

  function forceResetBecauseGameMissing(missingCode) {
    resetAllUIState({ alertMsg: `เกม ${missingCode || ""} ถูกลบโดย Admin แล้ว` });
  }

  const finalizeTeamAndGo = () => {
    const games = readGames();
    const player = currentPlayer;

    const idx = games.findIndex((g) => g.code === joinedGame?.code);
    if (idx === -1) {
      alert("ไม่พบเกมในระบบ");
      return;
    }

    const game = games[idx];

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

    // ✅ บันทึก Roles
    team.roles = team.roles || {};
    team.roles[player.id] = teamRoles.you || "CEO";
    team.leaderName = player.name || "Host";
    team.leaderEmail = player.email || "";

    teamMembers.forEach((m) => {
      const status = getInviteStatusFromStorage(m.email);
      if (status === "accepted" && teamRoles[m.key]) {
        const foundMember = game.players.find(
          (p) => normalizeEmail(p.email) === normalizeEmail(m.email)
        );
        if (foundMember) {
          team.roles[foundMember.playerId] = teamRoles[m.key];
        }
      }
    });

    // ✅ ตั้งชื่อทีม + ปิด draft
    const finalTeamName =
      (teamName || "").trim() ||
      (player?.name || "").trim() ||
      `Team ${Math.floor(Math.random() * 900 + 100)}`;

    team.name = finalTeamName;
    team.isDraft = false;

    // ✅ CLEANUP: ลบ draft ทีมเก่าของ host ที่ไม่ใช่ทีมนี้
    game.teams = (game.teams || []).filter((t) => {
      if (t?.leaderPlayerId !== player.id) return true;
      if (t?.id === teamId) return true;
      return t?.isDraft !== true; // ลบทิ้งเฉพาะ draft เก่า
    });

    // ✅ NEW: ผูก host เข้ากับทีมด้วย
    const hostPlayer = (game.players || []).find(
      (p) => p.playerId === player.id
    );
    if (hostPlayer) hostPlayer.teamId = teamId;

    // ✅ ผูกสมาชิก accepted เข้าทีม
    (team.invites || [])
      .filter((inv) => inv.status === "accepted")
      .forEach((inv) => {
        const p = game.players.find(
          (pl) => normalizeEmail(pl.email) === normalizeEmail(inv.email)
        );
        if (p) p.teamId = teamId;
      });

    team.members = (game.players || [])
      .filter((p) => p.teamId === teamId)
      .map((p) => p.playerId);

    // ===================================================
    // ⭐⭐⭐ จุดสำคัญที่สุด (STEP ต่อไปของระบบคุณ)
    // บอกทุกคนว่าเกมเข้าสู่ Waiting Phase แล้ว
    // ===================================================
    game.phase = "waiting";
    game.waitingStartedAt = new Date().toISOString(); // optional แต่แนะนำ

    // ===================================================

    games[idx] = game;
    writeGamesAndRefresh(games);

    removeAccountDraft(currentPlayer?.id);

    // 👉 ไปหน้า WaitingListPage
    navigate("/waiting-room", { state: { gameCode: joinedGame.code } });
  };

  // ✅ helper: เช็คชื่อทีมซ้ำในเกมเดียวกัน (เทียบแบบ trim + case-insensitive)
  function isDuplicateTeamName(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;

    const games = readGames();
    const game = games.find((g) => g.code === joinedGame?.code);
    if (!game) return false;

    const lower = trimmed.toLowerCase();
    const myPlayerId = currentPlayer?.id;

    return (game.teams || []).some((t) => {
      if (!t || t.isDeleted) return false;
      if (!t.name) return false;

      // ✅ FIX: ignore ทีมของตัวเองทุกกรณี
      if (t.leaderPlayerId === myPlayerId) return false;

      return t.name.trim().toLowerCase() === lower;
    });
  }

  function validateTeamNameBeforeInvite() {
    const trimmedName = (teamName || "").trim();

    if (!trimmedName) {
      setShowTeamNameWarning(true); // ✅ ใช้ modal แทน alert
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
      setShowTeamNameWarning(true);
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

  const joinedCode = (joinedGame?.code || "").trim().toUpperCase();
  const typedCode = (joinCode || "").trim().toUpperCase();
  const isJoiningNewCode = typedCode && typedCode !== joinedCode;
  const canClickJoin = typedCode && (!isJoined || isJoiningNewCode);

  // ✅ Team Setup visibility
  const canViewTeamSetup = isJoined || !!inviteView || isAcceptedInvite;
  const isTeamSetupReadOnly = (!isJoined && !!inviteView) || isAcceptedInvite || (isJoined && !isHost);
  const isTeamSetupLocked = !canViewTeamSetup;

  useEffect(() => {
    if (!hydrated) return;
    if (!isJoined) return;
    if (isTeamSetupReadOnly) return;

    const keys = (teamMembers || []).map((m) => m.key).filter(Boolean);
    if (!keys.length) return;

    setTeamRoles((prev) => {
      const fixed = enforceUniqueMemberRoles(prev, keys);
      return JSON.stringify(prev || {}) === JSON.stringify(fixed || {}) ? prev : fixed;
    });
  }, [setTeamRoles, hydrated, isJoined, isTeamSetupReadOnly, teamMembers]);

  useEffect(() => {
    if (!hydrated) return;

    // ✅ ทีมจะต้องถูกสร้าง slot เมื่อ "เข้าร่วมเกมแล้ว" และ "ไม่ใช่ read-only"
    if (!isJoined) return;
    if (isTeamSetupReadOnly) return;

    if (!effectiveGame?.settings?.mode) return;

    const otherCountMin = Math.max(0, (teamLimit?.minTotal || 1) - 1);

    if (teamLimit.type === "team" || teamLimit.type === "other") {
      ensureMemberSlots(otherCountMin);
    }

    if (teamLimit.type === "single") {
      ensureMemberSlots(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    isJoined,
    isTeamSetupReadOnly,
    teamLimit.type,
    teamLimit.minTotal,
    effectiveGame?.code,
  ]);

  // ✅ นับ accepted จาก invites ใน storage (ของทีม host)
  const acceptedCount = useMemo(() => {
    const { team } = getHostTeamFromStorage();
    if (!team) return 0;
    return (team.invites || []).filter((x) => x.status === "accepted").length;
  }, [getHostTeamFromStorage]);

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
    if (teamLimit.type === "single") return `Ready ${totalReady}`;
    if (teamLimit.type === "other") return `Ready ${totalReady}`;
    // team (fixed)
    return `Ready ${totalReady}/${teamLimit.minTotal}`;
  }, [teamLimit.type, teamLimit.minTotal, totalReady]);

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
  }, [
    joinedGame?.name,
    joinedGame?.code,
    joinedGame?.settings?.mode,
    currentPlayer?.name,
    currentPlayer?.email,
    teamName,
    getHostTeamFromStorage,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAcceptedInvite) return;
    if (!acceptedInviteInfo?.gameCode || !acceptedInviteInfo?.teamId) return;

    const games = readGames();
    const g = games.find(
      (x) =>
        (x.code || "").toUpperCase() ===
        (acceptedInviteInfo.gameCode || "").toUpperCase()
    );
    if (!g) return;

    const t = (g.teams || []).find(
      (x) => x.id === acceptedInviteInfo.teamId
    );
    if (!t) return;

    if (t.isDraft === false) {
      setIsAcceptedInvite(false);
      setAcceptedInviteInfo(null);
      navigate("/waiting-room", { state: { gameCode: g.code } });
    }
  }, [
    hydrated,
    storageTick,
    isAcceptedInvite,
    acceptedInviteInfo?.gameCode,
    acceptedInviteInfo?.teamId,
    navigate,
    setAcceptedInviteInfo,
    setIsAcceptedInvite
  ]);

  function ensureMemberSlots(desiredOtherCount) {
    const keys = ["member2", "member3", "member4"];

    setTeamMembers((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      // ตัดให้ไม่เกิน 3 ช่อง
      const target = clamp(desiredOtherCount, 0, 3);

      // map ตาม key เพื่อคง email/status เดิม
      const byKey = new Map(safePrev.map((m) => [m.key, m]));

      const next = keys.slice(0, target).map((k) => {
        const old = byKey.get(k);

        if (!old) return { key: k, email: "", status: "idle" };

        const emailTrim = (old.email || "").trim();

        // ✅ ถ้าอีเมลว่าง -> อย่าให้ status ค้างเป็น sent/unregistered
        if (!emailTrim) return { ...old, key: k, email: "", status: "idle" };

        return { ...old, key: k };
      });

      return next;
    });

    setTeamRoles((prev) => {
      const next = { ...(prev || {}), you: "CEO" };
      const target = clamp(desiredOtherCount, 0, 3);

      keys.slice(0, target).forEach((k) => {
        if (next[k] == null) next[k] = "";
      });

      // ลบ role ของช่องที่เกินออก (กันค้าง)
      keys.slice(target).forEach((k) => {
        if (k in next) delete next[k];
      });

      return next;
    });
  }

  const myInviteState = getMyInviteState({
    currentPlayer,
    pendingInvite,
    acceptedInviteInfo,
    memberView,
    readGames,
    normalizeEmail,
  });

  return (
    <div className="account-container">
      {accountNotice && (
        <div
          style={{
            marginTop: "24px 0",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#FFF7ED",
            border: "1px solid #FDBA74",
            color: "#9A3412",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {accountNotice}
          </div>

          <button
            type="button"
            onClick={() => setAccountNotice("")}
            style={{
              border: "none",
              background: "#EA580C",
              color: "white",
              padding: "8px 12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            ปิด
          </button>
        </div>
      )}
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
                  disabled={!canClickJoin}
                  onClick={() => {
                    if (isJoined && isJoiningNewCode) {
                      resetAllUIState();
                    }
                    handleJoinClick();
                  }}
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
                      {pendingInvite ? (
                        <>
                          <button className="btn-deny" onClick={handleDenyInvite}>
                            Deny
                          </button>
                          <button className="btn-accept" onClick={handleAcceptInvite}>
                            Accept
                          </button>
                        </>
                      ) : myInviteState.waitingHostOk ? (
                        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                          <span className="status-pill accepted">Accepted</span>
                        </div>
                      ) : (
                        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                          <span className="status-pill accepted">In a team</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="team-invite-placeholder" />
                    <div className="join-team-actions">
                      <button className="btn-deny" disabled title="No invitation yet">
                        Deny
                      </button>
                      <button className="btn-accept" disabled title="No invitation yet">
                        Accept
                      </button>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
                      No invitations yet.
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

              <div className="team-form-body">
                <AccountTeamSetupSection
                  isJoined={isJoined}
                  teamSetupModeLabel={teamSetupModeLabel}
                  isTeamSetupReadOnly={isTeamSetupReadOnly}
                  inviteView={inviteView}
                  teamName={teamName}
                  setTeamName={setTeamName}
                  canOk={canOk}
                  handleOkClick={handleOkClick}
                  okLabel={okLabel}
                  isHost={isHost}
                  openExitModal={openExitModal}
                  openLeaveConfirm={openLeaveConfirm}
                  isAcceptedInvite={isAcceptedInvite}
                  teamLimit={teamLimit}
                  isTeamSetupLocked={isTeamSetupLocked}
                >
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
                          const invitedTeam = getInvitedTeamData(inviteView, readGames);
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
                          // ---- raw & normalize ----
                          const emailRaw = member.email || "";
                          const emailNorm = normalizeEmail(emailRaw);
                          const youEmail = normalizeEmail(MY_EMAIL);

                          // ---- realtime validation (UX โปร: ไม่ต้อง blur) ----
                          const emailValid = isValidEmail(emailNorm);

                          // ---- duplicate check ----
                          const isDupEmail =
                            !!emailNorm &&
                            (emailNorm === youEmail ||
                              teamMembers.some(
                                (m, i) => i !== index && normalizeEmail(m.email) === emailNorm
                              ));

                          // ---- status from storage (source of truth) ----
                          const realStatus = getInviteStatusFromStorage(emailNorm) || null;
                          const isWaiting = realStatus === "pending";
                          const isAccepted = realStatus === "accepted";
                          const isDenied = realStatus === "denied" || member.status === "denied";

                          // ---- local ui flags ----
                          const roleValue = teamRoles[member.key] || "";
                          const hasRole = !!roleValue;

                          // ✅ ให้ "Waiting" มาจาก storage เท่านั้น
                          const isSentUI = isWaiting;
                          const isUnregisteredUI = member.status === "unregistered";

                          // ✅ lock role เฉพาะตอน pending จริง ๆ
                          const isRoleLocked = isWaiting;

                          // ✅ ปุ่ม Invite/Share โผล่ทันทีเมื่อ email valid + เลือก role แล้ว
                          const canShowAction =
                            emailValid &&
                            hasRole &&
                            !isDupEmail &&
                            !isDenied &&
                            !isWaiting &&
                            !isAccepted;

                          const registeredNow = emailValid ? isEmailRegistered(emailNorm) : false;

                          return (
                            <div key={member.key} className="member-row">
                              <div className="col-label">{index === 0 ? "Other" : ""}</div>

                              <div className="col-input input-icon-wrapper">
                                <input
                                  type="text"
                                  placeholder="example@email.com"
                                  className={`form-input ${isSentUI || isUnregisteredUI ? "readonly" : ""}`}
                                  value={emailRaw}
                                  onChange={(e) => handleEmailChange(index, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      // ✅ UX โปร: กด Enter แล้ว Invite ได้เลย ถ้าพร้อม
                                      if (canShowAction && registeredNow) handleSendInvite(index);
                                      if (canShowAction && !registeredNow)
                                        openInviteModal(emailNorm, roleValue, false);
                                    }
                                  }}
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
                                    value={roleValue}
                                    onChange={(e) => {
                                      const result = handleRoleChange(member.key, e.target.value);
                                      if (!result?.ok && result?.alertMsg) {
                                        alert(result.alertMsg);
                                        return;
                                      }
                                      if (result?.ok) {
                                        setStorageTick((t) => t + 1);
                                      }
                                    }}
                                    disabled={!isJoined || isRoleLocked || isDenied}
                                  >
                                    <option value="" disabled>Select Role</option>

                                    {MEMBER_ROLES.map((role) => (
                                      <option key={role} value={role}>
                                        {role}
                                      </option>
                                    ))}
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
                                ) : isDenied ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span className="status-pill denied">Denied</span>
                                    <Edit3
                                      size={14}
                                      className="input-icon clickable"
                                      style={{ position: "static", cursor: "pointer" }}
                                      onClick={() => isJoined && handleEditClick(index)}
                                    />
                                  </div>
                                ) : isWaiting || isSentUI ? (
                                  <span className="status-pill waiting">Waiting</span>
                                ) : canShowAction ? (
                                  <button
                                    className={`pill-btn ${registeredNow ? "send" : "share"}`}
                                    type="button"
                                    onClick={() =>
                                      registeredNow
                                        ? handleSendInvite(index)
                                        : openInviteModal(emailNorm, roleValue, false)
                                    }
                                    disabled={!isJoined}
                                  >
                                    {registeredNow ? "Invite" : "Share"}
                                  </button>
                                ) : (
                                  // ✅ UX โปร: บอก hint สั้น ๆ แทนการหายไปเฉย ๆ
                                  <span style={{ fontSize: 12, color: "#6B7280" }}>
                                    {!emailValid && emailRaw.trim() ? "Invalid email" : !hasRole ? "Select role" : ""}
                                  </span>
                                )}
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
                </AccountTeamSetupSection>

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

        <AccountPageModals
          showTeamNameWarning={showTeamNameWarning}
          setShowTeamNameWarning={setShowTeamNameWarning}
          roleNotice={roleNotice}
          setRoleNotice={setRoleNotice}
          markRoleNoticeSeen={markRoleNoticeSeen}
          hostNotice={hostNotice}
          setHostNotice={setHostNotice}
          markHostNoticeSeen={markHostNoticeSeen}
          systemNotice={systemNotice}
          setSystemNotice={setSystemNotice}
          markRemovedNoticeSeen={markRemovedNoticeSeen}
          resetAllUIState={resetAllUIState}
          teamUpdateNotice={teamUpdateNotice}
          setTeamUpdateNotice={setTeamUpdateNotice}
          markTeamUpdateSeen={markTeamUpdateSeen}
          showRemoveModal={showRemoveModal}
          removeTarget={removeTarget}
          closeRemoveConfirm={closeRemoveConfirm}
          confirmRemoveAccepted={confirmRemoveAccepted}
          showLeaveModal={showLeaveModal}
          closeLeaveConfirm={closeLeaveConfirm}
          confirmLeaveTeam={confirmLeaveTeam}
          inviteView={inviteView}
          teamName={teamName}
          showExitModal={showExitModal}
          closeExitModal={closeExitModal}
          exitMode={exitMode}
          resetTeamAndGame_NoConfirm={resetTeamAndGame_NoConfirm}
          leaveTeamAndNotifyHost={leaveTeamAndNotifyHost}
        />
      </main>
    </div>
  );
}

export default AccountPage; 