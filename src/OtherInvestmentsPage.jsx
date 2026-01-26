// OtherInvestmentsPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DecisionPage.css";
import "./OtherInvestmentsPage.css";

import {
  Banknote,
  Users,
  Check,
  PieChart,
  Tag,
  Megaphone,
  Wrench,
  Camera,
  Minus,
  Plus,
  Shield,
  Building2,
  HandHeart,
  Zap,
  BookOpen,
  Stethoscope,
  Leaf,
  UsersRound,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;
const STORAGE_KEY_BUDGETS = "hbs_round1_decision_budgets";
const STORAGE_KEY_OTHER = "hbs_round1_other_investments";

/* ✅ CEO Other Investments */
const STORAGE_KEY_CEO_OTHER2 = "hbs_round1_ceo_other2";

/* ✅ LOAN (NEW) */
const STORAGE_KEY_LOAN = "hbs_round1_ceo_loan";

const fmt = (n) => (Number(n) || 0).toLocaleString();

const pctChange = (curr, prev) => {
  if (!prev) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

const SECTION_ICONS = {
  insurance: Shield,
  assets: Building2,
  csr: HandHeart,
};

/** ✅ Insurance Plans */
const INSURANCE_PLANS = [
  { id: "plan_starter", nameTH: "ขั้นเริ่มต้น", coverage: 5_000_000, note: "คุ้มครองพื้นฐานสำหรับเริ่มต้น", cost: 9_000, accent: "yellow" },
  { id: "plan_basic", nameTH: "ขั้นพื้นฐาน", coverage: 10_000_000, note: "เหมาะสำหรับโรงแรมขนาดกลาง", cost: 16_000, accent: "blue" },
  { id: "plan_standard", nameTH: "ขั้นกลาง", coverage: 20_000_000, note: "คุ้มครองครอบคลุมขึ้น", cost: 30_000, accent: "purple" },
  { id: "plan_premium", nameTH: "ขั้นสูง", coverage: 40_000_000, note: "คุ้มครองสูงสุด ลดความเสี่ยงมาก", cost: 54_000, accent: "green" },
];

const DEFAULT_SECTIONS = [
  {
    id: "insurance",
    title: "เลือกแผนประกันภัย (Insurance Plans)",
    cards: [
      { id: "ins_property", title: "ประกันภัยทรัพย์สิน (Property)", subtitle: "เลือกแพ็กเกจประกันภัยทรัพย์สิน", budget: 0, prev: 0, min: 0, step: 0, pill: "Property", accent: "blue" },
    ],
  },
  {
    id: "assets",
    title: "การลงทุนในหุ้น กองทุน หรืออสังหาฯ",
    cards: [
      { id: "asset_stock", title: "หุ้น", subtitle: "ระดับความเสี่ยงสูง ผลตอบแทนผันผวน", budget: 100_000, prev: 100_000, min: 0, step: 10_000, pill: "High Risk", accent: "yellow" },
      { id: "asset_fund", title: "กองทุนรวม", subtitle: "ระดับความเสี่ยงปานกลาง กระจายความเสี่ยงได้ดี", budget: 100_000, prev: 100_000, min: 0, step: 10_000, pill: "Balanced", accent: "purple" },
      { id: "asset_reit", title: "อสังหาฯ (REIT/Property)", subtitle: "ระดับความเสี่ยงต่ำถึงปานกลาง รายได้สม่ำเสมอ", budget: 100_000, prev: 100_000, min: 0, step: 10_000, pill: "Stable", accent: "green" },
    ],
  },
  {
    id: "csr",
    title: "การลงทุนด้านโครงการเพื่อสังคม (Corporate Social Responsibility: CSR)",
    cards: [
      { id: "csr_edu", title: "การศึกษา", subtitle: "สนับสนุนโอกาสทางการศึกษา", budget: 50_000, prev: 50_000, min: 0, step: 5_000, pill: "Edu", accent: "blue" },
      { id: "csr_health", title: "สาธารณสุข", subtitle: "สนับสนุนสาธารณสุขในพื้นที่", budget: 50_000, prev: 50_000, min: 0, step: 5_000, pill: "Care", accent: "purple" },
      { id: "csr_env", title: "สิ่งแวดล้อม", subtitle: "ลดผลกระทบ/กิจกรรมรักษ์โลก", budget: 50_000, prev: 50_000, min: 0, step: 5_000, pill: "Eco", accent: "green" },
      { id: "csr_people", title: "ทรัพยากรมนุษย์และสังคม", subtitle: "พัฒนาคน/สังคมในพื้นที่และชุมชน", budget: 50_000, prev: 50_000, min: 0, step: 5_000, pill: "People", accent: "gray" },
    ],
  },
];

const CSR_META = {
  csr_edu: { icon: BookOpen, hint: "ลดหย่อนภาษีได้ 2 เท่า แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ" },
  csr_health: { icon: Stethoscope, hint: "ลดหย่อนภาษีได้ 2 เท่า แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ" },
  csr_env: { icon: Leaf, hint: "ลดหย่อนภาษีได้ แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ" },
  csr_people: { icon: UsersRound, hint: "ลดหย่อนภาษีได้ แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ" },
};

const getAccentColor = (accent) => {
  switch (accent) {
    case "yellow": return "#B45309";
    case "blue": return "#2563EB";
    case "purple": return "#7C3AED";
    case "green": return "#16A34A";
    default: return "#334155";
  }
};

const withIcons = (secs) =>
  (Array.isArray(secs) ? secs : []).map((s) => ({ ...s, icon: SECTION_ICONS[s.id] }));

/* ✅ CEO OTHER2 GROUPS (radio + check) */
const CEO_OTHER2_GROUPS = [
  { id: "solar", title: "ติดตั้งโซล่าเซลล์", icon: Zap, type: "radio", options: [
    { id: "solar_6kw", label: "ขนาด 6 kW", cost: 115_000 },
    { id: "solar_11kw", label: "ขนาด 11 kW", cost: 199_000 },
    { id: "solar_20kw", label: "ขนาด 20 kW", cost: 670_000 },
  ]},
  { id: "ev", title: "สถานีชาร์จรถไฟฟ้า", icon: Leaf, type: "radio", options: [
    { id: "ev_1", label: "รถยนต์ไฟฟ้า 1 จุด + จักรยานยนต์ 1 จุด", cost: 100_000 },
    { id: "ev_2", label: "รถยนต์ไฟฟ้า 2 จุด + จักรยานยนต์ 1 จุด", cost: 150_000 },
  ]},
  { id: "digital_ai", title: "ระบบดิจิทัลและ AI", icon: PieChart, type: "check", options: [
    { id: "dig_pos", label: "ระบบดิจิทัลสมาร์ท", cost: 1_000_000 },
    { id: "dig_cloud", label: "ระบบจัดเก็บข้อมูลบน Cloud", cost: 20_000 },
    { id: "dig_ai", label: "ระบบแชทบอท AI", cost: 100_000 },
  ]},
  { id: "hotel_extra", title: "กิจการเสริมของโรงแรม", icon: Building2, type: "check", options: [
    { id: "extra_vend", label: "ตู้ขาย น้ำ/อาหาร อัตโนมัติ", cost: 160_000 },
    { id: "extra_mini", label: "มินิมาร์ท ขนาดเล็ก", cost: 1_200_000 },
    { id: "extra_cafe", label: "ร้านกาแฟ", cost: 850_000 },
  ]},
  { id: "common_area", title: "พื้นที่ส่วนกลาง", icon: Users, type: "check", options: [
    { id: "area_cowork", label: "Co-working Space", cost: 500_000 },
    { id: "area_meet", label: "ห้องประชุม", cost: 50_000 },
  ]},
];

/* ✅ LOAN PRODUCTS */
const LOAN_PRODUCTS = {
  short: { id: "short", title: "สินเชื่อระยะสั้น", hint: "เหมาะกับเงินหมุนระยะสั้น", min: 200_000, max: 2_000_000, step: 100_000, yearsMin: 1, yearsMax: 2, baseRate: 0.07 },
  long:  { id: "long",  title: "สินเชื่อระยะยาว", hint: "ดอกเบี้ยต่ำกว่า ผ่อนยาว", min: 500_000, max: 5_000_000, step: 250_000, yearsMin: 2, yearsMax: 8, baseRate: 0.058 },
  flex:  { id: "flex",  title: "สินเชื่อตามใจ", hint: "ปรับวงเงินได้สูงขึ้น", min: 1_000_000, max: 10_000_000, step: 500_000, yearsMin: 1, yearsMax: 10, baseRate: 0.08 },
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const calcMonthly = (principal, annualRate, years) => {
  const P = Number(principal) || 0;
  const n = Math.max(1, Math.round((Number(years) || 1) * 12));
  const r = (Number(annualRate) || 0) / 12;
  if (P <= 0) return 0;
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
};

const getCashRemainingFromStorage = () => {
  try {
    const saved = localStorage.getItem("hbs_round1_decision_budgets");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const v = parsed.ceoCashRemaining;
    return Number.isFinite(Number(v)) ? Number(v) : null;
  } catch {
    return null;
  }
};


export default function OtherInvestmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getBudgetFromStorage = (id) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.budgets?.find((b) => b.id === id)?.value || 0;
      }
    } catch (e) {
      console.error("Error loading budget", e);
    }
    return 0;
  };

  const ceoOtherBudget = location.state?.ceoOtherBudget ?? getBudgetFromStorage(4) ?? 0;

  const commonState = {
    ceoCash: location.state?.ceoCash ?? TOTAL_BUDGET,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 3.5,
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
    ceoOtherBudget,
  };

  /* =========================
     ✅ เงินสดคงเหลือ (จากหน้าแรก)
     - แนะนำ: ส่ง ceoCashRemaining มาจากหน้าแรก
  ========================= */
  const cashFromStorage = getCashRemainingFromStorage();

  const baseCashRemaining =
    location.state?.ceoCashRemaining ??
    cashFromStorage ??
    location.state?.ceoCash ??
    TOTAL_BUDGET;


  /* =========================
     ✅ LOAN STATE (ย้ายเข้า component แล้ว)
  ========================= */
  const [loanState, setLoanState] = useState(() => {
    const fallback = {
      isOpen: false,
      approved: false,
      type: "short",
      amount: 1_000_000,
      years: 2,
      approvedAmount: 0,
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOAN);
      if (!saved) return fallback;
      return { ...fallback, ...JSON.parse(saved) };
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOAN, JSON.stringify(loanState));
  }, [loanState]);

  const currentLoan = LOAN_PRODUCTS[loanState.type] || LOAN_PRODUCTS.short;
  const loanAmount = clamp(loanState.amount, currentLoan.min, currentLoan.max);
  const loanYears = clamp(loanState.years, currentLoan.yearsMin, currentLoan.yearsMax);
  const loanRate = currentLoan.baseRate;
  const loanMonthly = Math.round(calcMonthly(loanAmount, loanRate, loanYears));

  const loanApprovedAmount = loanState.approved ? (loanState.approvedAmount || 0) : 0;
  const ceoCashRemaining = (baseCashRemaining || 0) + loanApprovedAmount;

  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try { return !!JSON.parse(saved).isSaved; } catch {}
    }
    return false;
  });

  const [insuranceChoice, setInsuranceChoice] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try { return JSON.parse(saved).insuranceChoice || "plan_basic"; } catch {}
    }
    return "plan_basic";
  });

  const [insuranceLocked, setInsuranceLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try { return !!JSON.parse(saved).insuranceLocked; } catch {}
    }
    return false;
  });

  const [assetsLocked, setAssetsLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try { return !!JSON.parse(saved).assetsLocked; } catch {}
    }
    return false;
  });

  const [csrLocked, setCsrLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try { return !!JSON.parse(saved).csrLocked; } catch {}
    }
    return false;
  });

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalPlanId, setModalPlanId] = useState(null);

  const modalPlan = useMemo(() => INSURANCE_PLANS.find((p) => p.id === modalPlanId) || null, [modalPlanId]);

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sections)) return withIcons(parsed.sections);
      } catch {}
    }
    return withIcons(DEFAULT_SECTIONS);
  });

  useEffect(() => {
    const serializableSections = sections.map(({ icon, ...rest }) => rest);
    localStorage.setItem(
      STORAGE_KEY_OTHER,
      JSON.stringify({
        sections: serializableSections,
        isSaved,
        insuranceChoice,
        insuranceLocked,
        assetsLocked,
        csrLocked,
      })
    );
  }, [sections, isSaved, insuranceChoice, insuranceLocked, assetsLocked, csrLocked]);

  const updateCardBudget = (sectionId, cardId, nextValue) => {
    if (isSaved) return;
    const safe = Math.max(0, Number(nextValue) || 0);
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, cards: sec.cards.map((c) => (c.id === cardId ? { ...c, budget: safe } : c)) };
      })
    );
  };

  const adjustCard = (sectionId, cardId, delta) => {
    if (isSaved) return;
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          cards: sec.cards.map((c) =>
            c.id === cardId ? { ...c, budget: Math.max(c.min ?? 0, (c.budget || 0) + delta) } : c
          ),
        };
      })
    );
  };

  const selectedPlan = useMemo(
    () => INSURANCE_PLANS.find((p) => p.id === insuranceChoice) || INSURANCE_PLANS[1],
    [insuranceChoice]
  );

  const insuranceSpend = insuranceLocked ? selectedPlan?.cost || 0 : 0;

  const totalSpend = useMemo(() => {
    const spendWithoutInsurance = sections.reduce((acc, s) => {
      if (s.id === "insurance") return acc;
      return acc + s.cards.reduce((a, c) => a + (c.budget || 0), 0);
    }, 0);
    return spendWithoutInsurance + insuranceSpend;
  }, [sections, insuranceSpend]);

  const remaining = (ceoOtherBudget || 0) - totalSpend;
  const isOver = remaining < 0;

  const handleSave = () => {
    if (isSaved) return;
    if (window.confirm("ยืนยันการบันทึกการลงทุนด้านอื่นๆ?")) setIsSaved(true);
  };

  const handleInsuranceToggle = () => {
    if (isSaved) return;
    if (insuranceLocked) return setInsuranceLocked(false);
    if (window.confirm("ยืนยันการบันทึกแผนประกันภัย?")) setInsuranceLocked(true);
  };

  const handleAssetsToggle = () => {
    if (isSaved) return;
    if (assetsLocked) return setAssetsLocked(false);
    if (window.confirm("ยืนยันการบันทึกการลงทุนในหุ้น/กองทุน/อสังหาฯ ?")) setAssetsLocked(true);
  };

  const handleCsrToggle = () => {
    if (isSaved) return;
    if (csrLocked) return setCsrLocked(false);
    if (window.confirm("ยืนยันการบันทึกการลงทุน CSR?")) setCsrLocked(true);
  };

  /* =========================
     ✅ CEO OTHER2
  ========================= */
  const [ceoOther2Locked, setCeoOther2Locked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CEO_OTHER2);
    if (!saved) return false;
    try { return !!JSON.parse(saved).locked; } catch { return false; }
  });

  const [ceoOther2Selection, setCeoOther2Selection] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CEO_OTHER2);
    const fallback = { solar: null, ev: null, digital_ai: [], hotel_extra: [], common_area: [] };
    if (!saved) return fallback;
    try { return JSON.parse(saved).selection || fallback; } catch { return fallback; }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_CEO_OTHER2,
      JSON.stringify({ locked: ceoOther2Locked, selection: ceoOther2Selection })
    );
  }, [ceoOther2Locked, ceoOther2Selection]);

  const ceoOther2Total = useMemo(() => {
    let total = 0;
    for (const g of CEO_OTHER2_GROUPS) {
      if (g.type === "radio") {
        const pick = ceoOther2Selection[g.id];
        if (pick) {
          const opt = g.options.find((o) => o.id === pick);
          total += opt?.cost || 0;
        }
      } else {
        const picks = ceoOther2Selection[g.id] || [];
        for (const pid of picks) {
          const opt = g.options.find((o) => o.id === pid);
          total += opt?.cost || 0;
        }
      }
    }
    return total;
  }, [ceoOther2Selection]);

  // ✅ เปลี่ยนจาก “งบส่วนนี้ 1,200,000” -> ใช้ “กระแสเงินสดคงเหลือจริง”
  const ceoOther2CashRemaining = ceoCashRemaining;
  const ceoOther2OverCash = ceoOther2Total > ceoOther2CashRemaining;
  const ceoOther2CashAfter = ceoOther2CashRemaining - ceoOther2Total;

  const toggleCeoOther2 = (groupId, optionId, type) => {
    if (isSaved || ceoOther2Locked) return;
    setCeoOther2Selection((prev) => {
      const next = { ...prev };
      if (type === "radio") {
        next[groupId] = prev[groupId] === optionId ? null : optionId;
        return next;
      }
      const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
      const idx = arr.indexOf(optionId);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(optionId);
      next[groupId] = arr;
      return next;
    });
  };

  // ✅ ปุ่มขวา: ยืนยันการลงทุน (ล็อก)
  const handleCeoOther2Confirm = () => {
    if (isSaved) return;
    if (ceoOther2Locked) return setCeoOther2Locked(false);

    // ถ้าเกินเงินสด -> ต้องไปขอสินเชื่อก่อน
    if (ceoOther2OverCash) {
      alert("กระแสเงินสดไม่พอ กรุณาขอสินเชื่อก่อน");
      return;
    }

    if (window.confirm("ยืนยันการลงทุนด้านอื่นๆ สำหรับ CEO ?")) {
      setCeoOther2Locked(true);
    }
  };

  // ✅ ปุ่มซ้าย: ขอสินเชื่อ (active เฉพาะตอนเงินสดไม่พอ)
  const openLoanPanel = () => {
    if (isSaved) return;
    setLoanState((s) => ({ ...s, isOpen: true }));
  };

  // ✅ ล็อกทั้งหน้าเมื่อ loan panel เปิด
  const isLoanBlocking = loanState.isOpen && !loanState.approved;

  const applyLoan = () => {
    // อนุมัติสินเชื่อ -> บวกเข้า cash ผ่าน approvedAmount
    if (window.confirm("ยืนยันการขอสินเชื่อ?")) {
      setLoanState((s) => ({
        ...s,
        approved: true,
        approvedAmount: loanAmount,
        isOpen: false, // ปิด panel หลังยืนยัน
      }));
    }
  };

  const cancelLoan = () => {
    // ยังไม่ตัดสินใจ (ปิด panel)
    setLoanState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <div className="decision-page other-page">
      {/* ====== TOP STATS ====== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการลงทุนด้านอื่นๆ</span>
            <div className="stat-icon-box"><Banknote size={18} /></div>
          </div>
          <div className="stat-value">{fmt(ceoOtherBudget)}</div>
          <div className="stat-sub">งบไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ความเสี่ยงด้านพินาศ</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 900 }}>■</span></div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>ปานกลาง</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดีมาก</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">มูลค่าทรัพย์สิน</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 900 }}>☺</span></div>
          </div>
          <div className="stat-value">{fmt(400_000_000)}</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ดอกเบี้ยจ่าย</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 900 }}>↩</span></div>
          </div>
          <div className="stat-value">{fmt(200_000)}</div>
          <div className="stat-sub">ต่อไตรมาส</div>
        </div>
      </div>

      {/* ====== MAIN TABS ====== */}
      <div className="decision-tabs">
        <button className="tab-btn" onClick={() => navigate("/decision", { state: commonState })}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>

        <button className="tab-btn" onClick={() => navigate("/pricing", { state: commonState })}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/marketing", { state: { ...commonState, ceoMarketingBudget: mktBudget, ceoHRBudget: hrBudget } });
          }}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/personnel", { state: { ...commonState, ceoMarketingBudget: mktBudget, ceoHRBudget: hrBudget } });
          }}
        >
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>

        <button className="tab-btn" onClick={() => navigate("/maintenance")}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        
        <button className={`tab-btn ${location.pathname === '/other' ? 'active' : ''}`} onClick={() => navigate('/other')}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* ✅ ถ้า Loan panel เปิด -> ล็อกทั้งหน้าให้เทา */}
      <div className={isLoanBlocking ? "loan-blocking" : ""}>
        {/* ====== CONTENT ====== */}
        <div className="decision-content">
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="other-page-header">
              <h2>การลงทุนด้านอื่นๆ</h2>
            </div>

            {sections.map((sec) => {
              const SecIcon = sec.icon;

              return (
                <div key={sec.id} className="other-section">
                  <div className="other-section-head">
                    <div className="other-section-title">
                      <span className="other-section-icon">
                        {SecIcon ? <SecIcon size={16} /> : <span style={{ fontWeight: 900 }}>•</span>}
                      </span>
                      <span>{sec.title}</span>
                    </div>
                  </div>

                  {/* ✅ Insurance UI */}
                  {sec.id === "insurance" ? (
                    <>
                      <div className="ins-grid">
                        {INSURANCE_PLANS.map((p) => {
                          const selected = insuranceChoice === p.id;
                          const lockDim = insuranceLocked && !selected;

                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={["ins-plan", `accent-${p.accent}`, selected ? "selected" : "", lockDim ? "is-dim" : ""].join(" ")}
                              onClick={() => {
                                if (insuranceLocked || isSaved) return;
                                setInsuranceChoice(p.id);
                              }}
                              disabled={isSaved}
                            >
                              <span className="ins-radio" aria-hidden="true"><span className="ins-radio-dot" /></span>
                              <div className="ins-plan-name">{p.nameTH}</div>

                              <div className="ins-plan-lines">
                                <div className="ins-line-1">ทุนประกัน {fmt(p.coverage)} บาท</div>
                                <div className="ins-line-2">เบี้ยประกัน {fmt(p.cost)} บาท/ปี</div>
                              </div>

                              <button
                                type="button"
                                className="ins-plan-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalPlanId(p.id);
                                  setIsPlanModalOpen(true);
                                }}
                              >
                                กดที่นี่เพื่อรายละเอียดแผนประกัน
                              </button>
                            </button>
                          );
                        })}
                      </div>

                      <div className="ins-actions">
                        <button
                          type="button"
                          className={`ins-save-btn ${insuranceLocked ? "is-edit" : ""}`}
                          onClick={handleInsuranceToggle}
                          disabled={isSaved}
                        >
                          {insuranceLocked ? "แก้ไข" : "บันทึก"}
                        </button>
                      </div>
                    </>
                  ) : null}

                  {/* ✅ Assets UI */}
                  {sec.id === "assets" ? (
                    <>
                      <div className="assets-grid">
                        {sec.cards.map((c) => {
                          const disabled = isSaved || assetsLocked;

                          return (
                            <div key={c.id} className={`asset-card accent-${c.accent} ${disabled ? "is-locked" : ""}`}>
                              <div className="asset-top">
                                <div className="asset-left-head">
                                  <span className={`asset-dot accent-${c.accent}`} aria-hidden="true" />
                                  <div className="asset-title">{c.title}</div>
                                </div>
                                <span className={`asset-pill accent-${c.accent}`}>{c.pill}</span>
                              </div>

                              <div className="asset-divider" />
                              <div className="asset-desc">{c.subtitle}</div>

                              <div className="asset-controls">
                                <button
                                  type="button"
                                  className="asset-btn"
                                  onClick={() => adjustCard(sec.id, c.id, -(c.step || 0))}
                                  disabled={disabled || (c.budget || 0) <= (c.min || 0)}
                                  aria-label="decrease"
                                >
                                  <Minus size={16} />
                                </button>

                                <input
                                  className="asset-input"
                                  type="text"
                                  value={fmt(c.budget)}
                                  disabled={disabled}
                                  onChange={(e) => {
                                    if (disabled) return;
                                    const raw = e.target.value.replace(/,/g, "");
                                    const num = Number(raw || 0);
                                    if (!Number.isNaN(num)) updateCardBudget(sec.id, c.id, num);
                                  }}
                                />

                                <button
                                  type="button"
                                  className="asset-btn"
                                  onClick={() => adjustCard(sec.id, c.id, c.step || 0)}
                                  disabled={disabled}
                                  aria-label="increase"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <button type="button" className="asset-link" onClick={() => alert("Mock: รายละเอียดเพิ่มเติม")}>
                                กดที่นี่เพื่อรายละเอียด
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="assets-actions">
                        <button
                          type="button"
                          className={`assets-save-btn ${assetsLocked ? "is-edit" : ""}`}
                          onClick={handleAssetsToggle}
                          disabled={isSaved}
                        >
                          {assetsLocked ? "แก้ไข" : "บันทึก"}
                        </button>
                      </div>
                    </>
                  ) : null}

                  {/* ✅ CSR UI */}
                  {sec.id === "csr" ? (
                    <>
                      <div className="csr-grid">
                        {sec.cards.map((c) => {
                          const meta = CSR_META[c.id] || {};
                          const Icon = meta.icon;
                          const disabled = isSaved || csrLocked;
                          const hitMin = (c.budget || 0) <= (c.min || 0);

                          return (
                            <div key={c.id} className={`csr-card ${disabled ? "is-locked" : ""}`}>
                              <div className="csr-top">
                                <div className="csr-ic">
                                  {Icon ? <Icon size={18} /> : <span style={{ fontWeight: 900 }}>•</span>}
                                </div>
                                <div className="csr-title" title={c.title}>{c.title}</div>
                              </div>

                              <div className="csr-controls">
                                <button
                                  type="button"
                                  className="csr-btn"
                                  onClick={() => adjustCard(sec.id, c.id, -(c.step || 0))}
                                  disabled={disabled || hitMin}
                                >
                                  <Minus size={16} />
                                </button>

                                <input
                                  className="csr-input"
                                  type="text"
                                  value={fmt(c.budget)}
                                  disabled={disabled}
                                  onChange={(e) => {
                                    if (disabled) return;
                                    const raw = e.target.value.replace(/,/g, "");
                                    const num = Number(raw || 0);
                                    if (!Number.isNaN(num)) updateCardBudget(sec.id, c.id, num);
                                  }}
                                />

                                <button
                                  type="button"
                                  className="csr-btn"
                                  onClick={() => adjustCard(sec.id, c.id, c.step || 0)}
                                  disabled={disabled}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div className="csr-hint">{meta.hint || "ลดหย่อนภาษีได้ (เงื่อนไขตามที่กำหนด)"}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="csr-actions">
                        <button
                          type="button"
                          className={`csr-save-btn ${csrLocked ? "is-edit" : ""}`}
                          onClick={handleCsrToggle}
                          disabled={isSaved}
                        >
                          {csrLocked ? "แก้ไข" : "บันทึก"}
                        </button>
                      </div>
                    </>
                  ) : null}

                  {/* ✅ Fallback old cards */}
                  {sec.id !== "insurance" && sec.id !== "assets" && sec.id !== "csr" ? (
                    <div className="other-cards">
                      {sec.cards.map((c) => {
                        const pct = pctChange(c.budget, c.prev);
                        const up = pct > 0;
                        const down = pct < 0;
                        const hitMin = (c.budget || 0) <= (c.min || 0);

                        return (
                          <div key={c.id} className={`other-card accent-${c.accent}`}>
                            <div className="other-card-left">
                              <div className="other-card-top">
                                <div className="other-card-title">{c.title}</div>
                                <span className="other-pill">{c.pill}</span>
                              </div>
                              <div className="other-card-sub">{c.subtitle}</div>
                            </div>

                            <div className="other-card-right">
                              <div className="other-controls">
                                <button
                                  className={`other-mini-btn ${hitMin ? "limit" : ""}`}
                                  onClick={() => adjustCard(sec.id, c.id, -(c.step || 0))}
                                  disabled={isSaved || hitMin}
                                >
                                  <Minus size={16} />
                                </button>

                                <input
                                  className="other-input"
                                  type="text"
                                  value={fmt(c.budget)}
                                  disabled={isSaved}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/,/g, "");
                                    const num = Number(raw || 0);
                                    if (!Number.isNaN(num)) updateCardBudget(sec.id, c.id, num);
                                  }}
                                />

                                <button
                                  className="other-mini-btn"
                                  onClick={() => adjustCard(sec.id, c.id, c.step || 0)}
                                  disabled={isSaved}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div className="other-meta">
                                <span>งบก่อนหน้า : {fmt(c.prev)}</span>
                                <span className={`other-pct ${down ? "down" : up ? "up" : ""}`}>
                                  {pct === 0 ? "0.00%" : `${up ? "+" : ""}${pct.toFixed(2)}%`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* ====== Bottom summary (เดิม) ====== */}
            <div className="other-bottom-wrap">
              <div className="other-bottom-card">
                <div className="other-bottom-left">
                  <div className="other-bottom-title">ต้นทุนรวมการลงทุนด้านอื่นๆ (ไตรมาสที่ 1)</div>
                  <div className="other-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>

                  <div className="other-bottom-sub">
                    งบคงเหลือ : <b className={isOver ? "is-over" : ""}>{fmt(Math.max(0, remaining))}</b>
                  </div>

                  {isOver && (
                    <div className="other-bottom-alert">
                      งบไม่พอ กรุณาลดการลงทุน <b>{fmt(Math.abs(remaining))}</b> บาท
                    </div>
                  )}
                </div>

                <div className="other-bottom-right">
                  <button
                    className={`other-confirm ${isOver ? "is-disabled" : ""}`}
                    onClick={handleSave}
                    disabled={isSaved || isOver}
                    title={isOver ? "งบไม่พอ กรุณาลดงบ" : "ยืนยันการบันทึก"}
                  >
                    <span className="other-check"><Check size={16} strokeWidth={3} /></span>
                    {isSaved ? "บันทึกเรียบร้อย" : "บันทึกการลงทุนด้านอื่นๆ"}
                  </button>

                  <div className="other-note">* หากบันทึกแล้วจะไม่สามารถแก้ไขได้</div>
                </div>
              </div>
            </div>

            {/* =========================================================
                ✅ CEO SECTION (อัปเดตตามที่ขอ)
            ========================================================= */}
            <div className="ceo-other2-wrap">
              <div className="ceo-other2-head">
                <div className="ceo-other2-title">การลงทุนด้านอื่นๆ สำหรับ CEO</div>

                <div className="ceo-other2-sub">
                  งบกระแสเงินสดคงเหลือ: <b>{fmt(ceoOther2CashRemaining)}</b> บาท • ใช้ไป:{" "}
                  <b>{fmt(ceoOther2Total)}</b> บาท • คงเหลือ:{" "}
                  <b className={ceoOther2OverCash ? "is-over" : ""}>
                    {fmt(Math.max(0, ceoOther2CashAfter))}
                  </b>
                  {ceoOther2OverCash ? (
                    <span className="ceo-other2-over">
                      {" "}
                      (เงินสดไม่พอ {fmt(Math.abs(ceoOther2CashAfter))} บาท)
                    </span>
                  ) : null}
                  {loanApprovedAmount > 0 ? (
                    <span className="ceo-other2-loan-note">
                      {" "}
                      • ได้รับสินเชื่อเพิ่ม {fmt(loanApprovedAmount)} บาท
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="ceo-other2-grid">
                {CEO_OTHER2_GROUPS.map((g) => {
                  const Icon = g.icon;
                  const disabled = isSaved || ceoOther2Locked;

                  return (
                    <div key={g.id} className="ceo-other2-box">
                      <div className="ceo-other2-box-title">
                        <span className="ceo-other2-ic">
                          {Icon ? <Icon size={16} /> : <span style={{ fontWeight: 900 }}>•</span>}
                        </span>
                        <span>{g.title}</span>
                      </div>

                      <div className="ceo-other2-options">
                        {g.options.map((o) => {
                          const picked =
                            g.type === "radio"
                              ? ceoOther2Selection[g.id] === o.id
                              : (ceoOther2Selection[g.id] || []).includes(o.id);

                          return (
                            <label key={o.id} className={`ceo-other2-opt ${disabled ? "is-disabled" : ""}`}>
                              <input
                                type={g.type === "radio" ? "radio" : "checkbox"}
                                name={g.type === "radio" ? g.id : undefined}
                                checked={picked}
                                disabled={disabled}
                                onChange={() => toggleCeoOther2(g.id, o.id, g.type)}
                              />
                              <span className="ceo-other2-opt-text">
                                {o.label} รวม <b>{fmt(o.cost)}</b> บาท
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ceo-other2-foot">
                <div className="ceo-other2-total-pill">
                  ค่าใช้จ่ายรวมสำหรับ CEO: <b>{fmt(ceoOther2Total)}</b> บาท
                </div>

                <div className="ceo-other2-actions">
                  {/* ✅ ซ้าย: ขอสินเชื่อ (active เมื่อเงินสดไม่พอ) */}
                  <button
                    type="button"
                    className={`ceo-other2-loan ${ceoOther2OverCash ? "is-active" : ""}`}
                    onClick={openLoanPanel}
                    disabled={isSaved || !ceoOther2OverCash}
                    title={!ceoOther2OverCash ? "เงินสดพอ ไม่จำเป็นต้องกู้" : ""}
                  >
                    ขอสินเชื่อ
                  </button>

                  {/* ✅ ขวา: ยืนยันการลงทุน */}
                  <button
                    type="button"
                    className={`ceo-other2-save ${ceoOther2Locked ? "is-edit" : ""}`}
                    onClick={handleCeoOther2Confirm}
                    disabled={isSaved || ceoOther2OverCash}
                    title={ceoOther2OverCash ? "เงินสดไม่พอ กรุณาขอสินเชื่อก่อน" : ""}
                  >
                    {ceoOther2Locked ? "แก้ไข" : "ยืนยันการลงทุน"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Loan Panel (โผล่ด้านล่าง) */}
      {loanState.isOpen && (
        <div className="loan-panel-wrap">
          <div className="loan-panel-card">
            <div className="loan-panel-head">
              <div className="loan-panel-title">การขอสินเชื่อเพื่อธุรกิจ</div>
              <div className="loan-panel-sub">มูลค่าหลักทรัพย์และเครดิตของคุณ (Mock)</div>
            </div>

            <div className="loan-grid">
              {Object.values(LOAN_PRODUCTS).map((p) => {
                const selected = loanState.type === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`loan-item ${selected ? "selected" : ""}`}
                    onClick={() => setLoanState((s) => ({ ...s, type: p.id }))}
                  >
                    <div className="loan-item-top">
                      <div className="loan-item-title">{p.title}</div>
                      <span className="loan-item-dot" />
                    </div>
                    <div className="loan-item-hint">{p.hint}</div>

                    <div className="loan-row">
                      <span>จำนวนเงินกู้ที่ต้องการ</span>
                      <b>{fmt(loanAmount)}</b>
                    </div>

                    <div className="loan-row">
                      <span>ระยะเวลาผ่อน (ปี)</span>
                      <b>{loanYears}</b>
                    </div>

                    <div className="loan-row">
                      <span>อัตราดอกเบี้ยต่อปี</span>
                      <b>{Math.round(loanRate * 1000) / 10}%</b>
                    </div>

                    <div className="loan-row">
                      <span>ค่างวดประมาณ/เดือน</span>
                      <b>{fmt(loanMonthly)}</b>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ปรับจำนวนเงิน/ปี ตาม product ที่เลือก */}
            <div className="loan-adjust">
              <div className="loan-adjust-col">
                <div className="loan-label">จำนวนเงินกู้</div>
                <div className="loan-controls">
                  <button
                    type="button"
                    className="loan-btn"
                    onClick={() =>
                      setLoanState((s) => ({
                        ...s,
                        amount: clamp((s.amount || 0) - currentLoan.step, currentLoan.min, currentLoan.max),
                      }))
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    className="loan-input"
                    value={fmt(loanAmount)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      const num = Number(raw || 0);
                      if (Number.isNaN(num)) return;
                      setLoanState((s) => ({ ...s, amount: clamp(num, currentLoan.min, currentLoan.max) }));
                    }}
                  />

                  <button
                    type="button"
                    className="loan-btn"
                    onClick={() =>
                      setLoanState((s) => ({
                        ...s,
                        amount: clamp((s.amount || 0) + currentLoan.step, currentLoan.min, currentLoan.max),
                      }))
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="loan-range">
                  ช่วง: {fmt(currentLoan.min)} - {fmt(currentLoan.max)}
                </div>
              </div>

              <div className="loan-adjust-col">
                <div className="loan-label">ระยะเวลาผ่อน (ปี)</div>
                <div className="loan-controls">
                  <button
                    type="button"
                    className="loan-btn"
                    onClick={() =>
                      setLoanState((s) => ({
                        ...s,
                        years: clamp((s.years || 1) - 1, currentLoan.yearsMin, currentLoan.yearsMax),
                      }))
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    className="loan-input"
                    value={loanYears}
                    onChange={(e) => {
                      const num = Number(e.target.value || 0);
                      if (Number.isNaN(num)) return;
                      setLoanState((s) => ({ ...s, years: clamp(num, currentLoan.yearsMin, currentLoan.yearsMax) }));
                    }}
                  />

                  <button
                    type="button"
                    className="loan-btn"
                    onClick={() =>
                      setLoanState((s) => ({
                        ...s,
                        years: clamp((s.years || 1) + 1, currentLoan.yearsMin, currentLoan.yearsMax),
                      }))
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="loan-range">
                  ช่วง: {currentLoan.yearsMin} - {currentLoan.yearsMax} ปี
                </div>
              </div>
            </div>

            <div className="loan-actions">
              <button type="button" className="loan-cancel" onClick={cancelLoan}>
                ยังไม่ตัดสินใจ
              </button>

              <button type="button" className="loan-confirm" onClick={applyLoan}>
                ยืนยันการยื่นกู้
              </button>
            </div>

            <div className="loan-note-red">หากธนาคารอนุมัติจะได้รับเงินทันที</div>
          </div>
        </div>
      )}

      {/* ✅ Insurance Plan Modal (Mock) */}
      {isPlanModalOpen && modalPlan && (
        <div className="ins-modal-overlay" onClick={() => setIsPlanModalOpen(false)} role="dialog" aria-modal="true">
          <div className="ins-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ins-modal-head" style={{ color: getAccentColor(modalPlan.accent) }}>
              <div className="ins-modal-title">
                <span className="ins-modal-accent-dot" />
                รายละเอียดแผน: {modalPlan.nameTH}
              </div>

              <button type="button" className="ins-modal-close" onClick={() => setIsPlanModalOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="ins-modal-body">
              <div className="ins-modal-grid">
                <div className="ins-modal-card">
                  <div className="ins-modal-label">ทุนประกัน</div>
                  <div className="ins-modal-value">{fmt(modalPlan.coverage)} บาท</div>
                </div>

                <div className="ins-modal-card">
                  <div className="ins-modal-label">เบี้ยประกัน</div>
                  <div className="ins-modal-value">{fmt(modalPlan.cost)} บาท/ปี</div>
                </div>

                <div className="ins-modal-card">
                  <div className="ins-modal-label">เหมาะสำหรับ</div>
                  <div className="ins-modal-value">{modalPlan.note}</div>
                </div>

                <div className="ins-modal-card">
                  <div className="ins-modal-label">เงื่อนไข (Mock)</div>
                  <div className="ins-modal-value">ชำระรายปี / คุ้มครองทันที</div>
                </div>
              </div>

              <div className="ins-modal-list">
                <h4>สิ่งที่คุ้มครอง (ตัวอย่าง)</h4>
                <ul>
                  <li>ความเสียหายจากอัคคีภัย/ไฟฟ้าลัดวงจร</li>
                  <li>ความเสียหายต่อทรัพย์สินและอุปกรณ์โรงแรม</li>
                  <li>ภัยธรรมชาติ (ขึ้นกับแพ็กเกจ)</li>
                  <li>ความรับผิดต่อบุคคลภายนอก (บางแผน)</li>
                </ul>
              </div>
            </div>

            <div className="ins-modal-foot">
              <button type="button" className="ins-modal-btn" onClick={() => setIsPlanModalOpen(false)}>
                ปิด
              </button>

              <button
                type="button"
                className="ins-modal-btn primary"
                onClick={() => {
                  if (insuranceLocked || isSaved) return;
                  setInsuranceChoice(modalPlan.id);
                  setIsPlanModalOpen(false);
                }}
              >
                เลือกแผนนี้
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="decision-footer">
        <div className="footer-text">© 2026 Hotel Business Simulation Game. All rights reserved.</div>
      </footer>
    </div>
  );
}
