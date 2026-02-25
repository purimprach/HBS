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
  const roles = team?.roles || {};
  const ceoEntry = Object.entries(roles).find(([, role]) => role === "CEO");
  if (!ceoEntry) return "-";
  const [key] = ceoEntry; // key = playerId หรือ email
  return resolvePlayerNameInGame(game, key);
}

function getTeamMemberCount(game, team) {
  if (!game || !team) return 0;

  // 1) ทางหลัก: นับจาก game.players ที่ผูก teamId (ถ้ามีข้อมูล)
  const players = game.players || [];
  const byPlayers = players.filter((p) => p.teamId === team.id);

  if (byPlayers.length > 0) {
    // unique เผื่อข้อมูลซ้ำ
    const uniq = new Set(
      byPlayers.map((p) => String(p.playerId || p.email || "").toLowerCase())
    );
    uniq.delete(""); // กันค่าว่าง
    return uniq.size;
  }

  // 2) fallback: ถ้ามี team.members
  if (Array.isArray(team.members) && team.members.length > 0) {
    const uniq = new Set(
      team.members.map((m) => String(m.playerId || m.email || m || "").toLowerCase())
    );
    uniq.delete("");
    return uniq.size;
  }

  // 3) fallback: นับจาก invites ที่ accepted + 1 (หัวหน้าทีม)
  const invites = team.invites || [];
  const accepted = invites.filter((i) => i?.status === "accepted");

  const uniqEmails = new Set(
    accepted.map((i) => String(i.email || "").toLowerCase())
  );
  uniqEmails.delete("");

  // +1 เผื่อหัวหน้าทีม (คุณ) ที่มักไม่ได้อยู่ใน invites
  return 1 + uniqEmails.size;
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
  const [timeLeft, setTimeLeft] = useState(9000);
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

  // ✅ เพิ่มตรงนี้ครับ (ต่อจาก useEffect ตัวโหลดข้อมูลหลัก)
  useEffect(() => {
  if (!gameData || !currentPlayer?.id) return;

  // 1. หาว่าเราอยู่ทีมไหน
  const me = (gameData.players || []).find(p => p.playerId === currentPlayer.id);
  if (!me?.teamId) return;

  const myTeam = (gameData.teams || []).find(t => t.id === me.teamId);

  // 🚩 ถ้า CEO ปลดล็อกทีมให้กลับเป็น Draft (isDraft === true)
  // หรือถ้า CEO ลบทีมทิ้ง (myTeam หายไป)
  if (!myTeam || myTeam.isDraft === true) {
    // ล้างรหัสเกมที่ค้างไว้
    localStorage.removeItem("hbs_active_game_code_v1");
    
    // พาเด้งออกไปหน้า Account ทันที
    navigate("/account", { replace: true });
    
    // แจ้งเตือนสั้นๆ
    if (myTeam?.isDraft) {
      alert("หัวหน้าทีมกำลังแก้ไขรายละเอียดทีม ระบบจะพาคุณกลับไปหน้าตั้งค่า");
    }
  }
  }, [gameData, currentPlayer?.id, navigate]);

  /* =========================
     TIMER
     ========================= */
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      navigate("/home");
    }
  }, [timeLeft, navigate]);

  const getTimerStatus = (seconds) => {
    if (seconds <= 60 && seconds > 0) return "critical";
    if (seconds <= 120 && seconds > 0) return "warning";
    return "normal";
  };

  const handleConfirmReady = () => {
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
    
    // ยิง Event ให้หน้า Account รับรู้การเปลี่ยนแปลง
    window.dispatchEvent(new Event("storage"));
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
    const filteredTeams = (gameData.teams || []).filter((t) => {
        const isMine = myTeamId && t.id === myTeamId;
        const isConfirmed = !!t.confirmedAt;
        return isConfirmed || isMine;
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

        return {
        teamId: t.id,
        name: teamName,
        captain,
        members,
        confirmedAt: t.confirmedAt
            ? new Date(t.confirmedAt).getTime()
            : Number.POSITIVE_INFINITY,
        isUser: false,
        statusText: t.confirmedAt ? "ยืนยัน" : "รอยืนยัน",
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

    // 6) เติม mock ให้ครบ 5
    const usedNames = new Set(
        realTeamsMarked.map((x) => x.name.replace(" (You)", ""))
    );

    const mockRows = MOCK_TEAMS.filter((m) => !usedNames.has(m.name)).map((m) => ({
        teamId: `mock_${m.name}`,
        name: m.name,
        captain: m.ceo,
        members: m.members,
        confirmedAt: Number.POSITIVE_INFINITY,
        isUser: false,
        statusText: m.status,
    }));

    const combined = [...realTeamsMarked, ...mockRows].slice(0, 5);

    return combined.map((t, idx) => ({ ...t, rank: idx + 1 }));
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