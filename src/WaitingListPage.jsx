import React, { useState, useEffect, useMemo } from "react";
import "./WaitingListPage.css";
import { useNavigate } from "react-router-dom";
import {
  // --- Icons หลัก ---
  Clock,
  BookOpen,
  User,
  Globe,
  LogOut,
  // --- Icons สำหรับ Rules (ต้องมี Zap ด้วย) ---
  Calendar,
  DollarSign,
  Zap,
  Sliders,
  TrendingUp,
  AlertTriangle,
  // --- Icons ใหม่สำหรับ Scoring (ให้ตรงกับรูป) ---
  CircleDollarSign,
  Building2,
  PieChart,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";

/* =========================
   LocalStorage Keys + Helpers
   ========================= */
const GAMES_KEY = "hbs_games";
const PLAYER_SESSION_KEY = "hbs_current_player";
const ACTIVE_GAME_CODE_KEY = "hbs_active_game_code_v1";
const TIMER_KEY = (code) => `hbs_timer_${code}`;

function startTimerIfPaused(code) {
  if (!code) return;
  const key = TIMER_KEY(code);

  const st = safeParse(localStorage.getItem(key), null);
  if (!st) return;

  if (!st.isRunning && Number(st.timeLeft) > 0) {
    localStorage.setItem(
      key,
      JSON.stringify({
        ...st,
        isRunning: true,
        lastUpdated: Date.now(),
      })
    );
    window.dispatchEvent(new Event("hbs:timer"));
  }
}

function readTimerState(code) {
  if (!code) return { timeLeft: 0, isRunning: false, lastUpdated: Date.now() };

  const raw = localStorage.getItem(TIMER_KEY(code));
  if (!raw) return null;

  const st = safeParse(raw, null);
  if (!st) return null;

  const timeLeft = Number(st.timeLeft) || 0;
  const isRunning = !!st.isRunning;
  const lastUpdated = Number(st.lastUpdated) || Date.now();

  // ✅ คำนวณเวลาจริงแบบเดียวกับ AdminLobbyPage
  if (isRunning) {
    const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
    return { timeLeft: Math.max(0, timeLeft - elapsed), isRunning, lastUpdated };
  }
  return { timeLeft, isRunning, lastUpdated };
}

function ensureTimerInitialized(code, defaultSeconds = 600) {
  if (!code) return;

  const key = TIMER_KEY(code);
  if (localStorage.getItem(key)) return;

  localStorage.setItem(
    key,
    JSON.stringify({
      timeLeft: defaultSeconds,     // ✅ 10 นาที
      isRunning: false,              // ✅ เริ่มนับถอยหลังทันที (ทีมแรกเข้ามา)
      lastUpdated: Date.now(),
    })
  );

  // ให้แท็บเดียวกัน sync
  window.dispatchEvent(new Event("hbs:timer"));
}

function safeParse(raw, fallback) {
  try {
    const x = JSON.parse(raw);
    return x == null ? fallback : x;
  } catch {
    return fallback;
  }
}

function readGames() {
  return safeParse(localStorage.getItem(GAMES_KEY), []);
}

function getGameName(game) {
  return (game?.name || "").trim() || "-";
}

function getAdminName(game) {
  return (
    (game?.ownerAdminName || "").trim() ||
    (game?.ownerAdminUsername || "").trim() ||
    (game?.ownerAdminEmail || "").trim() ||
    "แอดมิน"
  );
}

function getTotalRounds(game) {
  const n = Number(game?.settings?.structure?.totalQuarters);
  return Number.isFinite(n) && n > 0 ? n : "-";
}

function getModeBadgeText(game) {
  const t = game?.settings?.mode?.type;
  if (t === "single") return "โหมดผู้เล่นเดี่ยว";
  // team / other -> ตามภาพใช้คำนี้
  return "โหมดผู้เล่นหลายคน";
}

function resolvePlayerNameInGame(game, key) {
  if (!game || !key) return "-";

  // key อาจเป็น playerId หรือ email
  const players = game.players || [];
  const byId = players.find((p) => p.playerId === key);
  if (byId?.name) return byId.name;

  const byEmail = players.find((p) => (p.email || "").toLowerCase() === String(key).toLowerCase());
  if (byEmail?.name) return byEmail.name;

  return "-";
}

function getCEOName(game, team) {
  if (!team) return "-";

  // 1) ใช้ leaderName ก่อนเลย ถ้ามี
  if ((team.leaderName || "").trim()) {
    return team.leaderName.trim();
  }

  // 2) fallback: ใช้ leaderPlayerId
  if (team.leaderPlayerId) {
    const byLeaderId = resolvePlayerNameInGame(game, team.leaderPlayerId);
    if (byLeaderId && byLeaderId !== "-") return byLeaderId;
  }

  // 3) fallback: ใช้ leaderEmail
  if ((team.leaderEmail || "").trim()) {
    const byLeaderEmail = resolvePlayerNameInGame(game, team.leaderEmail);
    if (byLeaderEmail && byLeaderEmail !== "-") return byLeaderEmail;
  }

  // 4) fallback: หาใน roles ว่าใครเป็น CEO
  const roles = team.roles || {};
  const ceoEntry = Object.entries(roles).find(([, role]) => role === "CEO");
  if (ceoEntry) {
    const [key] = ceoEntry;
    const byRole = resolvePlayerNameInGame(game, key);
    if (byRole && byRole !== "-") return byRole;
  }

  return "-";
}

function getTeamMemberCount(game, team) {
  if (!game || !team) return 0;

  // ใช้รายชื่อคนจาก Invites ที่สถานะเป็น 'accepted' เป็นหลัก
  const invites = team.invites || [];
  const acceptedMembers = invites.filter((i) => i?.status === "accepted");

  // สร้าง Set เพื่อป้องกันอีเมลซ้ำ (Case-insensitive)
  const uniqEmails = new Set(
    acceptedMembers.map((i) => String(i.email || "").toLowerCase().trim())
  );
  uniqEmails.delete(""); // ลบค่าว่างออกถ้ามี

  // ผลลัพธ์คือ: หัวหน้าทีม (1 คน) + จำนวนสมาชิกที่ยอมรับคำเชิญแล้ว
  return 1 + uniqEmails.size;
}

function isTeamConfirmed(team) {
  if (!team) return false;

  // แบบที่คุณใช้ตอนนี้
  if (!!team.confirmedAt) return true;

  // เผื่อโปรเจกต์เคยใช้ชื่ออื่น
  if (team.isConfirmed === true) return true;
  if (team.confirmed === true) return true;
  if (team.isReady === true) return true;

  // เผื่อเซฟเป็น status string
  const st = String(team.status || "").toLowerCase();
  if (["confirmed", "ready", "done", "final"].includes(st)) return true;

  return false;
}

function getLobbyDurationSec(game) {
  // พยายามอ่านจาก settings ก่อน (ถ้ามี)
  const fromSettings =
    Number(game?.settings?.lobby?.durationSec) ||
    Number(game?.settings?.structure?.lobbyDurationSec);

  if (Number.isFinite(fromSettings) && fromSettings > 0) return fromSettings;

  // fallback: ใช้ค่าเดิมที่คุณเคยตั้ง 9000 (150 นาที)
  return 9000;
}

function ensureLobbyTimingInStorage(games, gameIndex, isHostNow) {
  const g = games[gameIndex];
  if (!g) return games;

  // โครงสร้างที่เราจะใช้เก็บ
  // g.lobby = { startAt, durationSec }
  const existingStartAt = Number(g?.lobby?.startAt);
  const existingDurationSec = Number(g?.lobby?.durationSec);

  const durationSec =
    (Number.isFinite(existingDurationSec) && existingDurationSec > 0)
      ? existingDurationSec
      : getLobbyDurationSec(g);

  // ✅ ให้ “Host เท่านั้น” เป็นคน set startAt ครั้งแรก
  if (!Number.isFinite(existingStartAt) || existingStartAt <= 0) {
    if (isHostNow) {
      g.lobby = {
        ...(g.lobby || {}),
        startAt: Date.now(),
        durationSec,
      };
    } else {
      // ยังไม่มี startAt และเราไม่ใช่ host -> ยังทำอะไรไม่ได้
      g.lobby = {
        ...(g.lobby || {}),
        durationSec,
      };
    }
  } else {
    // มี startAt แล้ว -> แค่ ensure durationSec
    g.lobby = {
      ...(g.lobby || {}),
      startAt: existingStartAt,
      durationSec,
    };
  }

  return games;
}

// Mock Data (ค่อยเปลี่ยนเป็น real ทีละส่วน)
const MOCK_TEAMS = [
    { name: "Coastal Kings", ceo: "Username 1", members: 4, status: "ยืนยัน" },
    { name: "Coastal Queen", ceo: "Username 2", members: 4, status: "ยืนยัน" },
    { name: "Coastal Jack", ceo: "Username 3", members: 4, status: "รอยืนยัน" },
    { name: "Coastal Ace",  ceo: "Username 5", members: 4, status: "ยืนยัน" },
];

function WaitingListPage() {
  const navigate = useNavigate();

  // --- Player/Role ---
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  // --- State ---
  const [isUserReady, setIsUserReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameData, setGameData] = useState(null);
  const isHost = currentRole === "CEO";

  /* =========================
     Load current player + role from real game data
     ========================= */
  useEffect(() => {
    function load() {
        const player = safeParse(localStorage.getItem(PLAYER_SESSION_KEY), null);
        if (!player?.id) {
        setCurrentPlayer(null);
        setCurrentRole(null);
        setGameData(null);
        return;
        }
        setCurrentPlayer(player);

        const activeCode = localStorage.getItem(ACTIVE_GAME_CODE_KEY);
        if (!activeCode) {
        setCurrentRole(null);
        setGameData(null);
        return;
        }

        const games = readGames();
        const game = games.find(
        (g) => (g.code || "").toUpperCase() === (activeCode || "").toUpperCase()
        );

        if (!game) {
        setCurrentRole(null);
        setGameData(null);
        return;
        }

        // ✅ เก็บเกมไว้ใช้ render
        setGameData(game);
        // ✅ Step3: ถ้ายังไม่มี timer ของเกมนี้ ให้ทีมแรกที่เข้ามาตั้งต้น 10 นาที
        ensureTimerInitialized((game.code || "").toUpperCase(), 600);

        // --- หา role จริงจากทีม ---
        const me = (game.players || []).find((p) => p.playerId === player.id);
        if (!me?.teamId) {
        setCurrentRole(null);
        return;
        }

        const team = (game.teams || []).find((t) => t.id === me.teamId);
        if (!team) {
        setCurrentRole(null);
        return;
        }

        const role =
          team.roles?.[player.id] ||
          team.roles?.[player.email] ||
          me.role ||
          null;

        setCurrentRole(role);
        if (activeCode) {
          const code = activeCode.trim().toUpperCase();
          ensureTimerInitialized(code, 600);
        }
    }

    // โหลดครั้งแรก
    load();

    // ✅ ฟัง event ที่โปรเจกต์คุณยิงอยู่แล้ว (คุณเคยมี window.dispatchEvent(new Event("hbs:teams")))
    const onTeams = () => load();
    const onGames = () => load();

    window.addEventListener("hbs:teams", onTeams);
    window.addEventListener("hbs:games", onGames);

    // ✅ กันกรณีเปิดหลายแท็บแล้ว localStorage เปลี่ยน
    window.addEventListener("storage", onGames);

    return () => {
        window.removeEventListener("hbs:teams", onTeams);
        window.removeEventListener("hbs:games", onGames);
        window.removeEventListener("storage", onGames);
    };
  }, []);

  useEffect(() => {
    if (!gameData) return;

    if (gameData.status === "playing" && Number(gameData.currentQuarter) === 1) {
      navigate("/decision", { replace: true });
    }
  }, [gameData, navigate]);

  // ✅ เพิ่มตรงนี้ครับ (ต่อจาก useEffect ตัวโหลดข้อมูลหลัก)
  useEffect(() => {
    const code = (localStorage.getItem(ACTIVE_GAME_CODE_KEY) || "").trim().toUpperCase();
    if (!code) return;

    const syncNow = () => {
      const st = readTimerState(code);
      if (!st) {
        // ถ้ายังไม่มี (กรณี edge) -> init 10 นาที
        ensureTimerInitialized(code, 600);
        const st2 = readTimerState(code);
        if (st2) setTimeLeft(st2.timeLeft);
        return;
      }

      setTimeLeft(st.timeLeft);

      // ✅ หมดเวลา -> ไป HomePage อัตโนมัติ
      if (st.timeLeft <= 0) {
        navigate("/home", { replace: true });
      }
    };

    syncNow();

    // ✅ tick ทุก 1 วิ
    const id = setInterval(syncNow, 1000);

    // ✅ ฟัง event สำหรับแท็บเดียวกัน (Admin กดเพิ่ม/ลด/พัก/เริ่มทันที)
    const onTimer = () => syncNow();
    const onStorage = (e) => {
      if (e.key === TIMER_KEY(code)) syncNow();
    };

    window.addEventListener("hbs:timer", onTimer);
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(id);
      window.removeEventListener("hbs:timer", onTimer);
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  /* =========================
     TIMER
     ========================= */
  const getTimerStatus = (seconds) => {
    if (seconds <= 60 && seconds > 0) return "critical";
    if (seconds <= 120 && seconds > 0) return "warning";
    return "normal";
  };

  const handleConfirmReady = () => {
    if (!currentPlayer?.id || !gameData?.code) return;

    const games = readGames();
    const gameIdx = games.findIndex(
      (g) => (g.code || "").toUpperCase() === (gameData.code || "").toUpperCase()
    );
    if (gameIdx === -1) return;

    const game = games[gameIdx];
    game.players = game.players || [];
    game.teams = game.teams || [];

    const me = game.players.find((p) => p.playerId === currentPlayer.id);
    if (!me?.teamId) return;

    const team = game.teams.find((t) => t.id === me.teamId);
    if (!team) return;

    // 1) mark current player ready
    me.ready = true;
    me.readyAt = new Date().toISOString();

    // 2) หา "สมาชิกทั้งหมดของทีม" แบบจริง
    const acceptedEmails = new Set(
      (team.invites || [])
        .filter((inv) => inv.status === "accepted")
        .map((inv) => String(inv.email || "").trim().toLowerCase())
        .filter(Boolean)
    );

    const teamPlayers = (game.players || []).filter((p) => {
      if (p.teamId !== team.id) return false;

      const pEmail = String(p.email || "").trim().toLowerCase();

      // host หรือ accepted member ที่อยู่ทีมนี้
      return (
        p.playerId === team.leaderPlayerId ||
        acceptedEmails.has(pEmail)
      );
    });

    // 3) ถ้าทุกคน ready แล้ว -> ทีม ready
    const allReady =
      teamPlayers.length > 0 &&
      teamPlayers.every((p) => !!p.ready);

    team.status = allReady ? "ready" : "not_ready";
    team.confirmedAt = allReady ? new Date().toISOString() : null;
    team.isConfirmed = allReady;

    games[gameIdx] = game;
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));

    window.dispatchEvent(new Event("hbs:games"));
    window.dispatchEvent(new Event("hbs:teams"));

    setGameData({ ...game });
    setIsUserReady(true);
  };

  const handleExit = () => {
    if (!window.confirm("คุณต้องการกลับไปแก้ไขรายละเอียดทีมใช่หรือไม่?")) return;

    const pid = currentPlayer?.id;
    const activeCode = localStorage.getItem(ACTIVE_GAME_CODE_KEY);

    if (pid && activeCode) {
      const games = readGames();
      const gameIdx = games.findIndex(
        (g) => (g.code || "").toUpperCase() === activeCode.toUpperCase()
      );

      if (gameIdx !== -1) {
        const game = games[gameIdx];
        const me = game.players?.find((p) => p.playerId === pid);
        const myTeamId = me?.teamId;

        if (myTeamId) {
          const team = game.teams?.find(t => t.id === myTeamId);
          if (team) {
            // 🔥 หัวใจสำคัญ: เปลี่ยนสถานะทีมให้กลับเป็น Draft เพื่อให้หน้า Account ปลดล็อกให้แก้ไข
            team.isDraft = true; 
            // ลบเวลาที่กดยืนยันออก (ถ้ามี)
            delete team.confirmedAt; 
          }
        }

        // บันทึกข้อมูลที่ถูกแก้กลับเป็น Draft ลง Storage
        localStorage.setItem(GAMES_KEY, JSON.stringify(games));
      }
    }

    // 🚩 ลบแค่ Active Code เพื่อให้หน้า Account ถามรหัสใหม่ (หรือจะค้างไว้ก็ได้)
    localStorage.removeItem(ACTIVE_GAME_CODE_KEY);

    // 🚩 สำคัญ: ลบ Draft ส่วนตัวของผู้เล่นเพื่อให้ AccountPage ไปดึงข้อมูลสดจากก้อนใหญ่
    if (pid) {
      localStorage.removeItem(`hbs_account_draft_v1_${pid}`);
    }

    setGameData(null);
    setCurrentRole(null);
  
    // ยิง Event ให้หน้าอื่นรับรู้การเปลี่ยนแปลง (ในแท็บเดียวกัน)
    window.dispatchEvent(new Event("hbs:games"));
    window.dispatchEvent(new Event("hbs:teams"));

    navigate("/account", { replace: true });
  };

  const formatTimeDigits = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (
      <div className="timer-digits-wrapper">
        <div className="digit-card">{m < 10 ? "0" + m : m}</div>
        <span className="timer-colon">:</span>
        <div className="digit-card">{s < 10 ? "0" + s : s}</div>
      </div>
    );
  };

  const teams = useMemo(() => {
    // 1) ยังไม่มี gameData -> โชว์ mock ล้วน
    if (!gameData) {
        return MOCK_TEAMS.map((t, idx) => ({
        rank: idx + 1,
        teamId: `mock_${t.name}`,
        name: t.name,
        captain: t.ceo,
        members: t.members,
        statusText: t.status,
        isUser: false,
        }));
    }

    // หา team ของเรา (เพื่อไม่ให้โดนกรองทิ้ง)
    const me = (gameData.players || []).find(
        (p) => p.playerId === currentPlayer?.id
    );
    const myTeamId = me?.teamId || null;

    // 2) กรองทีม: เอาทีมที่ "confirm แล้ว" หรือ "เป็นทีมเรา" เท่านั้น
    // แก้ไขส่วน filter ใน useMemo
    const filteredTeams = (gameData.teams || []).filter((t) => {
      if (!t || t.isDeleted) return false;

      const isMine = myTeamId && t.id === myTeamId;
      const joined = t.isDraft === false;

      return joined || isMine;
    });

    // 3) map -> row data (✅ members ต้องส่ง t.id)
    const realTeams = filteredTeams.map((t) => {
        const members = getTeamMemberCount(gameData, t);
        const captain = getCEOName(gameData, t);

        const teamName =
        (t.name || "").trim() ||
        (t.teamName || "").trim() ||
        (t.title || "").trim() ||
        "ทีมไม่มีชื่อ";

        const confirmed = isTeamConfirmed(t);

        return {
          teamId: t.id,
          name: teamName,
          captain,
          members,
          confirmedAt: t.confirmedAt
            ? new Date(t.confirmedAt).getTime()
            : (confirmed ? Date.now() : Number.POSITIVE_INFINITY), // ✅ ให้ทีมที่ confirmed แต่ไม่มี confirmedAt ไม่โดนจัดท้ายสุดตลอด
          isUser: false,
          statusText: confirmed ? "ยืนยัน" : "รอยืนยัน",
        };
    });

    // 4) mark ทีมเรา + สถานะตามปุ่มยืนยันของหน้านี้
    const realTeamsMarked = realTeams.map((r) => {
        if (myTeamId && r.teamId === myTeamId) {
        return {
            ...r,
            isUser: true,
            name: `${r.name} (You)`,
            statusText: isUserReady ? "ยืนยัน" : "รอยืนยัน",
        };
        }
        return r;
    });

    // 5) เรียงตาม confirmedAt
    realTeamsMarked.sort(
        (a, b) => (a.confirmedAt || Infinity) - (b.confirmedAt || Infinity)
    );

   return realTeamsMarked.map((t, idx) => ({ ...t, rank: idx + 1 })); 
  }, [gameData, currentPlayer?.id, isUserReady]);

  const gameRules = [
    { icon: <Calendar size={28} />, title: "ระยะเวลาของเกม", desc: "เกมจะเล่นทั้งหมด 12 รอบ", badge: "12 รอบ" },
    { icon: <Clock size={28} />, title: "ระยะเวลาต่อรอบ", desc: "กำหนดเวลาแบ่งในแต่ละรอบคือ 15 นาที", badge: "15 นาที" },
    { icon: <DollarSign size={28} />, title: "เงินสดเริ่มต้น", desc: "เงินสดเริ่มต้นที่ 10,000,000 บาท", badge: "10M", footerIcon: <Zap size={14} />, footerText: "ข้อมูลสำคัญ" },
    { icon: <Sliders size={28} />, title: "การตัดสินใจหลัก", desc: "ควบคุมอัตราค่าห้องพัก, ค่าใช้จ่ายทางการตลาด ฯลฯ", badge: null },
    { icon: <TrendingUp size={28} />, title: "ความผันผวนของตลาด", desc: 'ตั้งค่าเป็น "ปานกลาง" คาดหวังเหตุการณ์ทางเศรษฐกิจแบบสุ่ม', badge: "ปานกลาง" },
    { icon: <AlertTriangle size={28} />, title: "บทลงโทษ", desc: "หากกระแสเงินสดติดลบมากเกินไป ธุรกิจจะล้มละลาย", badge: null, footerIcon: <AlertTriangle size={14} />, footerText: "ข้อควรระวัง", isAlert: true },
  ];

  const scoringCriteria = [
    { title: "ผลการดำเนินงานทางการเงิน", desc: "กำไรสุทธิ, รายได้เฉลี่ยต่อห้อง, ROE", percent: "20%", icon: <CircleDollarSign size={28} /> },
    { title: "ผลการดำเนินงานโดยรวม", desc: "ความพึงพอใจพนักงาน, อัตราการลาออก", percent: "20%", icon: <Building2 size={28} /> },
    { title: "การตลาดและแบรนด์", desc: "ส่วนแบ่งการตลาด, ชื่อเสียงของแบรนด์", percent: "15%", icon: <PieChart size={28} /> },
    { title: "พนักงานและองค์กร", desc: "ความพึงพอใจพนักงาน, การฝึกอบรม", percent: "10%", icon: <Users size={28} /> },
    { title: "การเติบโตและมูลค่าในระยะยาว", desc: "มูลค่าเพิ่มทางเศรษฐศาสตร์, ทรัพย์สิน", percent: "10%", icon: <BarChart3 size={28} /> },
    { title: "ปฏิบัติการและงานบริการ", desc: "ความพึงพอใจลูกค้า, อัตราการเข้าพัก", percent: "15%", icon: <ClipboardList size={28} /> },
    { title: "ความเสี่ยงและวินัยทางการเงิน", desc: "กระแสเงินสด, D/E Ratio", percent: "10%", icon: <AlertTriangle size={28} /> },
  ];

  return (
    <div className="waiting-container">
      {/* Navbar */}
      <nav className="waiting-header">
        <div className="header-left">
          <Building2 size={24} color="#1a1a1a" />
          <span className="header-title">Hotel Business Simulator</span>
        </div>

        <div className="header-right">
          <button
            className={`btn-exit-room ${!isHost ? "btn-disabled" : ""}`}
            onClick={() => {
                if (!isHost) return;
                handleExit(); // ✅ สำคัญ: ต้องล้าง ACTIVE_GAME_CODE + set isDraft ก่อน
            }}
            disabled={!isHost}
            >
            <LogOut size={16} />
            {isHost ? "แก้ไขทีม" : "หัวหน้าทีมเท่านั้น"}
            </button>
          <button className="lang-btn">
            <Globe size={16} /> TH
          </button>

          <div className="user-mini-profile">
            <div className="user-avatar-small">
              <User size={20} />
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentPlayer?.name || "Player"}</span>
              <span className="user-role">{currentRole || "Player"}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="waiting-content">
        {/* --- 1. Session Hero Card --- */}
        <div className="session-hero-card">
          <div className="session-header-left">
            <h2>โปรแกรมจำลองการบริหารธุรกิจโรงแรม</h2>
            <div className="mode-badge-container">
              <span className="mode-badge">{getModeBadgeText(gameData)}</span>
            </div>
            <p className="session-desc">
              ยินดีต้องรับ การก้าวเข้าสู่บทบาทของการเป็นหุ้นส่วนของโรงแรมในเกม การจำลองธุรกิจโรงแรม ภารกิจของคุณ คือการบริหารจัดการโรงแรมของคุณให้สามารถดำเนินธุรกิจได้ ภายใต้สภาวะต่างๆ ที่ตลาดมีการเปลี่ยนแปลงตลอดเวลา การแข่งขันที่ดุเดือด คือกุญแจสำคัญที่จะพาคุณก้าวขึ้นเป็นผู้นำในอุตสาหกรรมโรงแรมในซิมูเลชันที่เดิมพันสูงนี้
            </p>
          </div>

          <div className="session-stats-grid">
            {/* จำนวนรอบการเล่น */}
            <div className="stat-box-white">
            <span className="stat-label">จำนวนรอบการเล่น</span>
            <span className="stat-value">{getTotalRounds(gameData)}</span>
            </div>

            <div className="stat-box-white">
            <span className="stat-label">ผู้ดูแล</span>
            <span className="stat-value">{getAdminName(gameData)}</span>
            </div>

            <div className="stat-box-white">
            <span className="stat-label">ชื่อเกม</span>
            <span className="stat-value">{getGameName(gameData)}</span>
            </div>

            {/* Timer Box */}
            {(() => {
              const status = getTimerStatus(timeLeft);
              let boxClass = "timer-box-normal";
              let iconColor = "#198754";
              let warningText = "โปรดยืนยันก่อนหมดเวลา";

              if (status === "critical") {
                boxClass = "timer-box-critical";
                iconColor = "white";
                warningText = "ถ้าไม่ยืนยันจะถูกตัดออกจากเกมโดยอัตโนมัติ";
              } else if (status === "warning") {
                boxClass = "timer-box-warning";
                iconColor = "#212529";
              }

              return (
                <div className={boxClass}>
                  <div className="timer-info-group">
                    <div className="timer-label-row">
                      <Clock size={22} color={iconColor} />
                      <span className="timer-text-main">เกมจะเริ่มในอีก</span>
                    </div>
                    <span className="timer-sub-text" style={{ whiteSpace: status === "critical" ? "normal" : "nowrap" }}>
                      {warningText}
                    </span>
                  </div>
                  {formatTimeDigits(timeLeft)}
                </div>
              );
            })()}
          </div>
        </div>

        {/* --- 2. Team Table --- */}
        <div className="team-table-card">
          <div className="team-header-row">
            <div className="team-icon-box">
              <Users size={20} color="white" />
            </div>
            <h3>ทีมที่เข้าร่วม</h3>
          </div>

          <div className="custom-table">
            <div className="tbl-head">
              <div>ลำดับที่</div>
              <div>ชื่อทีม</div>
              <div>หัวหน้าทีม</div>
              <div style={{ textAlign: "center" }}>จำนวนผู้เล่น</div>
              <div style={{ textAlign: "center" }}>สถานะ</div>
            </div>

            <div className="tbl-body">
              {teams.map((team, idx) => {
                const statusText = team.statusText;
                const statusClass = statusText === "ยืนยัน" ? "status-text-green" : "status-text-yellow";
                const rowBgClass = team.isUser ? "row-bg-user" : idx % 2 === 0 ? "row-bg-white" : "row-bg-gray";

                return (
                  <div key={idx} className={`tbl-row ${rowBgClass}`}>
                    <div>{team.rank}</div>
                    <div>{team.name}</div>
                    <div>{team.captain}</div>
                    <div style={{ textAlign: "center" }}>{team.members}</div>
                    <div style={{ textAlign: "center" }} className={statusClass}>
                      {statusText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="table-footer-action">
            <button className="btn-confirm-action" onClick={handleConfirmReady} disabled={isUserReady}>
              {isUserReady ? "ยืนยันเรียบร้อย" : "ยืนยัน"}
            </button>
          </div>
        </div>

        {/* --- 3. Rules Section --- */}
        <div className="rules-main-card">
          <div className="rules-card-header">
            <div className="rules-header-left">
              <div className="rules-icon-main">
                <BookOpen size={24} color="white" />
              </div>
              <div className="rules-text-group">
                <h3>รายละเอียดและกติกาเกม</h3>
                <span>ทำความเข้าใจกฎเกณฑ์และโครงสร้างของเกม</span>
              </div>
            </div>
            <button className="btn-outline-green">
              <BookOpen size={16} style={{ marginRight: "5px" }} /> ดูหนังสือคู่มือกติกาฉบับเต็ม
            </button>
          </div>

          <div className="rules-grid">
            {gameRules.map((rule, idx) => (
              <div key={idx} className="rule-card-modern">
                <div className="rule-card-top">
                  <div className="rule-icon-box">{rule.icon}</div>
                  <div className="rule-info">
                    <div className="rule-header-row">
                      <h4>{rule.title}</h4>
                      {rule.badge && <span className="rule-badge">{rule.badge}</span>}
                    </div>
                    <p>{rule.desc}</p>
                  </div>
                </div>
                {rule.footerText && (
                  <div className={`rule-footer ${rule.isAlert ? "text-alert" : "text-success"}`}>
                    {rule.footerIcon}
                    <span>{rule.footerText}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. Scoring Criteria Section --- */}
        <div className="scoring-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="rules-icon-main" style={{ backgroundColor: "#198754" }}>
              <ClipboardList size={24} color="white" />
            </div>
            <h3>เกณฑ์การให้คะแนน</h3>
          </div>

          <div className="scoring-note">
            <strong>เงื่อนไขการชนะ:</strong> ทีมที่มีคะแนนรวมสูงสุดเมื่อจบรอบสุดท้าย จะถูกประกาศให้เป็นผู้ชนะ <br />
            <strong>คำใบ้กลยุทธ์สำคัญ:</strong> ในขณะที่ความพึงพอใจของแขกและส่วนแบ่งการตลาดมีความสำคัญในการขับเคลลื่อนรายได้ การตัดสินใจอย่างสม่ำเสมอที่ช่วยเพิ่มมูลค่าสินทรัพย์รวมของคุณ คือเส้นทางที่ตรงที่สุดสู่ชัยชนะ
          </div>

          <div className="scoring-grid">
            {scoringCriteria.map((item, index) => (
              <div key={index} className="score-box-modern">
                <div className="score-icon-box">{item.icon}</div>
                <div className="score-text-info">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
                <div className="score-percent-badge">{item.percent}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default WaitingListPage;