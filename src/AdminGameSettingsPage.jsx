import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminGameSettingsPage.css";
import { readGames, writeGames } from "./utils/gameStorage";
import {
  User,
  Users,
  UsersRound,
  CalendarDays,
  Save,
  LayoutDashboard,
  CircleDollarSign,
  PieChart,
  ClipboardList,
  Users2,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Play,
  Copy,
  Share2,
  Pencil,
  Mail,
} from "lucide-react";

// --- ฟังก์ชันสุ่มรหัสห้อง ---
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

// --- รายการเหตุการณ์ ---
const EVENT_OPTIONS = [
  { value: "none", label: "ไม่มีเหตุการณ์" },
  {
    label: "--- ปัจจัยลบ (Negative) ---",
    options: [
      { value: "pandemic", label: "การระบาดของโรคติดต่อร้ายแรง" },
      { value: "pm25", label: "วิกฤตฝุ่น PM 2.5 เกินค่ามาตรฐาน" },
      { value: "anti_tourist", label: "กระแสต่อต้านนักท่องเที่ยวจากบางประเทศ" },
      { value: "carbon_tax", label: "ออกกฎหมายภาษีคาร์บอน" },
      { value: "outbound_trend", label: "ค่านิยมในการเที่ยวต่างประเทศเพิ่มมากขึ้น" },
      { value: "disaster", label: "ภัยพิบัติจากแผ่นดินไหว/น้ำท่วม" },
      { value: "energy_cost", label: "ราคาน้ำมัน/ค่าไฟพุ่งสูง" },
      { value: "war", label: "ภาวะสงครามในภูมิภาค/โลก" },
      { value: "food_inflation", label: "ภาวะเงินเฟ้อต้นทุนอาหาร" },
      { value: "protest", label: "การประท้วง/รัฐประหาร" },
    ],
  },
  {
    label: "--- ปัจจัยบวก (Positive) ---",
    options: [
      { value: "min_wage", label: "การปรับขึ้นค่าแรงขั้นต่ำ" },
      { value: "free_visa", label: "นโยบายฟรีวีซ่า" },
      { value: "gov_subsidy", label: "รัฐอัดฉีดเงินอุดหนุนการท่องเที่ยว" },
      { value: "mega_event", label: "การจัดคอนเสิร์ต/อีเวนต์ยักษ์" },
      { value: "new_attraction", label: "มีสถานที่ท่องเที่ยวเปิดใหม่ใกล้โรงแรม" },
      { value: "asian_games", label: "ประเทศไทยเป็นเจ้าภาพจัดงานเอเชียนเกมส์" },
      { value: "airline_expansion", label: "สายการบินเพิ่มเที่ยวบิน" },
      { value: "tax_deduction", label: "นโยบายลดหย่อนภาษีท่องเที่ยว" },
      { value: "weak_currency", label: "ค่าเงินบาทอ่อนตัว" },
    ],
  },
];

const GAMES_KEY = "hbs_games";
const ADMIN_DRAFT_KEY = "hbs_admin_game_draft_v1";

const ADMIN_SESSION_KEY = "hbs_current_admin";

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


/* =========================
   Helpers สำหรับ Step 2
   ========================= */
const makeDefaultYearEcon = () => ({
  econFormula: "gdp_event",
  gdpStart: 4,
  inflation: 8,
  mrr: 5,
  industryFactor: 1.0,
});

const makeDefaultQuarter = (quarterNumber, minutesPerRound) => ({
  quarter: quarterNumber,
  minutes: minutesPerRound ?? 15,
  demand: 1,
  event: "none",
});

// =========================
// ✅ Default State (Reset)
// =========================
const DEFAULT_STATE = {
  // Step 1
  gameName: "ตัวอย่าง HBS - CU2026",
  hotelSize: "medium",
  location: "chiangmai",
  scenario: "balanced",

  mode: "team",
  teamSize: 4,
  minTeams: 1,
  maxTeams: 4,

  totalQuarters: 12,
  minutesPerRound: 15,

  // Step 2
  activeYear: 1,
  yearEconSettings: [makeDefaultYearEcon()],
  quarterSettings: Array.from({ length: 12 }, (_, i) =>
    makeDefaultQuarter(i + 1, 15)
  ),
  isStep2Saved: false,

  // Step 3
  scoring: {
    overall: 20,
    financial: 20,
    market: 15,
    operations: 15,
    people: 10,
    risk: 10,
    growth: 10,
  },
  isStep3Saved: false,
  isEditingScoring: false,

  // Step 4
  isGameCreated: false,
  gameCode: "",
  createdGameData: null,
};

