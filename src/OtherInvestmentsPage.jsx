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

/* ✅ NEW: CEO Other Investments */
const STORAGE_KEY_CEO_OTHER2 = "hbs_round1_ceo_other2";

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
  {
    id: "plan_starter",
    nameTH: "ขั้นเริ่มต้น",
    coverage: 5_000_000,
    note: "คุ้มครองพื้นฐานสำหรับเริ่มต้น",
    cost: 9_000,
    accent: "yellow",
  },
  {
    id: "plan_basic",
    nameTH: "ขั้นพื้นฐาน",
    coverage: 10_000_000,
    note: "เหมาะสำหรับโรงแรมขนาดกลาง",
    cost: 16_000,
    accent: "blue",
  },
  {
    id: "plan_standard",
    nameTH: "ขั้นกลาง",
    coverage: 20_000_000,
    note: "คุ้มครองครอบคลุมขึ้น",
    cost: 30_000,
    accent: "purple",
  },
  {
    id: "plan_premium",
    nameTH: "ขั้นสูง",
    coverage: 40_000_000,
    note: "คุ้มครองสูงสุด ลดความเสี่ยงมาก",
    cost: 54_000,
    accent: "green",
  },
];

const DEFAULT_SECTIONS = [
  {
    id: "insurance",
    title: "เลือกแผนประกันภัย (Insurance Plans)",
    cards: [
      {
        id: "ins_property",
        title: "ประกันภัยทรัพย์สิน (Property)",
        subtitle: "เลือกแพ็กเกจประกันภัยทรัพย์สิน",
        budget: 0,
        prev: 0,
        min: 0,
        step: 0,
        pill: "Property",
        accent: "blue",
      },
    ],
  },
  {
    id: "assets",
    title: "การลงทุนในหุ้น กองทุน หรืออสังหาฯ",
    cards: [
      {
        id: "asset_stock",
        title: "หุ้น",
        subtitle: "ระดับความเสี่ยงสูง ผลตอบแทนผันผวน",
        budget: 100_000,
        prev: 100_000,
        min: 0,
        step: 10_000,
        pill: "High Risk",
        accent: "yellow",
      },
      {
        id: "asset_fund",
        title: "กองทุนรวม",
        subtitle: "ระดับความเสี่ยงปานกลาง กระจายความเสี่ยงได้ดี",
        budget: 100_000,
        prev: 100_000,
        min: 0,
        step: 10_000,
        pill: "Balanced",
        accent: "purple",
      },
      {
        id: "asset_reit",
        title: "อสังหาฯ (REIT/Property)",
        subtitle: "ระดับความเสี่ยงต่ำถึงปานกลาง รายได้สม่ำเสมอ",
        budget: 100_000,
        prev: 100_000,
        min: 0,
        step: 10_000,
        pill: "Stable",
        accent: "green",
      },
    ],
  },
  {
    id: "csr",
    title: "การลงทุนด้านโครงการเพื่อสังคม (Corporate Social Responsibility: CSR)",
    cards: [
      {
        id: "csr_edu",
        title: "การศึกษา",
        subtitle: "สนับสนุนโอกาสทางการศึกษา",
        budget: 50_000,
        prev: 50_000,
        min: 0,
        step: 5_000,
        pill: "Edu",
        accent: "blue",
      },
      {
        id: "csr_health",
        title: "สาธารณสุข",
        subtitle: "สนับสนุนสาธารณสุขในพื้นที่",
        budget: 50_000,
        prev: 50_000,
        min: 0,
        step: 5_000,
        pill: "Care",
        accent: "purple",
      },
      {
        id: "csr_env",
        title: "สิ่งแวดล้อม",
        subtitle: "ลดผลกระทบ/กิจกรรมรักษ์โลก",
        budget: 50_000,
        prev: 50_000,
        min: 0,
        step: 5_000,
        pill: "Eco",
        accent: "green",
      },
      {
        id: "csr_people",
        title: "ทรัพยากรมนุษย์และสังคม",
        subtitle: "พัฒนาคน/สังคมในพื้นที่และชุมชน",
        budget: 50_000,
        prev: 50_000,
        min: 0,
        step: 5_000,
        pill: "People",
        accent: "gray",
      },
    ],
  },
];

const CSR_META = {
  csr_edu: {
    icon: BookOpen,
    hint: "ลดหย่อนภาษีได้ 2 เท่า แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ",
  },
  csr_health: {
    icon: Stethoscope,
    hint: "ลดหย่อนภาษีได้ 2 เท่า แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ",
  },
  csr_env: {
    icon: Leaf,
    hint: "ลดหย่อนภาษีได้ แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ",
  },
  csr_people: {
    icon: UsersRound,
    hint: "ลดหย่อนภาษีได้ แต่ไม่เกินร้อยละ 10 ของกำไรสุทธิ",
  },
};

