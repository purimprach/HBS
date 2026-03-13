import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Copy,
  Wifi,
  Pause,
  Play,
  Plus,
  Minus,
  XCircle,
  Search,
  Trash2,
  Clock,
  DollarSign,
  Trophy,
  MapPin,
  Lock,
  AlertTriangle,
  X,
  Calendar,
  Check,
} from "lucide-react";
import "./AdminLobbyPage.css";

const GAMES_KEY = "hbs_games";
const ADMIN_SESSION_KEY = "hbs_current_admin";

// ✅ ทีมของแต่ละเกม แยกตาม code
const TEAMS_KEY = (code) => `hbs_teams_${normCode(code)}`;

// ✅ Timer ของแต่ละเกม
const normCode = (s) => String(s || "").trim().toUpperCase();
const TIMER_KEY = (code) => `hbs_timer_${normCode(code)}`;

function readTimerState(code) {
  const key = TIMER_KEY(code);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const st = safeParse(raw, null);
  if (!st) return null;

  const timeLeft = Number(st.timeLeft) || 0;
  const isRunning = !!st.isRunning;
  const lastUpdated = Number(st.lastUpdated) || Date.now();

  if (isRunning) {
    const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
    return { timeLeft: Math.max(0, timeLeft - elapsed), isRunning, lastUpdated };
  }
  return { timeLeft, isRunning, lastUpdated };
}

function ensureTimerInitialized(code, defaultSeconds = 600) {
  const key = TIMER_KEY(code);
  if (localStorage.getItem(key)) return;

  localStorage.setItem(
    key,
    JSON.stringify({
      timeLeft: defaultSeconds,
      isRunning: false,     // ✅ หยุดไว้ก่อนเสมอ
      lastUpdated: Date.now(),
    })
  );
  window.dispatchEvent(new Event("hbs:timer"));
}

