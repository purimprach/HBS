import React, { useMemo, useState, useEffect } from "react";
import {
  Gamepad2,
  Users,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Search,
  Filter,
  Copy,
  Eye,
  Hourglass,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminActiveGamesPage.css";

/* =========================================================
   MOCK DATA (Demo)
   ========================================================= */
const MOCK_GAMES = [
  {
    id: 1,
    status: "playing",
    sessionName: "MBA รุ่น 1 - กลยุทธ์ขั้นสูง",
    gameCode: "MBA24-A1-CORE",
    teams: { current: 7, max: 8 },
    ready: { current: 5, max: 7 },
    roundText: "8 / 12",
    modeText: "เดี่ยว",
    progress: 0.67,
  },
  {
    id: 2,
    status: "playing",
    sessionName: "การฝึกอบรมผู้บริหาร - จัดการวิกฤต",
    gameCode: "EXEC-CM-01-NODE",
    teams: { current: 5, max: 5 },
    ready: { current: 2, max: 8 },
    roundText: "2 / 8",
    modeText: "ทีม",
    progress: 0.25,
  },
  {
    id: 3,
    status: "paused",
    sessionName: "เวิร์กช็อป BHM - แคมเปญการตลาด",
    gameCode: "BHM-MKT-W1-PRO",
    teams: { current: 10, max: 15 },
    ready: { current: 5, max: 10 },
    roundText: "5 / 10",
    modeText: "ผสม",
    progress: 0.50,
  },
  {
    id: 4,
    status: "idle",
    sessionName: "บทนำการจัดการการท่องเที่ยว",
    gameCode: "TOUR-201-S1-IDLE",
    teams: { current: 0, max: 0 },
    ready: { current: 0, max: 0 },
    roundText: "รอเริ่มระบบ",
    modeText: "ผสม",
    progress: 0,
  },
];

const STATUS_META = {
  playing: { label: "กำลังเล่น", Icon: PlayCircle, dot: "dot-green", badge: "badge-green" },
  paused: { label: "หยุดชั่วคราว", Icon: PauseCircle, dot: "dot-yellow", badge: "badge-yellow" },
  ended: { label: "จบเกม", Icon: CheckCircle2, dot: "dot-gray", badge: "badge-gray" },
  idle: { label: "รอเริ่มเกม", Icon: Hourglass, dot: "dot-gray", badge: "badge-gray" },
};

const GAMES_KEY = "hbs_games";

export default function AdminActiveGamesPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdGames, setCreatedGames] = useState([]);

  // Load games ที่สร้างจริงจาก AdminGameSettingsPage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(GAMES_KEY) || "[]");

    const mapped = saved.map((g, index) => {
      const maxTeams = g?.settings?.mode?.maxTeams ?? 10;

      return {
        id: `created-${g.code}-${index}`,
        status: "idle",
        sessionName: g.name,
        gameCode: g.code,
        teams: { current: g.teams?.length ?? 0, max: maxTeams },
        ready: { current: 0, max: g.teams?.length ?? 0 },
        roundText: "รอเริ่มระบบ",
        modeText: "-",
        progress: 0,
        raw: g,
      };
    });

    setCreatedGames(mapped);
  }, []);

  // Combine + filter
  const games = useMemo(() => {
    const q = query.trim().toLowerCase();
    const combined = [...MOCK_GAMES, ...createdGames];

    return combined.filter((g) => {
      const matchQ =
        !q ||
        g.sessionName.toLowerCase().includes(q) ||
        g.gameCode.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" ? true : g.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [query, statusFilter, createdGames]);

  // Summary
  const summary = useMemo(() => {
    const all = [...MOCK_GAMES, ...createdGames];

    const totalActive = all.length;
    const playing = all.filter((g) => g.status === "playing").length;
    const paused = all.filter((g) => g.status === "paused").length;
    const idle = all.filter((g) => g.status === "idle").length;

    // “จำนวนผู้เข้าร่วม” ในภาพ: นับเป็น “คน” (ใช้ teams.current เป็นตัวแทน)
    const totalPlayers = all.reduce((sum, g) => sum + (g.teams?.current ?? 0), 0);

    return { totalActive, totalPlayers, playing, paused, idle };
  }, [createdGames]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const goDetail = (g) => {
    if (g.raw) {
      navigate(`/admin/lobby/${g.gameCode}`, { state: { gameData: g.raw } });
    } else {
      // mock ก็ให้ไปหน้า lobby ได้เหมือนกัน (ถ้าอยาก)
      // navigate(`/admin/lobby/${g.gameCode}`);
    }
  };

  return (
    <div className="ag-page">
      {/* Title */}
      <div className="ag-titleBlock">
        <div className="ag-titleTop">Host / Active Game</div>
        <div className="ag-titleRow">
          <h1 className="ag-title">เกมทั้งหมด</h1>
          <div className="ag-titleHint">- จัดการและตรวจสอบเกมที่กำลังดำเนินการทั้งหมด</div>
        </div>
      </div>

      {/* Summary cards (แบบในภาพ: ไอคอนขวา + value ใหญ่ + หน่วย) */}
      <div className="ag-cards">
        <SummaryCard
          icon={<Gamepad2 size={18} />}
          title="เกมที่ Active ทั้งหมด"
          value={summary.totalActive}
          unit="เกม"
          accent="blue"
        />
        <SummaryCard
          icon={<Users size={18} />}
          title="จำนวนผู้เข้าร่วม"
          value={summary.totalPlayers}
          unit="คน"
          accent="pink"
        />
        <SummaryCard
          icon={<CheckCircle2 size={18} />}
          title="เกมที่กำลังเล่น"
          value={summary.playing}
          unit="เกม"
          accent="green"
        />
        <SummaryCard
          icon={<PauseCircle size={18} />}
          title="เกมที่หยุดชั่วคราว"
          value={summary.paused}
          unit="เกม"
          accent="yellow"
        />
        <SummaryCard
          icon={<Hourglass size={18} />}
          title="เกมที่รอเริ่มเกม"
          value={summary.idle}
          unit="เกม"
          accent="gray"
        />
      </div>

      {/* Green toolbar (แบบในภาพ) */}
      <div className="ag-toolbar">
        <div className="ag-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเกม (ชื่อเกม, รหัส, ผู้สอน...)"
          />
        </div>

        <div className="ag-filterLabel">
          <Filter size={16} />
          <span>สถานะ:</span>
        </div>

        <div className="ag-chips">
          <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            ทั้งหมด
          </Chip>
          <Chip active={statusFilter === "playing"} onClick={() => setStatusFilter("playing")}>
            กำลังเล่น
          </Chip>
          <Chip active={statusFilter === "paused"} onClick={() => setStatusFilter("paused")}>
            หยุดชั่วคราว
          </Chip>
          <Chip active={statusFilter === "idle"} onClick={() => setStatusFilter("idle")}>
            รอเริ่มเกม
          </Chip>
        </div>
      </div>

      {/* Table Card */}
      <div className="ag-tableCard">
        <div className="ag-thead">
          <div className="th-status">สถานะ</div>
          <div className="th-name">ชื่อเกม</div>
          <div className="th-code">รหัสเกม</div>
          <div className="th-teams">จำนวนทีม</div>
          <div className="th-mode">โหมดการเล่น</div>
          <div className="th-round">รอบ/ทั้งหมด</div>
          <div className="th-progress">ความคืบหน้า</div>
          <div className="th-action">คำสั่ง</div>
        </div>

        <div className="ag-tbody">
          {games.map((g) => {
            const meta = STATUS_META[g.status] || STATUS_META.idle;
            const Icon = meta.Icon;
            const pct = Math.round((g.progress ?? 0) * 100);

            return (
              <div className="ag-row" key={g.id}>
                <div className="td-status">
                  <span className={`statusDot ${meta.dot}`} />
                  <Icon size={18} className="statusIcon" />
                </div>

                <div className={`td-name ${g.status === "idle" ? "muted" : ""}`}>
                  {g.sessionName}
                </div>

                <div className="td-code">
                  <span className={`gameCode ${g.status === "idle" ? "muted" : ""}`}>{g.gameCode}</span>
                  <button className="btnCopy" onClick={() => handleCopy(g.gameCode)} type="button">
                    <Copy size={16} />
                  </button>
                </div>

                <div className="td-teams">
                  <span className="pillNum">{g.teams.current}</span>
                </div>

                <div className="td-mode">
                  <span className={`modeText ${g.status === "idle" ? "muted" : ""}`}>{g.modeText}</span>
                </div>

                <div className="td-round">
                  <span className={`roundText ${g.status === "idle" ? "muted" : ""}`}>{g.roundText}</span>
                </div>

                <div className="td-progress">
                  <div className="progressBar">
                    <div className="progressFill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className={`progressPct ${g.status === "idle" ? "muted" : ""}`}>{pct}%</div>
                </div>

                <div className="td-action">
                  <button
                    className="btnView"
                    onClick={() => goDetail(g)}
                    type="button"
                    disabled={!g.raw}
                    title={!g.raw ? "Demo: ปิดไว้" : "ดูรายละเอียด"}
                  >
                    <Eye size={16} />
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {games.length === 0 && <div className="ag-empty">ไม่พบรายการที่ตรงกับเงื่อนไข</div>}
      </div>
    </div>
  );
}

/* =========================================================
   Small Components
   ========================================================= */
function SummaryCard({ icon, title, value, unit, accent }) {
  return (
    <div className="sum-card">
      <div className="sum-left">
        <div className="sum-title">{title}</div>
        <div className="sum-valueRow">
          <div className="sum-value">{value}</div>
          <div className="sum-unit">{unit}</div>
        </div>
      </div>

      <div className={`sum-icon sum-${accent}`}>{icon}</div>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      className={`chip ${active ? "chip-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