export default function AdminGameSettingsPage() {
  const navigate = useNavigate();
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const adminSession = useMemo(() => {
    return safeParse(localStorage.getItem(ADMIN_SESSION_KEY), null);
  }, []);

  const adminEmail = normalizeEmail(adminSession?.email);

  // กันหลุด: ถ้าไม่มี session ให้เด้งไป login (เผื่อ user เข้า url ตรง)
  useEffect(() => {
    if (!adminEmail) navigate("/admin-login", { replace: true });
  }, [adminEmail, navigate]);

  // ✅ Step 3 edit mode
  const [isEditingScoring, setIsEditingScoring] = useState(false);

  // ✅ Step 3 saved flag
  const [isStep3Saved, setIsStep3Saved] = useState(false);

  // ===================== Step 1 States =====================
  const [gameName, setGameName] = useState(DEFAULT_STATE.gameName);
  const [hotelSize, setHotelSize] = useState(DEFAULT_STATE.hotelSize);
  const [location, setLocation] = useState(DEFAULT_STATE.location);
  const [scenario, setScenario] = useState(DEFAULT_STATE.scenario);

  const [mode, setMode] = useState(DEFAULT_STATE.mode);
  const [teamSize, setTeamSize] = useState(DEFAULT_STATE.teamSize);
  const [minTeams, setMinTeams] = useState(DEFAULT_STATE.minTeams);
  const [maxTeams, setMaxTeams] = useState(DEFAULT_STATE.maxTeams);

  // ✅ ค่าจริง (ตัวเลข)
  const [totalQuarters, setTotalQuarters] = useState(DEFAULT_STATE.totalQuarters);
  const [minutesPerRound, setMinutesPerRound] = useState(
    DEFAULT_STATE.minutesPerRound
  );

  // ✅ ค่าในช่อง input (สตริง)
  const [totalQuartersInput, setTotalQuartersInput] = useState(
    String(DEFAULT_STATE.totalQuarters)
  );
  const [minutesPerRoundInput, setMinutesPerRoundInput] = useState(
    String(DEFAULT_STATE.minutesPerRound)
  );

  const teamSizeOptions = useMemo(() => [2, 3, 4], []);
  const otherMinOptions = useMemo(() => [1, 2, 3, 4], []);
  const otherMaxOptions = useMemo(() => [1, 2, 3, 4], []);

  const handleMinChange = (v) => {
    if (v >= maxTeams) {
      setMinTeams(Math.max(1, maxTeams - 1));
      return;
    }
    setMinTeams(v);
  };

  const handleMaxChange = (v) => {
    if (v <= minTeams) {
      setMaxTeams(Math.min(4, minTeams + 1));
      return;
    }
    setMaxTeams(v);
  };

  // ===================== Step 2 States =====================
  const [activeYear, setActiveYear] = useState(DEFAULT_STATE.activeYear);

  const [yearEconSettings, setYearEconSettings] = useState(
    DEFAULT_STATE.yearEconSettings
  );

  const [quarterSettings, setQuarterSettings] = useState(() => {
    return Array.from({ length: DEFAULT_STATE.totalQuarters }, (_, i) =>
      makeDefaultQuarter(i + 1, DEFAULT_STATE.minutesPerRound)
    );
  });

  // ✅ Step2 saved -> ใช้ล็อก/ปลดล็อกการแก้ไข Step2
  const [isStep2Saved, setIsStep2Saved] = useState(DEFAULT_STATE.isStep2Saved);

  const handleSaveStep2 = () => {
    if (isStep2Saved) {
      // เข้าโหมดแก้
      setIsStep2Saved(false);
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      // บันทึก
      setIsStep2Saved(true);
    }
  };

  // ✅ จำนวนปีตาม totalQuarters
  const yearsCount = useMemo(() => {
    const n = Math.ceil((Number(totalQuarters) || 1) / 4);
    return Math.min(10, Math.max(1, n));
  }, [totalQuarters]);

  const years = useMemo(
    () => Array.from({ length: yearsCount }, (_, i) => i + 1),
    [yearsCount]
  );

  useEffect(() => {
    setActiveYear((y) => Math.min(Math.max(1, y), yearsCount));
  }, [yearsCount]);

  // ✅ resize yearEconSettings
  useEffect(() => {
    setYearEconSettings((prev) => {
      const next = [...prev];
      while (next.length < yearsCount) next.push(makeDefaultYearEcon());
      if (next.length > yearsCount) next.length = yearsCount;
      return next;
    });
  }, [yearsCount]);

  // ✅ resize quarterSettings
  useEffect(() => {
    setQuarterSettings((prev) => {
      const next = [...prev];
      while (next.length < totalQuarters)
        next.push(makeDefaultQuarter(next.length + 1, minutesPerRound));
      if (next.length > totalQuarters) next.length = totalQuarters;
      return next.map((q, idx) => ({ ...q, quarter: idx + 1 }));
    });
  }, [totalQuarters, minutesPerRound]);

  const currentYearQuarters = useMemo(() => {
    const passedQuarters = (activeYear - 1) * 4;
    const remaining = totalQuarters - passedQuarters;
    return Math.min(4, Math.max(0, remaining));
  }, [activeYear, totalQuarters]);

  const yearIndex = activeYear - 1;
  const econFormula = yearEconSettings[yearIndex]?.econFormula ?? "gdp_event";
  const gdpStart = yearEconSettings[yearIndex]?.gdpStart ?? 4;
  const inflation = yearEconSettings[yearIndex]?.inflation ?? 8;
  const mrr = yearEconSettings[yearIndex]?.mrr ?? 5;
  const industryFactor = yearEconSettings[yearIndex]?.industryFactor ?? 1.0;

  const patchYearEcon = (patch) => {
    setYearEconSettings((prev) =>
      prev.map((y, idx) => (idx === yearIndex ? { ...y, ...patch } : y))
    );
  };

  const currentQuartersSlice = useMemo(() => {
    const start = (activeYear - 1) * 4;
    const end = start + currentYearQuarters;
    return quarterSettings.slice(start, end);
  }, [activeYear, currentYearQuarters, quarterSettings]);

  const updateQuarter = (localIdxInYear, patch) => {
    const absoluteIdx = (activeYear - 1) * 4 + localIdxInYear;
    setQuarterSettings((prev) =>
      prev.map((q, i) => (i === absoluteIdx ? { ...q, ...patch } : q))
    );
  };

  // ===================== Step 3 States =====================
  const [scoring, setScoring] = useState(DEFAULT_STATE.scoring);

  const totalWeight = useMemo(
    () => Object.values(scoring).reduce((a, b) => a + b, 0),
    [scoring]
  );

  const adjustScore = (key, delta) => {
    setScoring((prev) => {
      const newVal = prev[key] + delta;
      if (newVal < 0) return prev;
      return { ...prev, [key]: newVal };
    });
  };

  const scoringConfig = [
    {
      key: "overall",
      title: "ประสิทธิภาพโดยรวม",
      desc: "กำไรสุทธิ, RevPAR, ผลตอบแทนจากส่วนของผู้ถือหุ้น",
      icon: LayoutDashboard,
    },
    {
      key: "financial",
      title: "ประสิทธิภาพทางการเงิน",
      desc: "กำไรสุทธิ, RevPAR, ผลตอบแทนจากส่วนของผู้ถือหุ้น",
      icon: CircleDollarSign,
    },
    {
      key: "market",
      title: "ตลาด & แบรนด์",
      desc: "ส่วนแบ่งตลาด, คะแนนชื่อเสียงแบรนด์",
      icon: PieChart,
    },
    {
      key: "operations",
      title: "การดำเนินงาน & บริการ",
      desc: "คะแนนความพึงพอใจของแขก, อัตราการเข้าพัก",
      icon: ClipboardList,
    },
    {
      key: "people",
      title: "พนักงาน & องค์กร",
      desc: "ความพึงพอใจของพนักงาน, อัตราการลาออก, งบอบรม",
      icon: Users2,
    },
    {
      key: "risk",
      title: "ความเสี่ยง & วินัยทางการเงิน",
      desc: "กระแสเงินสด / สภาพคล่อง, D/E Ratio",
      icon: AlertTriangle,
    },
    {
      key: "growth",
      title: "การเติบโต & มูลค่าระยะยาว",
      desc: "มูลค่าเศรษฐกิจที่เพิ่มขึ้น, การเติบโตของมูลค่าสินทรัพย์",
      icon: TrendingUp,
    },
  ];

  // ===================== Step 4 States & Logic =====================
  const [isGameCreated, setIsGameCreated] = useState(DEFAULT_STATE.isGameCreated);
  const [gameCode, setGameCode] = useState(DEFAULT_STATE.gameCode);
  const [createdGameData, setCreatedGameData] = useState(
    DEFAULT_STATE.createdGameData
  );

  // ===================== Draft Persist =====================
  const [draftLoaded, setDraftLoaded] = useState(false);

  // ✅ Helpers: selectable input
  const focusSelectAll = (e) => e.target.select();

  // ✅ Input handlers
  const onTotalQuartersChange = (e) => setTotalQuartersInput(e.target.value);

  const commitTotalQuarters = () => {
    if (totalQuartersInput === "") {
      setTotalQuartersInput(String(totalQuarters));
      return;
    }
    let n = parseInt(totalQuartersInput, 10);
    if (Number.isNaN(n)) n = totalQuarters;
    if (n < 1) n = 1;
    if (n > 40) n = 40;
    setTotalQuarters(n);
    setTotalQuartersInput(String(n));
  };

  const onMinutesChange = (e) => setMinutesPerRoundInput(e.target.value);

  const commitMinutes = () => {
    if (minutesPerRoundInput === "") {
      setMinutesPerRoundInput(String(minutesPerRound));
      return;
    }
    let n = parseInt(minutesPerRoundInput, 10);
    if (Number.isNaN(n)) n = minutesPerRound;
    if (n < 1) n = 1;
    if (n > 60) n = 60;

    setMinutesPerRound(n);
    setMinutesPerRoundInput(String(n));

    // ✅ Sync ไปยังทุกไตรมาส "ทั้งหมด"
    setQuarterSettings((prev) => prev.map((q) => ({ ...q, minutes: n })));
  };

  // ✅ sync input string ให้ตามค่าจริงเสมอ
  useEffect(() => {
    setTotalQuartersInput(String(totalQuarters));
  }, [totalQuarters]);

  useEffect(() => {
    setMinutesPerRoundInput(String(minutesPerRound));
  }, [minutesPerRound]);

  // ✅ Load draft ครั้งเดียวตอนเปิดหน้า
  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_DRAFT_KEY);
    if (!raw) {
      setDraftLoaded(true);
      return;
    }

    try {
      const draft = JSON.parse(raw);

      // Step 1
      if (draft.gameName != null) setGameName(draft.gameName);
      if (draft.hotelSize != null) setHotelSize(draft.hotelSize);
      if (draft.location != null) setLocation(draft.location);
      if (draft.scenario != null) setScenario(draft.scenario);

      if (draft.mode != null) setMode(draft.mode);
      if (draft.teamSize != null) setTeamSize(draft.teamSize);
      if (draft.minTeams != null) setMinTeams(draft.minTeams);
      if (draft.maxTeams != null) setMaxTeams(draft.maxTeams);

      if (draft.totalQuarters != null) setTotalQuarters(draft.totalQuarters);
      if (draft.minutesPerRound != null) setMinutesPerRound(draft.minutesPerRound);

      // Step 2
      if (draft.activeYear != null) setActiveYear(draft.activeYear);
      if (draft.yearEconSettings != null) setYearEconSettings(draft.yearEconSettings);
      if (draft.quarterSettings != null) setQuarterSettings(draft.quarterSettings);
      if (typeof draft.isStep2Saved === "boolean") setIsStep2Saved(draft.isStep2Saved);

      // Step 3
      if (draft.scoring != null) setScoring(draft.scoring);
      if (typeof draft.isStep3Saved === "boolean") setIsStep3Saved(draft.isStep3Saved);
      if (typeof draft.isEditingScoring === "boolean") setIsEditingScoring(draft.isEditingScoring);

      // Step 4
      if (typeof draft.isGameCreated === "boolean") setIsGameCreated(draft.isGameCreated);
      if (draft.gameCode != null) setGameCode(draft.gameCode);
      if (draft.createdGameData != null) setCreatedGameData(draft.createdGameData);
    } catch (e) {
      console.error("draft parse error", e);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  // ✅ Save draft ทุกครั้งที่ค่าเปลี่ยน (แต่รอให้ load เสร็จก่อน)
  useEffect(() => {
    if (!draftLoaded) return;

    const draft = {
      gameName,
      hotelSize,
      location,
      scenario,
      mode,
      teamSize,
      minTeams,
      maxTeams,
      totalQuarters,
      minutesPerRound,

      activeYear,
      yearEconSettings,
      quarterSettings,
      isStep2Saved,

      scoring,
      isStep3Saved,
      isEditingScoring,

      isGameCreated,
      gameCode,
      createdGameData,
    };

    localStorage.setItem(ADMIN_DRAFT_KEY, JSON.stringify(draft));
  }, [
    draftLoaded,
    gameName,
    hotelSize,
    location,
    scenario,
    mode,
    teamSize,
    minTeams,
    maxTeams,
    totalQuarters,
    minutesPerRound,

    activeYear,
    yearEconSettings,
    quarterSettings,
    isStep2Saved,

    scoring,
    isStep3Saved,
    isEditingScoring,

    isGameCreated,
    gameCode,
    createdGameData,
  ]);

  // ✅ Helper: ตรวจว่าบันทึกครบหรือยัง
  const ensureAllSaved = () => {
    if (!isStep2Saved) {
      alert("ยังไม่ได้บันทึกการตั้งค่าในขั้นตอนที่ 2 ครับ");
      return false;
    }
    if (isEditingScoring) {
      alert("ยังไม่ได้บันทึกการตั้งค่าในขั้นตอนที่ 3 ครับ (กำลังแก้ไขอยู่)");
      return false;
    }
    if (!isStep3Saved) {
      alert("ยังไม่ได้บันทึกการตั้งค่าในขั้นตอนที่ 3 ครับ");
      return false;
    }
    return true;
  };

  // ✅ รีเซ็ตทุกอย่างกลับค่าเริ่มต้น (หลัง “เสร็จเรียบร้อย”)
  const resetToDefault = () => {
    // 1) ล้าง draft ก่อน กันโหลดค่าล่าสุดกลับมา
    localStorage.removeItem(ADMIN_DRAFT_KEY);

    // Step 1
    setGameName(DEFAULT_STATE.gameName);
    setHotelSize(DEFAULT_STATE.hotelSize);
    setLocation(DEFAULT_STATE.location);
    setScenario(DEFAULT_STATE.scenario);

    setMode(DEFAULT_STATE.mode);
    setTeamSize(DEFAULT_STATE.teamSize);
    setMinTeams(DEFAULT_STATE.minTeams);
    setMaxTeams(DEFAULT_STATE.maxTeams);

    setTotalQuarters(DEFAULT_STATE.totalQuarters);
    setMinutesPerRound(DEFAULT_STATE.minutesPerRound);

    // sync ช่อง input
    setTotalQuartersInput(String(DEFAULT_STATE.totalQuarters));
    setMinutesPerRoundInput(String(DEFAULT_STATE.minutesPerRound));

    // Step 2
    setActiveYear(DEFAULT_STATE.activeYear);
    setYearEconSettings(DEFAULT_STATE.yearEconSettings);
    setQuarterSettings(DEFAULT_STATE.quarterSettings);
    setIsStep2Saved(false);

    // Step 3
    setScoring(DEFAULT_STATE.scoring);
    setIsStep3Saved(false);
    setIsEditingScoring(false);

    // Step 4
    setIsGameCreated(false);
    setGameCode("");
    setCreatedGameData(null);

    // UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDone = () => {
    if (!ensureAllSaved()) return;

    alert("บันทึกเรียบร้อย ✅ พร้อมสร้างเกมใหม่ได้เลย");

    // ✅ รีเซ็ตกลับค่าเริ่มต้นจริง ๆ
    resetToDefault();
  };

  const handleCreateGame = () => {
    if (!adminEmail) {
      alert("ไม่พบผู้ดูแลระบบ (กรุณา Login ใหม่)");
      navigate("/admin-login");
      return;
    }
    if (totalWeight !== 100) {
      alert(`น้ำหนักรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalWeight}%)`);
      return;
    }
    if (!isStep2Saved) {
      alert("กรุณากด 'บันทึกการตั้งค่า' ในขั้นตอนที่ 2 ก่อนครับ");
      return;
    }

    const newCode = generateRoomCode();
    setGameCode(newCode);

    // ✅ สร้างเกม = ถือว่า Step3 ผ่านเงื่อนไขและบันทึกแล้ว
    setIsStep3Saved(true);

    // ✅ NEW: เอาชื่อ admin จาก session (fallback ถ้าไม่มี)
    const adminName =
      (adminSession?.username || "").trim() ||
      (adminSession?.name || "").trim() ||
      "Admin";

    const gamePayload = {
      id: newCode,
      code: newCode,
      name: gameName,

      // ✅ ผูกข้อมูลผู้สร้างเกม
      ownerAdminId: adminSession?.id || null,
      ownerAdminEmail: adminEmail,
      ownerAdminUsername: (adminSession?.username || "").trim(),
      ownerAdminName: adminName, // ✅ ใช้แสดงผล (fallback จาก username/name)

      settings: {
        info: { hotelSize, location, scenario },
        mode: { type: mode, teamSize: teamSize, minTeams: minTeams, maxTeams: maxTeams },
        structure: { totalQuarters, minutesPerRound },
        economics: { years: yearEconSettings, quarterConfig: quarterSettings },
        scoring: scoring,
      },

      teams: [],
      status: "lobby",
      createdAt: new Date().toISOString(),
    };

    setCreatedGameData(gamePayload);
    setIsGameCreated(true);

    const existingGames = readGames();
    writeGames([...existingGames, gamePayload]);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleCopyCode = async () => {
    if (!gameCode) return;
    await navigator.clipboard.writeText(gameCode);
    alert("คัดลอกรหัสเกมแล้ว: " + gameCode);
  };

  const buildShareText = () => {
    return `🎮 เชิญเข้าร่วมเกม Hotel Business Simulator

ชื่อเกม: ${gameName}
โค้ดเกม: ${gameCode}

(ตอนนี้ยังอยู่ช่วงทดลองระบบ ยังไม่มีลิงก์เข้าห้อง)
ให้ผู้เล่นนำโค้ดไปกรอกในหน้าห้องเมื่อระบบเสร็จครับ ✅`;
  };

  const ensureGameCode = () => {
    if (!gameCode) {
      alert("ยังไม่มีรหัสเกมครับ กรุณากด 'สร้างรหัสเกม' ก่อน");
      return false;
    }
    return true;
  };

  const handleCopyShare = async () => {
    if (!ensureGameCode()) return;
    await navigator.clipboard.writeText(buildShareText());
    alert("คัดลอกข้อความเชิญ + รหัสเกมแล้วครับ ✅");
  };

  const handleShareLine = async () => {
    if (!ensureGameCode()) return;
    await navigator.clipboard.writeText(buildShareText());
    alert("คัดลอกข้อความแล้วครับ ✅\nเปิด LINE แล้ววาง (Paste) เพื่อส่งได้เลย");
  };

  const handleShareEmail = () => {
    if (!ensureGameCode()) return;
    const subject = encodeURIComponent("เชิญเข้าร่วมเกม Hotel Business Simulator");
    const body = encodeURIComponent(buildShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleGoToLobby = () => {
    if (!ensureGameCode()) return;
    if (!ensureAllSaved()) return;

    navigate(`/admin/lobby/${gameCode}`, { state: { gameData: createdGameData } });
  };

  // =========================
  // ✅ ล็อก/ปลดล็อก ตาม flow
  // =========================
  const isStep1Locked = isStep2Saved || isGameCreated;
  const isStep2Locked = isStep2Saved;

  // Step3: แก้ได้เมื่อ Step2 saved เท่านั้น
  // หลังสร้างเกม: ล็อก จนกว่าจะกด "แก้ไขเกณฑ์"
  const isStep3Locked = !isStep2Saved || (isGameCreated && !isEditingScoring);

  // ปุ่ม +/- ใช้ตัวนี้
  const canEditStep3 = !isStep3Locked && (!isGameCreated || isEditingScoring);

  return (
    <div className="ags-page">
      {/* ===================== STEP 1 ===================== */}
      <div className="ags-stepTitleRow">
        <div className="ags-stepBar" />
        <div className="ags-titleText">ขั้นตอนที่ 1: ข้อมูลพื้นฐาน &amp; โครงสร้างเกม</div>
      </div>

      <section className={`ags-card ${isStep1Locked ? "is-locked" : "is-active"}`}>
        <div className="asg-gridTop">
          <div className="ags-field asg-span2">
            <label>ชื่อเกม</label>
            <input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="ตัวอย่าง: HBS"
              disabled={isStep1Locked}
            />
          </div>

          <div className="ags-field">
            <label>ขนาดโรงแรม</label>
            <select value={hotelSize} onChange={(e) => setHotelSize(e.target.value)} disabled={isStep1Locked}>
              <option value="small">ขนาดเล็ก</option>
              <option value="medium">ขนาดกลาง</option>
              <option value="large">ขนาดใหญ่</option>
            </select>
          </div>

          <div className="ags-field">
            <label>สถานที่ตั้ง</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} disabled={isStep1Locked}>
              <option value="bangkok">กรุงเทพฯ</option>
              <option value="chiangmai">เชียงใหม่</option>
              <option value="phuket">ภูเก็ต</option>
              <option value="khonkaen">ขอนแก่น</option>
            </select>
          </div>

          <div className="ags-field">
            <label>สถานการณ์</label>
            <select value={scenario} onChange={(e) => setScenario(e.target.value)} disabled={isStep1Locked}>
              <option value="balanced">ธุรกิจที่มั่นคง</option>
              <option value="growth">ธุรกิจที่กำลังประสบปัญหา</option>
              <option value="crisis">ธุรกิจที่สภาพคล่องสูง</option>
            </select>
          </div>
        </div>

        <div className="asg-midRow">
          <div className="asg-leftBlock">
            <div className="asg-subtitle">การตั้งค่าโหมด</div>

            <div className="asg-modeRow">
              <button
                type="button"
                className={`asg-modeCard ${mode === "single" ? "active" : ""}`}
                onClick={() => setMode("single")}
                disabled={isStep1Locked}
              >
                <User size={20} />
                <div>เล่นแบบเดี่ยว</div>
              </button>

              <button
                type="button"
                className={`asg-modeCard ${mode === "team" ? "active" : ""}`}
                onClick={() => setMode("team")}
                disabled={isStep1Locked}
              >
                <Users size={20} />
                <div>เล่นแบบทีม</div>
              </button>

              <button
                type="button"
                className={`asg-modeCard ${mode === "other" ? "active" : ""}`}
                onClick={() => setMode("other")}
                disabled={isStep1Locked}
              >
                <UsersRound size={20} />
                <div>เล่นทั้ง 2 แบบ</div>
              </button>
            </div>

            <div className={`asg-modeExtras ${mode === "single" ? "is-hidden" : ""}`}>
              <div />
              <div className="asg-under-col2">
                <div className={`asg-teamSize ${mode === "team" ? "" : "is-hidden"}`}>
                  <label>สมาชิก (2-4)</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    disabled={mode !== "team" || isStep1Locked}
                  >
                    {teamSizeOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="asg-under-col3">
                <div className={`asg-otherRange ${mode === "other" ? "" : "is-hidden"}`}>
                  <div className="asg-miniSelect">
                    <label>ขั้นต่ำ</label>
                    <select
                      value={minTeams}
                      onChange={(e) => handleMinChange(Number(e.target.value))}
                      disabled={mode !== "other" || isStep1Locked}
                    >
                      {otherMinOptions
                        .filter((n) => n < maxTeams)
                        .map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="asg-miniSelect">
                    <label>สูงสุด</label>
                    <select
                      value={maxTeams}
                      onChange={(e) => handleMaxChange(Number(e.target.value))}
                      disabled={mode !== "other" || isStep1Locked}
                    >
                      {otherMaxOptions
                        .filter((n) => n > minTeams)
                        .map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="asg-rightBlock">
            <div className="asg-miniField">
              <label>จำนวนไตรมาสทั้งหมด</label>
              <input
                type="number"
                min={1}
                max={40}
                step={1}
                value={totalQuartersInput}
                onChange={onTotalQuartersChange}
                onBlur={commitTotalQuarters}
                onFocus={focusSelectAll}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                disabled={isStep1Locked}
              />
            </div>

            <div className="asg-miniField">
              <label>นาทีต่อรอบ</label>
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={minutesPerRoundInput}
                onChange={onMinutesChange}
                onBlur={commitMinutes}
                onFocus={focusSelectAll}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                disabled={isStep1Locked}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STEP 2 ===================== */}
      <div className="ags-stepTitleRow ags-stepTitleRow--spacer" ref={step2Ref}>
        <div className="ags-stepBar" />
        <div className="ags-titleText">ขั้นตอนที่ 2: การตั้งค่าเศรษฐกิจ &amp; สิ่งแวดล้อม</div>
      </div>

      <div className={`step2-container ${isStep2Saved ? "is-locked" : "is-active"}`}>
        <div className="step2-tabs-wrapper">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`step2-tab ${activeYear === y ? "active" : ""}`}
              onClick={() => setActiveYear(y)}
              disabled={isStep2Locked}
            >
              <CalendarDays size={18} style={{ marginRight: 6 }} /> ปีที่ {y}
            </button>
          ))}
        </div>

        <section className="ags-card step2-card-content">
          <div className="step2-header">
            <h3>ปีที่ {activeYear}</h3>
            <p>เลือกสถานการณ์ที่กำหนดไว้ล่วงหน้าหรือกำหนดค่าเอง ทั้งหมดในสิ่งแวดล้อมได้อย่างอิสระ</p>
          </div>

          <div className="ags-row-full">
            <div className="ags-field">
              <label>อัตราการเติบโตของเศรษฐกิจ</label>
              <select
                value={econFormula}
                onChange={(e) => patchYearEcon({ econFormula: e.target.value })}
                className="input-full"
                disabled={isStep2Locked}
              >
                <option value="gdp_event">อัตราการเติบโตของเศรษฐกิจ = 100 + 2*GDP + เหตุการณ์</option>
                <option value="simple">อัตราการเติบโตของเศรษฐกิจ = 100 + GDP</option>
              </select>
            </div>
          </div>

          <div className="ags-row-4col">
            <div className="ags-field">
              <label>GDP (ค่าเริ่มต้น)</label>
              <select
                value={gdpStart}
                onChange={(e) => patchYearEcon({ gdpStart: Number(e.target.value) })}
                disabled={isStep2Locked}
              >
                {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="ags-field">
              <label>อัตราเงินเฟ้อ</label>
              <select
                value={inflation}
                onChange={(e) => patchYearEcon({ inflation: Number(e.target.value) })}
                disabled={isStep2Locked}
              >
                {[-2, 0, 2, 4, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </select>
            </div>

            <div className="ags-field">
              <label>MRR</label>
              <select
                value={mrr}
                onChange={(e) => patchYearEcon({ mrr: Number(e.target.value) })}
                disabled={isStep2Locked}
              >
                {[4, 4.5, 5.0, 5.5, 6, 6.5, 7, 7.5, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}%
                  </option>
                ))}
              </select>
            </div>

            <div className="ags-field">
              <label>ปัจจัยอุตสาหกรรม</label>
              <select
                value={industryFactor}
                onChange={(e) => patchYearEcon({ industryFactor: Number(e.target.value) })}
                disabled={isStep2Locked}
              >
                {[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="step2-sub-title">การตั้งค่าไตรมาส</div>

          <div className="step2-q-grid">
            {currentQuartersSlice.map((q, idx) => (
              <div className="step2-q-card" key={q.quarter}>
                <div className="q-card-header">ไตรมาสที่ {q.quarter}</div>

                <div className="q-card-body">
                  <div className="q-card-row">
                    <div className="ags-field">
                      <label>เวลาในรอบนี้</label>
                      <input
                        type="number"
                        value={q.minutes}
                        max={60}
                        disabled={isStep2Locked}
                        onChange={(e) => {
                          let val = Number(e.target.value);
                          if (val > 60) val = 60;
                          updateQuarter(idx, { minutes: val });
                        }}
                        onFocus={focusSelectAll}
                      />
                    </div>

                    <div className="ags-field">
                      <label>ตามฤดูกาล</label>
                      <select
                        value={q.demand}
                        onChange={(e) => updateQuarter(idx, { demand: Number(e.target.value) })}
                        disabled={isStep2Locked}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                  </div>

                  <div className="ags-field">
                    <label>เหตุการณ์</label>
                    <select
                      value={q.event}
                      onChange={(e) => updateQuarter(idx, { event: e.target.value })}
                      disabled={isStep2Locked}
                    >
                      {EVENT_OPTIONS.map((opt, i) =>
                        opt.options ? (
                          <optgroup key={i} label={opt.label}>
                            {opt.options.map((sub) => (
                              <option key={sub.value} value={sub.value}>
                                {sub.label}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          <option key={i} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="step2-footer">
            <button className={`btn-save ${isStep2Saved ? "btn-edit-mode" : ""}`} onClick={handleSaveStep2}>
              {isStep2Saved ? (
                <>
                  แก้ไขการตั้งค่า <Pencil size={18} style={{ marginLeft: 8 }} />
                </>
              ) : (
                <>
                  บันทึกการตั้งค่า <Save size={18} style={{ marginLeft: 8 }} />
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* ===================== STEP 3 ===================== */}
      <div className="ags-stepTitleRow ags-stepTitleRow--spacer" ref={step3Ref}>
        <div className="ags-stepBar" />
        <div className="ags-titleText">ขั้นตอนที่ 3: กฎ &amp; การให้คะแนน</div>
      </div>

      <section className={`ags-card ${isStep3Locked ? "is-locked" : "is-active"}`}>
        <div className="step2-header">
          <h3>เกณฑ์การให้คะแนน</h3>
          <p>น้ำหนักการให้คะแนน - ปรับค่าน้ำหนักเพื่อกำหนดความสำคัญของแต่ละหมวดหมู่ โดยรวมต้องเท่ากับ 100%</p>
        </div>

        <div className={`step3-total-bar ${totalWeight === 100 ? "is-valid" : "is-invalid"}`}>
          <div className="bar-label">
            <CheckCircle2 size={20} />
            <div className="bar-text">
              <strong>น้ำหนักรวม</strong>
              <span>ต้องเท่ากับ 100%</span>
            </div>
          </div>
          <div className="bar-value">{totalWeight}%</div>
          <div className="bar-fill" style={{ width: `${Math.min(100, totalWeight)}%` }} />
        </div>

        <div className="step3-grid">
          {scoringConfig.map((item) => (
            <div className="step3-card" key={item.key}>
              <div className="step3-card-icon">
                <item.icon size={24} />
              </div>

              <div className="step3-card-content">
                <div className="card-title">{item.title}</div>
                <div className="card-desc">{item.desc}</div>
              </div>

              <div className="step3-card-actions">
                <button
                  type="button"
                  className="btn-adj"
                  onClick={() => adjustScore(item.key, -5)}
                  disabled={!canEditStep3}
                >
                  -
                </button>

                <div className="score-val">{scoring[item.key]}</div>

                <button
                  type="button"
                  className="btn-adj"
                  onClick={() => adjustScore(item.key, 5)}
                  disabled={!canEditStep3}
                >
                  +
                </button>

                <span className="unit">%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="step3-footer-centered">
        <button
          type="button"
          className={`btn-create ${isGameCreated ? "btn-disabled-look" : ""}`}
          onClick={handleCreateGame}
          disabled={!isStep2Saved || totalWeight !== 100 || isGameCreated}
        >
          {isGameCreated ? "สร้างรหัสเกมแล้ว" : "สร้างรหัสเกม"}
          {!isGameCreated && <Play size={20} fill="currentColor" style={{ marginLeft: 8 }} />}
        </button>
      </div>

      {/* ===================== STEP 4 ===================== */}
      {isGameCreated && (
        <div className="fade-in-up">
          <div className="ags-stepTitleRow ags-stepTitleRow--spacer">
            <div className="ags-stepBar" />
            <div className="ags-titleText">ขั้นตอนที่ 4: แชร์เกม</div>
          </div>

          <section className="ags-card step4-card">
            <div className="step4-row">
              <div className="ags-field" style={{ flex: 1.5 }}>
                <label>ชื่อเกม</label>
                <input value={gameName} readOnly className="input-readonly" />
              </div>

              <div className="ags-field" style={{ flex: 1 }}>
                <label>โค้ดเกม</label>
                <div className="step4-code-group">
                  <div className="code-box">
                    {gameCode}
                    <button type="button" className="btn-icon-copy" onClick={handleCopyCode}>
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="step4-actions">
                <button
                  type="button"
                  className={`btn-edit-criteria ${isEditingScoring ? "is-saving" : ""}`}
                  onClick={() => {
                    if (isEditingScoring) {
                      if (totalWeight !== 100) {
                        alert(`ยังบันทึกไม่ได้: น้ำหนักรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalWeight}%)`);
                        return;
                      }
                      setIsEditingScoring(false);
                      setIsStep3Saved(true);
                      alert("บันทึกการแก้ไขเกณฑ์การให้คะแนนแล้ว ✅");
                    } else {
                      setIsEditingScoring(true);
                      setIsStep3Saved(false);
                      setTimeout(() => {
                        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }
                  }}
                >
                  {isEditingScoring ? (
                    <>
                      <Save size={16} style={{ marginRight: 6 }} />
                      บันทึกการแก้ไข
                    </>
                  ) : (
                    <>
                      <Pencil size={16} style={{ marginRight: 6 }} />
                      แก้ไขเกณฑ์การให้คะแนน
                    </>
                  )}
                </button>

                <button type="button" className="btn-green-go" onClick={handleGoToLobby}>
                  ไปยังหน้ารอเกม
                </button>
                <button type="button" className="btn-done" onClick={handleDone}>
                  เสร็จเรียบร้อย
                </button>
              </div>
            </div>

            <div className="share-admin-box">
              <div className="share-preview">
                <div className="share-preview-title">ตัวอย่างข้อความที่จะแชร์</div>
                <pre className="share-preview-content">{buildShareText()}</pre>
              </div>

              <div className="share-actions">
                <button type="button" className="btn-share-admin btn-copy" onClick={handleCopyShare}>
                  <Copy size={18} />
                  คัดลอกข้อความ
                </button>

                <button type="button" className="btn-share-admin btn-line" onClick={handleShareLine}>
                  <Share2 size={18} />
                  ส่งทาง LINE
                </button>

                <button type="button" className="btn-share-admin btn-email" onClick={handleShareEmail}>
                  <Mail size={18} />
                  ส่งทางอีเมล
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <footer className="ags-footer">
        <div className="footer-line" />
        <p>© 2026 Hotel Business Simulator System</p>
        <p className="footer-sub">Designed for GT Technology • Admin Panel v1.0</p>
      </footer>
    </div>
  );
}
