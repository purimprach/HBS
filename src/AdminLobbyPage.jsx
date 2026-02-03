import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { 
  Copy, Wifi, Pause, Play, Plus, Minus, XCircle, Search, 
  Trash2, Clock, DollarSign, Trophy, MapPin, Lock, AlertTriangle, X, Calendar, Check
} from "lucide-react"; 
import "./AdminLobbyPage.css";

export default function AdminLobbyPage() {
  const { gameCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState(null);
  
  // Mock Data ทีม
  const [teams, setTeams] = useState([
    { id: 1, name: "The Grand Hoteliers", status: "ready" },
    { id: 2, name: "Hospitality Heroes", status: "ready" },
    { id: 3, name: "Suite Success", status: "ready" },
    { id: 4, name: "The Inn Crowd", status: "not_ready" },
    { id: 5, name: "Stay Savvy", status: "not_ready" },
  ]);

  // ==================== 1. Timer Logic (Optimized) ====================
  const TIMER_KEY = `hbs_timer_${gameCode}`;

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (saved) {
        try {
            const { timeLeft, isRunning, lastUpdated } = JSON.parse(saved);
            if (isRunning) {
                const now = Date.now();
                const elapsed = Math.floor((now - lastUpdated) / 1000);
                return Math.max(0, timeLeft - elapsed);
            }
            return timeLeft;
        } catch (e) { return 600; }
    }
    return 600;
  });

  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (saved) {
        try { return JSON.parse(saved).isRunning; } catch (e) { return true; }
    }
    return true;
  });

  useEffect(() => {
    let interval = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 0) {
                clearInterval(interval);
                return 0;
            }
            const newVal = prev - 1;
            localStorage.setItem(TIMER_KEY, JSON.stringify({
                timeLeft: newVal, isRunning: true, lastUpdated: Date.now()
            }));
            return newVal;
        });
      }, 1000);
    } else {
        localStorage.setItem(TIMER_KEY, JSON.stringify({
            timeLeft: timeLeft, isRunning: false, lastUpdated: Date.now()
        }));
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const adjustTime = (minutes) => {
    setTimeLeft((prev) => {
        const newVal = Math.max(0, prev + (minutes * 60));
        localStorage.setItem(TIMER_KEY, JSON.stringify({
            timeLeft: newVal, isRunning: isTimerRunning, lastUpdated: Date.now()
        }));
        return newVal;
    });
  };

  const toggleTimer = () => {
    const newStatus = !isTimerRunning;
    setIsTimerRunning(newStatus);
    localStorage.setItem(TIMER_KEY, JSON.stringify({
        timeLeft: timeLeft, isRunning: newStatus, lastUpdated: Date.now()
    }));
  };

  // ==================== 2. UX: Copy Feedback ====================
  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
      navigator.clipboard.writeText(gameData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // ==================== 3. End Game Modal Logic ====================
  const [showEndModal, setShowEndModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  const handleEndGameClick = () => { setShowEndModal(true); setConfirmCode(""); };

  const handleConfirmEndGame = () => {
    if (confirmCode === gameData.code) {
       const savedGames = JSON.parse(localStorage.getItem("hbs_games") || "[]");
       const newGames = savedGames.filter(g => g.code !== gameData.code);
       localStorage.setItem("hbs_games", JSON.stringify(newGames));
       localStorage.removeItem(TIMER_KEY);
       alert("จบเกมเรียบร้อย! ข้อมูลถูกลบแล้ว");
       navigate("/admin/game-settings", { replace: true });
    } else {
       alert("รหัสยืนยันไม่ถูกต้อง");
    }
  };

  // ==================== 4. Load Data ====================
  useEffect(() => {
    if (location.state?.gameData) {
      setGameData(location.state.gameData);
    } else {
      const savedGames = JSON.parse(localStorage.getItem("hbs_games") || "[]");
      const found = savedGames.find(g => g.code === gameCode);
      if (found) setGameData(found);
    }
  }, [gameCode, location.state, navigate]);

  if (!gameData) return <div className="p-10 text-center">กำลังโหลดข้อมูลห้อง...</div>;

  const readyTeams = teams.filter(t => t.status === "ready");
  const notReadyTeams = teams.filter(t => t.status === "not_ready");
  
  const getScoringDominant = () => {
    const s = gameData.settings.scoring;
    const maxKey = Object.keys(s).reduce((a, b) => s[a] > s[b] ? a : b);
    const labelMap = {
        overall: "เน้นภาพรวม", financial: "เน้นกำไรสุทธิ", market: "เน้นส่วนแบ่งตลาด",
        operations: "เน้นการบริการ", people: "เน้นบุคลากร", risk: "เน้นความเสี่ยง", growth: "เน้นการเติบโต"
    };
    return labelMap[maxKey] || "แบบผสมผสาน";
  };
  
  const getLocationName = (loc) => {
      const map = { bangkok: "โรงแรมในกรุงเทพฯ", chiangmai: "โรงแรมที่เชียงใหม่", phuket: "โรงแรมที่ภูเก็ต", khonkaen: "โรงแรมที่ขอนแก่น" };
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
    if (scenario === 'growth') return { text: "-15,000,000 บาท", isNegative: true };
    if (scenario === 'crisis') return { text: "30,000,000 บาท", isNegative: false };
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
            <span>โค้ดเกม: <strong>{gameData.code}</strong></span>
            <button className="btn-icon-sm" onClick={handleCopyCode} title="คัดลอกรหัส">
                {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14} />}
            </button>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="lobby-control-bar">
        <div className="lcb-timer">
            <span className="timer-label">เวลานับถอยหลัง</span>
            <span className={`timer-value ${timeLeft < 60 ? 'text-danger' : ''}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
        <div className="lcb-connection">
            <Wifi size={18} className="text-green-500" />
            <span>การเชื่อมต่อ: {teams.length}/5</span>
        </div>
        <div className="lcb-actions">
            <button className={`btn-control btn-fixed-width ${isTimerRunning ? 'btn-pause' : 'btn-play'}`} onClick={toggleTimer}>
                {isTimerRunning ? <><Pause size={18} /> หยุดชั่วคราว</> : <><Play size={18} /> เล่นต่อ</>}
            </button>
            <button className="btn-control btn-add" onClick={() => adjustTime(1)}><Plus size={18} /> เพิ่มเวลา</button>
            <button className="btn-control btn-reduce" onClick={() => adjustTime(-1)}><Minus size={18} /> ลดเวลา</button>
            <button className="btn-control btn-end" onClick={handleEndGameClick}><XCircle size={18} /> จบเกม</button>
        </div>
      </div>

      {/* 3. Main Content Layout */}
      <div className="lobby-layout">
        
        {/* Left Side Container */}
        <div className="monitor-section-wrapper" style={{flex: 1}}>
            
            <div className="lobby-monitor-section">
                <div className="monitor-header-row">
                    <div className="monitor-title-wrap">
                        <h3 className="monitor-title">มอนิเตอร์ผู้เล่น</h3>
                        <span className="status-text">{readyTeams.length}/{teams.length} ทีมพร้อมแล้ว</span>
                    </div>
                    <div className="monitor-tools">
                        <div className="search-pill">
                            <Search size={16} />
                            <input type="text" placeholder="ค้นหาทีม" />
                        </div>
                    </div>
                </div>

                <div className="monitor-grid">
                    
                    {/* Green Column (Ready) */}
                    <div className="monitor-col col-bg-green">
                        <div className="col-header header-solid-green">
                            <span>ทีมที่พร้อมแล้ว</span>
                            <span className="circle-badge">{readyTeams.length}</span>
                        </div>
                        <div className="col-content">
                            {readyTeams.length === 0 ? (
                                <div className="empty-state-text">ยังไม่มีทีมที่พร้อม</div>
                            ) : (
                                readyTeams.map((team, index) => (
                                    <div className="team-card-clean" key={team.id}>
                                        <div className="tcc-top">
                                            <span className="tcc-name">{index + 1}. {team.name}</span>
                                            <button className="btn-card-del"><Trash2 size={16}/></button>
                                        </div>
                                        <div className="tcc-actions">
                                            <button className="btn-pill">แก้ไขทีม</button>
                                            <button className="btn-pill">ส่งข้อความ</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="col-footer">
                            <div className="pagination-dots">
                                <button className="page-dot active">1</button>
                                <button className="page-dot">2</button>
                                <button className="page-dot">3</button>
                            </div>
                        </div>
                    </div>

                    {/* Yellow Column (Not Ready) */}
                    <div className="monitor-col col-bg-yellow">
                        <div className="col-header header-solid-yellow">
                            <span>ทีมที่ยังไม่พร้อม</span>
                            <span className="circle-badge">{notReadyTeams.length}</span>
                        </div>
                        <div className="col-content">
                            {notReadyTeams.length === 0 ? (
                                <div className="empty-state-text">ไม่มีทีมที่รออยู่</div>
                            ) : (
                                notReadyTeams.map((team, index) => (
                                    <div className="team-card-clean" key={team.id}>
                                        <div className="tcc-top">
                                            <span className="tcc-name">{index + 1}. {team.name}</span>
                                            <button className="btn-card-del"><Trash2 size={16}/></button>
                                        </div>
                                        <div className="tcc-actions">
                                            <button className="btn-pill">แก้ไขทีม</button>
                                            <button className="btn-pill">ส่งข้อความ</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Bottom Actions Row (Left & Right Buttons) */}
            <div className="monitor-bottom-row">
                <button 
                    className="btn-outline-green" 
                    onClick={() => navigate("/admin/active-games")} // ✅ เปลี่ยน path เป็นหน้าใหม่นี้
                >
                    รายการเกมทั้งหมด
                </button>

                <button className="btn-start-floating">
                    <span>เริ่มทันที</span>
                    <Play size={18} fill="currentColor" />
                </button>
            </div>

        </div>

        {/* Right: Details */}
        <div className="lobby-details-section">
            <h3 className="details-title">รายละเอียดเกม</h3>
            <div className="detail-item-box">
                <div className="di-label">จำนวนรอบ</div>
                <div className="di-value"><Calendar size={18}/> {gameData.settings.structure.totalQuarters} รอบ</div>
            </div>
            <div className="detail-item-box">
                <div className="di-label">จำนวนเวลาต่อรอบ</div>
                <div className="di-value"><Clock size={18}/> {gameData.settings.structure.minutesPerRound} นาที</div>
            </div>
            <div className="detail-item-box">
                <div className="di-label">เงินเริ่มต้น</div>
                <div className={`di-value ${moneyInfo.isNegative ? 'text-money-negative' : ''}`}>
                    <DollarSign size={18}/> {moneyInfo.text}
                </div>
            </div>
            <div className="detail-item-box">
                <div className="di-label">ชื่อ Scenario</div>
                <div className="di-value"><MapPin size={18}/> {getLocationName(gameData.settings.info.location)}</div>
            </div>
            <div className="detail-item-box">
                <div className="di-label">เกณฑ์การให้คะแนน</div>
                <div className="di-value"><Trophy size={18}/> {getScoringDominant()}</div>
            </div>
        </div>

      </div>

      {/* Modal */}
      {showEndModal && (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header-danger">
                    <div className="mh-content">
                        <div className="mh-icon-box"><Lock size={20} /></div>
                        <span>ยืนยันการจบเกม</span>
                    </div>
                    <button className="btn-close-modal" onClick={() => setShowEndModal(false)}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="warning-box">
                        <AlertTriangle size={20} className="text-warning" />
                        <span className="warning-text"><strong>คำเตือน</strong> หากยืนยันข้อมูลทั้งหมดในเกมนี้จะถูกลบและไม่สามารถย้อนกลับได้</span>
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
                                if(e.key === 'Enter' && confirmCode === gameData.code) {
                                    handleConfirmEndGame();
                                }
                            }}
                        />
                        <div className="modal-hint">โค้ดปัจจุบัน: {gameData.code}</div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={() => setShowEndModal(false)}>ยกเลิก</button>
                    <button className="btn-modal-confirm" onClick={handleConfirmEndGame} disabled={confirmCode !== gameData.code}>ยืนยันจบเกม</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}