const getAccentColor = (accent) => {
  switch (accent) {
    case "yellow":
      return "#B45309";
    case "blue":
      return "#2563EB";
    case "purple":
      return "#7C3AED";
    case "green":
      return "#16A34A";
    default:
      return "#334155";
  }
};

const withIcons = (secs) =>
  (Array.isArray(secs) ? secs : []).map((s) => ({
    ...s,
    icon: SECTION_ICONS[s.id],
  }));

/* ✅ NEW: CEO OTHER2 GROUPS (radio + check) */
const CEO_OTHER2_GROUPS = [
  {
    id: "solar",
    title: "ติดตั้งโซล่าเซลล์",
    icon: Zap,
    type: "radio",
    options: [
      { id: "solar_6kw", label: "ขนาด 6 kW", cost: 115_000 },
      { id: "solar_11kw", label: "ขนาด 11 kW", cost: 199_000 },
      { id: "solar_20kw", label: "ขนาด 20 kW", cost: 670_000 },
    ],
  },
  {
    id: "ev",
    title: "สถานีชาร์จรถไฟฟ้า",
    icon: Leaf,
    type: "radio",
    options: [
      { id: "ev_1", label: "รถยนต์ไฟฟ้า 1 จุด + จักรยานยนต์ 1 จุด", cost: 100_000 },
      { id: "ev_2", label: "รถยนต์ไฟฟ้า 2 จุด + จักรยานยนต์ 1 จุด", cost: 150_000 },
    ],
  },
  {
    id: "digital_ai",
    title: "ระบบดิจิทัลและ AI",
    icon: PieChart,
    type: "check",
    options: [
      { id: "dig_pos", label: "ระบบดิจิทัลสมาร์ท", cost: 1_000_000 },
      { id: "dig_cloud", label: "ระบบจัดเก็บข้อมูลบน Cloud", cost: 20_000 },
      { id: "dig_ai", label: "ระบบแชทบอท AI", cost: 100_000 },
    ],
  },
  {
    id: "hotel_extra",
    title: "กิจการเสริมของโรงแรม",
    icon: Building2,
    type: "check",
    options: [
      { id: "extra_vend", label: "ตู้ขาย น้ำ/อาหาร อัตโนมัติ", cost: 160_000 },
      { id: "extra_mini", label: "มินิมาร์ท ขนาดเล็ก", cost: 1_200_000 },
      { id: "extra_cafe", label: "ร้านกาแฟ", cost: 850_000 },
    ],
  },
  {
    id: "common_area",
    title: "พื้นที่ส่วนกลาง",
    icon: Users,
    type: "check",
    options: [
      { id: "area_cowork", label: "Co-working Space", cost: 500_000 },
      { id: "area_meet", label: "ห้องประชุม", cost: 50_000 },
    ],
  },
];

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

  const ceoOtherBudget =
    location.state?.ceoOtherBudget ?? getBudgetFromStorage(4) ?? 0;

  const commonState = {
    ceoCash: location.state?.ceoCash ?? TOTAL_BUDGET,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 3.5,
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
    ceoOtherBudget,
  };

  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        return !!JSON.parse(saved).isSaved;
      } catch {}
    }
    return false;
  });

  const [insuranceChoice, setInsuranceChoice] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        return JSON.parse(saved).insuranceChoice || "plan_basic";
      } catch {}
    }
    return "plan_basic";
  });

  const [insuranceLocked, setInsuranceLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        return !!JSON.parse(saved).insuranceLocked;
      } catch {}
    }
    return false;
  });

  // ✅ assets lock
  const [assetsLocked, setAssetsLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        return !!JSON.parse(saved).assetsLocked;
      } catch {}
    }
    return false;
  });

  // ✅ csr lock
  const [csrLocked, setCsrLocked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OTHER);
    if (saved) {
      try {
        return !!JSON.parse(saved).csrLocked;
      } catch {}
    }
    return false;
  });

  // ✅ Insurance Modal mock
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalPlanId, setModalPlanId] = useState(null);

  const modalPlan = useMemo(() => {
    return INSURANCE_PLANS.find((p) => p.id === modalPlanId) || null;
  }, [modalPlanId]);

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
        return {
          ...sec,
          cards: sec.cards.map((c) =>
            c.id === cardId ? { ...c, budget: safe } : c
          ),
        };
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
            c.id === cardId
              ? { ...c, budget: Math.max(c.min ?? 0, (c.budget || 0) + delta) }
              : c
          ),
        };
      })
    );
  };

  const selectedPlan = useMemo(
    () =>
      INSURANCE_PLANS.find((p) => p.id === insuranceChoice) || INSURANCE_PLANS[1],
    [insuranceChoice]
  );

  // ✅ ประกันจะนับรวมเฉพาะตอน insuranceLocked = true
  const insuranceSpend = insuranceLocked ? selectedPlan?.cost || 0 : 0;

  // ✅ totalSpend: รวมทุก section ยกเว้น insurance แล้ว + insuranceSpend ทีหลัง
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

  // ✅ insurance: บันทึก/แก้ไข
  const handleInsuranceToggle = () => {
    if (isSaved) return;
    if (insuranceLocked) {
      setInsuranceLocked(false);
      return;
    }
    if (window.confirm("ยืนยันการบันทึกแผนประกันภัย?")) {
      setInsuranceLocked(true);
    }
  };

  // ✅ assets: บันทึก/แก้ไข
  const handleAssetsToggle = () => {
    if (isSaved) return;
    if (assetsLocked) {
      setAssetsLocked(false);
      return;
    }
    if (window.confirm("ยืนยันการบันทึกการลงทุนในหุ้น/กองทุน/อสังหาฯ ?")) {
      setAssetsLocked(true);
    }
  };

  // ✅ CSR: บันทึก/แก้ไข
  const handleCsrToggle = () => {
    if (isSaved) return;
    if (csrLocked) {
      setCsrLocked(false);
      return;
    }
    if (window.confirm("ยืนยันการบันทึกการลงทุน CSR?")) {
      setCsrLocked(true);
    }
  };

  /* =========================================================
     ✅ NEW: CEO OTHER INVESTMENTS (radio + checkboxes)
     - แยก lock ของตัวเอง
     - มีงบของตัวเอง
  ========================================================= */
  const CEO_OTHER2_BUDGET = location.state?.ceoOther2Budget ?? 1_200_000;

  const [ceoOther2Locked, setCeoOther2Locked] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CEO_OTHER2);
    if (!saved) return false;
    try {
      return !!JSON.parse(saved).locked;
    } catch {
      return false;
    }
  });

  const [ceoOther2Selection, setCeoOther2Selection] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CEO_OTHER2);
    const fallback = {
      solar: null, // radio
      ev: null, // radio
      digital_ai: [], // check
      hotel_extra: [], // check
      common_area: [], // check
    };
    if (!saved) return fallback;
    try {
      return JSON.parse(saved).selection || fallback;
    } catch {
      return fallback;
    }
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

  const ceoOther2Remaining = (CEO_OTHER2_BUDGET || 0) - ceoOther2Total;
  const ceoOther2Over = ceoOther2Remaining < 0;

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

  const handleCeoOther2Save = () => {
    if (isSaved) return;

    if (ceoOther2Locked) {
      setCeoOther2Locked(false);
      return;
    }

    if (ceoOther2Over) {
      alert("งบไม่พอ กรุณาลดรายการลงทุนก่อน");
      return;
    }

    if (window.confirm("ยืนยันบันทึกการลงทุนด้านอื่นๆ สำหรับ CEO ?")) {
      setCeoOther2Locked(true);
    }
  };

  return (
    <div className="decision-page other-page">
      {/* ====== TOP STATS ====== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการลงทุนด้านอื่นๆ</span>
            <div className="stat-icon-box">
              <Banknote size={18} />
            </div>
          </div>
          <div className="stat-value">{fmt(ceoOtherBudget)}</div>
          <div className="stat-sub">งบไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ความเสี่ยงด้านพินาศ</span>
            <div className="stat-icon-box">
              <span style={{ fontWeight: 900 }}>■</span>
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>
            ปานกลาง
          </div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดีมาก</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">มูลค่าทรัพย์สิน</span>
            <div className="stat-icon-box">
              <span style={{ fontWeight: 900 }}>☺</span>
            </div>
          </div>
          <div className="stat-value">{fmt(400_000_000)}</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ดอกเบี้ยจ่าย</span>
            <div className="stat-icon-box">
              <span style={{ fontWeight: 900 }}>↩</span>
            </div>
          </div>
          <div className="stat-value">{fmt(200_000)}</div>
          <div className="stat-sub">ต่อไตรมาส</div>
        </div>
      </div>

      {/* ====== MAIN TABS ====== */}
      <div className="decision-tabs">
        <button
          className="tab-btn"
          onClick={() => navigate("/decision", { state: commonState })}
        >
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>

        <button className="tab-btn" onClick={() => navigate("/pricing")}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/marketing", {
              state: {
                ...commonState,
                ceoMarketingBudget: mktBudget,
                ceoHRBudget: hrBudget,
              },
            });
          }}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/personnel", {
              state: {
                ...commonState,
                ceoMarketingBudget: mktBudget,
                ceoHRBudget: hrBudget,
              },
            });
          }}
        >
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>

        <button className="tab-btn" onClick={() => navigate("/maintenance")}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>

        <button className="tab-btn active">
          <Camera size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

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
                            className={[
                              "ins-plan",
                              `accent-${p.accent}`,
                              selected ? "selected" : "",
                              lockDim ? "is-dim" : "",
                            ].join(" ")}
                            onClick={() => {
                              if (insuranceLocked || isSaved) return;
                              setInsuranceChoice(p.id);
                            }}
                            disabled={isSaved}
                          >
                            <span className="ins-radio" aria-hidden="true">
                              <span className="ins-radio-dot" />
                            </span>

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
                          <div
                            key={c.id}
                            className={`asset-card accent-${c.accent} ${disabled ? "is-locked" : ""}`}
                          >
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

                            <button
                              type="button"
                              className="asset-link"
                              onClick={() => alert("Mock: รายละเอียดเพิ่มเติม")}
                            >
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

                            <div className="csr-hint">
                              {meta.hint || "ลดหย่อนภาษีได้ (เงื่อนไขตามที่กำหนด)"}
                            </div>
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

                {/* ✅ Fallback old cards (ถ้ามี section อื่น) */}
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

          {/* ====== Bottom summary (ของ OtherInvestments เดิม) ====== */}
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
                  <span className="other-check">
                    <Check size={16} strokeWidth={3} />
                  </span>
                  {isSaved ? "บันทึกเรียบร้อย" : "บันทึกการลงทุนด้านอื่นๆ"}
                </button>

                <div className="other-note">* หากบันทึกแล้วจะไม่สามารถแก้ไขได้</div>
              </div>
            </div>
          </div>

          {/* =========================================================
              ✅ NEW SECTION: การลงทุนด้านอื่นๆ สำหรับ CEO
              - ตามรูป: กล่องใหญ่ มีหัวข้อ + 5 กลุ่ม
              - กลุ่ม radio 2 กลุ่ม + checkbox 3 กลุ่ม
              - มียอดรวม + ปุ่มบันทึก/แก้ไข
          ========================================================= */}
          <div className="ceo-other2-wrap">
            <div className="ceo-other2-head">
              <div className="ceo-other2-title">การลงทุนด้านอื่นๆ สำหรับ CEO</div>
              <div className="ceo-other2-sub">
                งบสำหรับส่วนนี้: <b>{fmt(CEO_OTHER2_BUDGET)}</b> บาท • ใช้ไป:{" "}
                <b>{fmt(ceoOther2Total)}</b> บาท • คงเหลือ:{" "}
                <b className={ceoOther2Over ? "is-over" : ""}>
                  {fmt(Math.max(0, ceoOther2Remaining))}
                </b>
                {ceoOther2Over ? (
                  <span className="ceo-other2-over">
                    {" "}
                    (งบไม่พอ {fmt(Math.abs(ceoOther2Remaining))} บาท)
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
                          <label
                            key={o.id}
                            className={`ceo-other2-opt ${disabled ? "is-disabled" : ""}`}
                          >
                            <input
                                type={g.type === "radio" ? "radio" : "checkbox"}   // ✅ สำคัญ
                                name={g.type === "radio" ? g.id : undefined}       // ✅ radio ต้องมี name เดียวกัน
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

              <button
                type="button"
                className={`ceo-other2-save ${ceoOther2Locked ? "is-edit" : ""}`}
                onClick={handleCeoOther2Save}
                disabled={isSaved || ceoOther2Over}
                title={ceoOther2Over ? "งบไม่พอ กรุณาลดรายการ" : ""}
              >
                {ceoOther2Locked ? "แก้ไข" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Insurance Plan Modal (Mock) */}
      {isPlanModalOpen && modalPlan && (
        <div
          className="ins-modal-overlay"
          onClick={() => setIsPlanModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ins-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ins-modal-head" style={{ color: getAccentColor(modalPlan.accent) }}>
              <div className="ins-modal-title">
                <span className="ins-modal-accent-dot" />
                รายละเอียดแผน: {modalPlan.nameTH}
              </div>

              <button
                type="button"
                className="ins-modal-close"
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close"
              >
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
              <button
                type="button"
                className="ins-modal-btn"
                onClick={() => setIsPlanModalOpen(false)}
              >
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