function startTimerIfPaused(code) {
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

function safeParse(raw, fallback) {
  try {
    const x = JSON.parse(raw);
    return x == null ? fallback : x;
  } catch {
    return fallback;
  }
}

function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

export default function AdminLobbyPage() {
  const { gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState(null);

  // ==================== Admin guard ====================
  const admin = useMemo(() => {
    return safeParse(localStorage.getItem(ADMIN_SESSION_KEY), null);
  }, []);
  const adminEmail = normalizeEmail(admin?.email);

  // ==================== Teams (Real) ====================
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const code = normCode(gameCode);
    if (!code) return;
    ensureTimerInitialized(code, 600);
  }, [gameCode]);

  const readTeamsFromStorage = () => {
    const teamsKey = TEAMS_KEY(normCode(gameCode));

    // ===== 0) CLEAN orphan ใน hbs_teams_<code> โดยอิง hbs_games =====
    const games = safeParse(localStorage.getItem(GAMES_KEY), []);
    const g = (Array.isArray(games) ? games : []).find((x) => x.code === gameCode);

    const validIds = new Set(
        (g?.teams || [])
            .filter((t) => !t?.isDeleted)   // ✅ ไม่เอาทีมที่ถูกลบ
            .map((t) => t.id)
    );
    const list = safeParse(localStorage.getItem(teamsKey), []);
    const arr = Array.isArray(list) ? list : [];

    // ลบทีมที่ไม่มีอยู่ใน hbs_games แล้ว (orphan)
    const cleaned = arr.filter((t) => validIds.has(t?.id));
    if (cleaned.length !== arr.length) {
        localStorage.setItem(teamsKey, JSON.stringify(cleaned));
    }
    
    // ===== 1) ทีมจริงจาก hbs_games เป็นหลัก =====
    const teamsFromGame = (Array.isArray(g?.teams) ? g.teams : [])
      .filter((t) => !t?.isDeleted)
      .map((t, idx) => ({
        id: t.id ?? `team_${idx}`,
        name: (t.name && String(t.name).trim()) ? t.name : `Team ${idx + 1}`,

        // ✅ แยก 2 เรื่องออกจากกัน
        isJoined: t.isDraft === false,         // Host กด OK แล้ว
        isConfirmed: t.status === "ready",     // สมาชิกใน WaitingPage กดยืนยันครบแล้ว

        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

    // ===== 2) fallback จาก hbs_teams_<code> เฉพาะกรณีไม่มีใน g.teams =====
    const realTeams = cleaned
      .filter((t) => !teamsFromGame.some((x) => x.id === t.id))
      .map((t, idx) => ({
        id: t.id ?? `team_${idx}`,
        name: t.name ?? `Team ${idx + 1}`,
        isJoined: true,
        isConfirmed: t.status === "ready",
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

    // ===== 3) merge โดยใช้ hbs_games เป็นหลัก =====
    return [...teamsFromGame, ...realTeams];
    };

  // ✅ listen teams updates (WaitingPage ควร dispatch Event("hbs:teams"))
  useEffect(() => {
    const sync = () => setTeams(readTeamsFromStorage());

    sync(); // initial

    const onStorage = (e) => {
        if (e.key === TEAMS_KEY(gameCode) || e.key === GAMES_KEY) sync();
    };

    const onCustom = () => sync();

    window.addEventListener("storage", onStorage);
    window.addEventListener("hbs:teams", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("hbs:teams", onCustom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode]);

  useEffect(() => {
    const code = normCode(gameCode);
    if (!code) return;

    const checkAndStart = () => {
      const realList = safeParse(localStorage.getItem(TEAMS_KEY(code)), []);
      const realCount = Array.isArray(realList) ? realList.length : 0;

      if (realCount >= 1) {
        startTimerIfPaused(code);
      }
    };

    const onStorage = (e) => {
      if (e.key === TEAMS_KEY(code)) checkAndStart();
    };

    checkAndStart();

    window.addEventListener("hbs:teams", checkAndStart);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("hbs:teams", checkAndStart);
      window.removeEventListener("storage", onStorage);
    };
  }, [gameCode]);

  // ==================== Load Game Data ====================
  useEffect(() => {
    // 1) from route state (เร็ว)
    if (location.state?.gameData) {
      setGameData(location.state.gameData);
      return;
    }

    // 2) from localStorage by code
    const savedGames = safeParse(localStorage.getItem(GAMES_KEY), []);
    const found = (Array.isArray(savedGames) ? savedGames : []).find(
      (g) => g.code === gameCode
    );

    if (found) setGameData(found);
  }, [gameCode, location.state]);

  useEffect(() => {
    if (!gameCode) return;

    // อ่านเกมล่าสุดจาก hbs_games
    const games = safeParse(localStorage.getItem(GAMES_KEY), []);
    const game = (Array.isArray(games) ? games : []).find((g) => g.code === gameCode);
    if (!game) return;

    const validIds = new Set(
      (game.teams || [])
          .filter((t) => !t?.isDeleted)   // ✅ ไม่เอาทีมที่ถูกลบ
          .map((t) => t.id)
    );
    const key = TEAMS_KEY(gameCode);

    const list = safeParse(localStorage.getItem(key), []);
    const arr = Array.isArray(list) ? list : [];

    // ลบทีมที่ไม่มีอยู่ใน hbs_games แล้ว (พวก orphan ที่ค้างจากอดีต)
    const cleaned = arr.filter((t) => validIds.has(t.id));

    if (cleaned.length !== arr.length) {
      localStorage.setItem(key, JSON.stringify(cleaned));
      window.dispatchEvent(new Event("hbs:teams"));
    }
  }, [gameCode]);

  // ✅ Guard: ต้อง login + ต้องเป็นเจ้าของเกม
  useEffect(() => {
    if (!adminEmail) {
      navigate("/admin-login", { replace: true });
      return;
    }

    if (!gameData) return;

    const owner = normalizeEmail(gameData.ownerAdminEmail);
    if (owner && owner !== adminEmail) {
      alert("คุณไม่มีสิทธิ์เข้าถึงเกมนี้");
      navigate("/admin/active-games", { replace: true });
    }
  }, [adminEmail, gameData, navigate]);

  // ==================== Timer Logic ====================
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(TIMER_KEY(gameCode));
    if (saved) {
      try {
        const { timeLeft, isRunning, lastUpdated } = JSON.parse(saved);
        if (isRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - lastUpdated) / 1000);
          return Math.max(0, timeLeft - elapsed);
        }
        return timeLeft;
      } catch {
        return 600;
      }
    }
    return 600;
  });

  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const saved = localStorage.getItem(TIMER_KEY(gameCode));
    if (saved) {
      try {
        return JSON.parse(saved).isRunning;
      } catch {
        return false;
      }
    }
    return false;
  });

  // ✅ ✅ วาง useEffect SYNC TIMER ตรงนี้เลย
  useEffect(() => {
    const code = normCode(gameCode);
    if (!code) return;

    const syncNow = () => {
      const st = readTimerState(code);
      if (!st) {
        ensureTimerInitialized(code, 600);
        const st2 = readTimerState(code);
        if (st2) {
          setTimeLeft(st2.timeLeft);
          setIsTimerRunning(st2.isRunning);
        }
        return;
      }
      setTimeLeft(st.timeLeft);
      setIsTimerRunning(st.isRunning);
    };

    syncNow();

    const onTimer = () => syncNow();
    const onStorage = (e) => {
      if (e.key === TIMER_KEY(code)) syncNow();
    };

    window.addEventListener("hbs:timer", onTimer);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("hbs:timer", onTimer);
      window.removeEventListener("storage", onStorage);
    };
  }, [gameCode]);

 useEffect(() => {
  const code = normCode(gameCode);
  if (!code) return;

  if (!isTimerRunning) return;

  const interval = setInterval(() => {
    const st = readTimerState(code);
    if (!st) return;

    setTimeLeft(st.timeLeft);
    setIsTimerRunning(st.isRunning);

    if (st.timeLeft <= 0) {
      localStorage.setItem(
        TIMER_KEY(code),
        JSON.stringify({
          timeLeft: 0,
          isRunning: false,
          lastUpdated: Date.now(),
        })
      );
      window.dispatchEvent(new Event("hbs:timer"));
    }
  }, 1000);

  return () => clearInterval(interval);
}, [isTimerRunning, gameCode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const adjustTime = (minutes) => {
  const code = normCode(gameCode);
  const st = readTimerState(code) || { timeLeft, isRunning: isTimerRunning, lastUpdated: Date.now() };

  const newVal = Math.max(0, Number(st.timeLeft) + minutes * 60);

  localStorage.setItem(
    TIMER_KEY(code),
    JSON.stringify({
      timeLeft: newVal,
      isRunning: !!st.isRunning,
      lastUpdated: Date.now(),
    })
  );
  window.dispatchEvent(new Event("hbs:timer"));
  };

  const toggleTimer = () => {
    const code = normCode(gameCode);
    const st = readTimerState(code) || { timeLeft, isRunning: isTimerRunning, lastUpdated: Date.now() };

    const newStatus = !st.isRunning;

    localStorage.setItem(
      TIMER_KEY(code),
      JSON.stringify({
        timeLeft: Number(st.timeLeft) || 0,
        isRunning: newStatus,
        lastUpdated: Date.now(),
      })
    );
    window.dispatchEvent(new Event("hbs:timer"));
  };

  // ==================== Copy Feedback ====================
  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (readyTeams.length < 2) {
      alert("ต้องมีอย่างน้อย 2 ทีมที่พร้อมแล้ว จึงจะเริ่มเกมได้");
      return;
    }

    const games = safeParse(localStorage.getItem(GAMES_KEY), []);
    const index = games.findIndex((g) => g.code === gameCode);

    if (index === -1) return;

    // เปลี่ยนสถานะเกม
    games[index].status = "playing";
    games[index].currentQuarter = 1;
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    window.dispatchEvent(new Event("hbs:games"));

    alert("เริ่มเกมเรียบร้อยแล้ว!");
    navigate("/admin/active-games", { replace: true });
  };

  // ==================== End Game Modal Logic ====================
  const [showEndModal, setShowEndModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  const handleEndGameClick = () => {
    setShowEndModal(true);
    setConfirmCode("");
  };

  const handleConfirmEndGame = () => {
    if (confirmCode === gameData.code) {
      const savedGames = safeParse(localStorage.getItem(GAMES_KEY), []);
      const newGames = (Array.isArray(savedGames) ? savedGames : []).filter(
        (g) => g.code !== gameData.code
      );
      localStorage.setItem(GAMES_KEY, JSON.stringify(newGames));

      localStorage.removeItem(TIMER_KEY(gameCode));
      localStorage.removeItem(TEAMS_KEY(gameCode)); // ✅ ล้างทีมเกมนี้

      alert("จบเกมเรียบร้อย! ข้อมูลถูกลบแล้ว");
      navigate("/admin/game-settings", { replace: true });
    } else {
      alert("รหัสยืนยันไม่ถูกต้อง");
    }
  };

// ==================== Delete Team (REAL) ====================
const deleteTeamHard = (teamId) => {
    if (!teamId || !gameCode) return;

    const ok = window.confirm("ยืนยันลบทีมนี้ถาวร?");
    if (!ok) return;

    // =========================
    // 1) update hbs_games
    // =========================
    const games = safeParse(localStorage.getItem(GAMES_KEY), []);
    const gi = games.findIndex((g) => g.code === gameCode);

    if (gi !== -1) {
        const game = games[gi];

        game.teams = (game.teams || []).map((t) =>
        t?.id === teamId
            ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() }
            : t
        );

        game.players = (game.players || []).map((p) =>
        p?.teamId === teamId ? { ...p, teamId: null } : p
        );

        games[gi] = game;
        localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    }

    // =========================
    // 2) update hbs_teams_<code>
    // =========================
    const tKey = TEAMS_KEY(gameCode);
    const list = safeParse(localStorage.getItem(tKey), []);
    const newArr = (Array.isArray(list) ? list : []).filter((t) => t?.id !== teamId);
    localStorage.setItem(tKey, JSON.stringify(newArr));

    // =========================
    // 🔥 3) แจ้งทุกหน้าให้ sync ทันที
    // =========================
    window.dispatchEvent(new Event("hbs:games"));
    window.dispatchEvent(new Event("hbs:teams"));

    // refresh lobby UI
    setTeams(readTeamsFromStorage());
};

  if (!adminEmail) return null;
  if (!gameData) return <div className="p-10 text-center">กำลังโหลดข้อมูลห้อง...</div>;

  // ==================== Team lists ====================
  // ✅ คอลัมน์ซ้าย = Host กด OK แล้ว (เข้าห้องรอแล้ว)
  // ✅ คอลัมน์ขวา = ยังเป็น draft อยู่
  const readyTeamsReal = teams.filter((t) => t.isJoined);
  const notReadyTeamsReal = teams.filter((t) => !t.isJoined);

  // ✅ mock ไว้ฝั่งละ 1 ทีม “เมื่อไม่มีทีมจริง”
  const readyTeams = readyTeamsReal;
  const notReadyTeams = notReadyTeamsReal;

  // ✅ นับ “ตามที่แสดง” (รวม mock)
  const displayTeams = [...readyTeams, ...notReadyTeams];
  const displayReadyCount = readyTeams.length;
  const displayTotalCount = displayTeams.length;

  const getScoringDominant = () => {
    const s = gameData.settings.scoring;
    const maxKey = Object.keys(s).reduce((a, b) => (s[a] > s[b] ? a : b));
    const labelMap = {
      overall: "เน้นภาพรวม",
      financial: "เน้นกำไรสุทธิ",
      market: "เน้นส่วนแบ่งตลาด",
      operations: "เน้นการบริการ",
      people: "เน้นบุคลากร",
      risk: "เน้นความเสี่ยง",
      growth: "เน้นการเติบโต",
    };
    return labelMap[maxKey] || "แบบผสมผสาน";
  };

  const getLocationName = (loc) => {
    const map = {
      bangkok: "โรงแรมในกรุงเทพฯ",
      chiangmai: "โรงแรมที่เชียงใหม่",
      phuket: "โรงแรมที่ภูเก็ต",
      khonkaen: "โรงแรมที่ขอนแก่น",
    };
    return map[loc] || loc;
  };

  const getGameModeLabel = () => {
    const { mode } = gameData.settings;
    if (mode.type === "single") return "โหมดผู้เล่นคนเดียว";
    if (mode.type === "team") return `โหมดเล่นแบบทีม ${mode.teamSize} คน`;
    if (mode.type === "other") return `โหมดผู้เล่น ${mode.minTeams} - ${mode.maxTeams} คน`;
    return "โหมดไม่ระบุ";
  };

  const getStartingMoneyInfo = () => {
    const { scenario } = gameData.settings.info;
    if (scenario === "growth") return { text: "-15,000,000 บาท", isNegative: true };
    if (scenario === "crisis") return { text: "30,000,000 บาท", isNegative: false };
    return { text: "10,000,000 บาท", isNegative: false };
  };

  const moneyInfo = getStartingMoneyInfo();

  return (
    <div className="lobby-page">
      {/* 1. Header Card */}
      <div className="lobby-header-card">
        <div className="lhc-left">
          <h2 className="lhc-title">เซสชันเกม: {gameData.name}</h2>
          <span className="lhc-badge">{getGameModeLabel()}</span>
        </div>
        <div className="lhc-right">
          <span>
            โค้ดเกม: <strong>{gameData.code}</strong>
          </span>
          <button className="btn-icon-sm" onClick={handleCopyCode} title="คัดลอกรหัส">
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="lobby-control-bar">
        <div className="lcb-timer">
          <span className="timer-label">เวลานับถอยหลัง</span>
          <span className={`timer-value ${timeLeft < 60 ? "text-danger" : ""}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="lcb-connection">
          <Wifi size={18} className="text-green-500" />
          {/* ✅ นับตามที่แสดง (รวม mock) */}
          <span>
            การเชื่อมต่อ: {displayTotalCount}/{gameData?.settings?.mode?.maxTeams ?? 10}
          </span>
        </div>

        <div className="lcb-actions">
          <button
            className={`btn-control btn-fixed-width ${isTimerRunning ? "btn-pause" : "btn-play"}`}
            onClick={toggleTimer}
          >
            {isTimerRunning ? (
              <>
                <Pause size={18} /> หยุดชั่วคราว
              </>
            ) : (
              <>
                <Play size={18} /> เล่นต่อ
              </>
            )}
          </button>
          <button className="btn-control btn-add" onClick={() => adjustTime(1)}>
            <Plus size={18} /> เพิ่มเวลา
          </button>
          <button className="btn-control btn-reduce" onClick={() => adjustTime(-1)}>
            <Minus size={18} /> ลดเวลา
          </button>
          <button className="btn-control btn-end" onClick={handleEndGameClick}>
            <XCircle size={18} /> จบเกม
          </button>
        </div>
      </div>

      {/* 3. Main Content Layout */}
      <div className="lobby-layout">
        {/* Left Side Container */}
        <div className="monitor-section-wrapper" style={{ flex: 1 }}>
          <div className="lobby-monitor-section">
            <div className="monitor-header-row">
              <div className="monitor-title-wrap">
                <h3 className="monitor-title">มอนิเตอร์ผู้เล่น</h3>
                {/* ✅ นับตามที่แสดง (รวม mock) */}
                <span className="status-text">
                  {displayReadyCount}/{displayTotalCount} ทีมพร้อมแล้ว
                </span>
              </div>

              <div className="monitor-tools">
                <div className="search-pill">
                  <Search size={16} />
                  <input type="text" placeholder="ค้นหาทีม (demo UI)" />
                </div>
              </div>
            </div>

            <div className="monitor-grid">
              {/* Green Column (Ready) */}
              <div className="monitor-col col-bg-green">
                <div className="col-header header-solid-green">
                  <span>ทีมที่พร้อมแล้ว</span>
                  {/* ✅ นับตามที่แสดง (รวม mock) */}
                  <span className="circle-badge">{readyTeams.length}</span>
                </div>

                <div className="col-content">
                  {readyTeams.length === 0 ? (
                    <div className="empty-state-text">ยังไม่มีทีมที่พร้อม</div>
                  ) : (
                    readyTeams.map((team, index) => (
                      <div className="team-card-clean" key={team.id}>
                        <div className="tcc-top">
                          <div className="tcc-name-wrap">
                            <span className="tcc-name">
                              {index + 1}. {team.name}
                            </span>

                            <span className={team.isConfirmed ? "team-ready-badge" : "team-wait-badge"}>
                              {team.isConfirmed ? "ยืนยันแล้ว" : "รอยืนยัน"}
                            </span>
                          </div>

                          <button
                            className="btn-card-del"
                            type="button"
                            title="ลบทีมถาวร"
                            onClick={() => deleteTeamHard(team.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="tcc-actions">
                          <button className="btn-pill" type="button">
                            แก้ไขทีม
                          </button>
                          <button className="btn-pill" type="button">
                            ส่งข้อความ
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Yellow Column (Not Ready) */}
              <div className="monitor-col col-bg-yellow">
                <div className="col-header header-solid-yellow">
                  <span>ทีมที่ยังไม่พร้อม</span>
                  {/* ✅ นับตามที่แสดง (รวม mock) */}
                  <span className="circle-badge">{notReadyTeams.length}</span>
                </div>

                <div className="col-content">
                  {notReadyTeams.length === 0 ? (
                    <div className="empty-state-text">ไม่มีทีมที่รออยู่</div>
                  ) : (
                    notReadyTeams.map((team, index) => (
                      <div className="team-card-clean" key={team.id}>
                        <div className="tcc-top">
                          <span className="tcc-name">
                            {index + 1}. {team.name}
                          </span>
                          <button
                            className="btn-card-del"
                            type="button"
                            title="ลบทีมถาวร"
                            onClick={() => deleteTeamHard(team.id)}
                            >
                            <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="tcc-actions">
                          <button className="btn-pill" type="button">
                            แก้ไขทีม
                          </button>
                          <button className="btn-pill" type="button">
                            ส่งข้อความ
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="monitor-bottom-row">
            <button className="btn-outline-green" onClick={() => navigate("/admin/active-games")}>
              รายการเกมทั้งหมด
            </button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                className={`btn-start-floating ${readyTeams.length < 2 ? "btn-disabled-look" : ""}`}
                type="button"
                onClick={handleStartGame}
                disabled={readyTeams.length < 2}
              >
                <span>เริ่มทันที</span>
                <Play size={18} fill="currentColor" />
              </button>

              {readyTeams.length < 2 && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#6B7280"
                  }}
                >
                  ต้องมีอย่างน้อย 2 ทีมที่พร้อมแล้ว
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lobby-details-section">
          <h3 className="details-title">รายละเอียดเกม</h3>

          <div className="detail-item-box">
            <div className="di-label">จำนวนรอบ</div>
            <div className="di-value">
              <Calendar size={18} /> {gameData.settings.structure.totalQuarters} รอบ
            </div>
          </div>

          <div className="detail-item-box">
            <div className="di-label">จำนวนเวลาต่อรอบ</div>
            <div className="di-value">
              <Clock size={18} /> {gameData.settings.structure.minutesPerRound} นาที
            </div>
          </div>

          <div className="detail-item-box">
            <div className="di-label">เงินเริ่มต้น</div>
            <div className={`di-value ${moneyInfo.isNegative ? "text-money-negative" : ""}`}>
              <DollarSign size={18} /> {moneyInfo.text}
            </div>
          </div>

          <div className="detail-item-box">
            <div className="di-label">ชื่อ Scenario</div>
            <div className="di-value">
              <MapPin size={18} /> {getLocationName(gameData.settings.info.location)}
            </div>
          </div>

          <div className="detail-item-box">
            <div className="di-label">เกณฑ์การให้คะแนน</div>
            <div className="di-value">
              <Trophy size={18} /> {getScoringDominant()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header-danger">
              <div className="mh-content">
                <div className="mh-icon-box">
                  <Lock size={20} />
                </div>
                <span>ยืนยันการจบเกม</span>
              </div>
              <button className="btn-close-modal" onClick={() => setShowEndModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="warning-box">
                <AlertTriangle size={20} className="text-warning" />
                <span className="warning-text">
                  <strong>คำเตือน</strong> หากยืนยันข้อมูลทั้งหมดในเกมนี้จะถูกลบและไม่สามารถย้อนกลับได้
                </span>
              </div>

              <div className="modal-field">
                <label>กรอกโค้ดเกมเพื่อยืนยัน</label>
                <input
                  type="text"
                  placeholder="โค้ดเกม"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  className={confirmCode && confirmCode !== gameData.code ? "input-error" : ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && confirmCode === gameData.code) {
                      handleConfirmEndGame();
                    }
                  }}
                />
                <div className="modal-hint">โค้ดปัจจุบัน: {gameData.code}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowEndModal(false)}>
                ยกเลิก
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleConfirmEndGame}
                disabled={confirmCode !== gameData.code}
              >
                ยืนยันจบเกม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
