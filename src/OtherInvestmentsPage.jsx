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
  Plus,
  Minus,
  Shield,
  Building2,
  HandHeart,
  Zap,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;
const STORAGE_KEY_BUDGETS = "hbs_round1_decision_budgets";
const STORAGE_KEY_OTHER = "hbs_round1_other_investments";

const fmt = (n) => (Number(n) || 0).toLocaleString();

const pctChange = (curr, prev) => {
  if (!prev) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

/**
 * ✅ สำคัญ:
 * - ห้ามเก็บ "icon component" ลง localStorage เพราะ JSON.stringify จะทำให้ icon พัง
 * - เก็บเฉพาะข้อมูลที่เป็น JSON ได้จริง แล้วค่อยเติม icon ตอน render
 */
const SECTION_ICONS = {
  insurance: Shield,
  assets: Building2,
  csr: HandHeart,
  expansion: Zap,
};

const DEFAULT_SECTIONS = [
  {
    id: "insurance",
    title: "เลือกแผนประกันภัย (Insurance Plans)",
    cards: [
      {
        id: "ins_property",
        title: "ประกันทรัพย์สิน (Property)",
        subtitle: "คุ้มครองความเสียหายทรัพย์สินหลัก",
        budget: 120_000,
        prev: 100_000,
        min: 0,
        step: 10_000,
        pill: "Basic",
        accent: "blue",
      },
      {
        id: "ins_liability",
        title: "ประกันความรับผิด (Liability)",
        subtitle: "คุ้มครองความเสี่ยงจากการให้บริการ",
        budget: 180_000,
        prev: 160_000,
        min: 0,
        step: 10_000,
        pill: "Standard",
        accent: "purple",
      },
      {
        id: "ins_business",
        title: "ประกันธุรกิจหยุดชะงัก (Business Interruption)",
        subtitle: "ลดความเสี่ยงรายได้หายช่วงเกิดเหตุ",
        budget: 250_000,
        prev: 250_000,
        min: 0,
        step: 10_000,
        pill: "Premium",
        accent: "green",
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
        subtitle: "ความเสี่ยงสูง ผลตอบแทนผันผวน",
        budget: 300_000,
        prev: 350_000,
        min: 0,
        step: 10_000,
        pill: "High Risk",
        accent: "yellow",
      },
      {
        id: "asset_fund",
        title: "กองทุนรวม",
        subtitle: "กระจายความเสี่ยงได้ดีขึ้น",
        budget: 400_000,
        prev: 420_000,
        min: 0,
        step: 10_000,
        pill: "Balanced",
        accent: "purple",
      },
      {
        id: "asset_reit",
        title: "อสังหาฯ (REIT/Property)",
        subtitle: "รายได้สม่ำเสมอ ความเสี่ยงกลาง",
        budget: 350_000,
        prev: 360_000,
        min: 0,
        step: 10_000,
        pill: "Stable",
        accent: "green",
      },
    ],
  },
  {
    id: "csr",
    title: "การลงทุนเพื่อสังคม (Corporate Social Responsibility: CSR)",
    cards: [
      {
        id: "csr_edu",
        title: "ทุนการศึกษา",
        subtitle: "สนับสนุนโอกาสทางการศึกษา",
        budget: 90_000,
        prev: 80_000,
        min: 0,
        step: 5_000,
        pill: "Edu",
        accent: "blue",
      },
      {
        id: "csr_env",
        title: "สิ่งแวดล้อม",
        subtitle: "ลดผลกระทบ/กิจกรรมรักษ์โลก",
        budget: 70_000,
        prev: 70_000,
        min: 0,
        step: 5_000,
        pill: "Eco",
        accent: "green",
      },
      {
        id: "csr_health",
        title: "สุขภาพชุมชน",
        subtitle: "สนับสนุนสาธารณสุขในพื้นที่",
        budget: 60_000,
        prev: 50_000,
        min: 0,
        step: 5_000,
        pill: "Care",
        accent: "purple",
      },
    ],
  },
  {
    id: "expansion",
    title: "การขยายเพื่อธุรกิจ (Business Expansion)",
    cards: [
      {
        id: "exp_digital",
        title: "ระบบดิจิทัล/Automation",
        subtitle: "เพิ่มประสิทธิภาพ ลดต้นทุนระยะยาว",
        budget: 200_000,
        prev: 180_000,
        min: 0,
        step: 10_000,
        pill: "Tech",
        accent: "blue",
      },
      {
        id: "exp_partner",
        title: "พาร์ทเนอร์/ดีลธุรกิจ",
        subtitle: "ขยายช่องทางรายได้และฐานลูกค้า",
        budget: 220_000,
        prev: 220_000,
        min: 0,
        step: 10_000,
        pill: "Biz",
        accent: "green",
      },
      {
        id: "exp_newsvc",
        title: "บริการใหม่",
        subtitle: "ทดลองแพ็กเกจ/โปรดักต์เสริม",
        budget: 160_000,
        prev: 150_000,
        min: 0,
        step: 10_000,
        pill: "New",
        accent: "purple",
      },
    ],
  },
];

// เติม icon กลับตอนใช้งาน
const withIcons = (secs) =>
  (Array.isArray(secs) ? secs : []).map((s) => ({
    ...s,
    icon: SECTION_ICONS[s.id],
  }));

export default function OtherInvestmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // อ่านงบจากหน้า CEO (DecisionPage) จาก localStorage (id=4 คือ “งบการลงทุนด้านอื่นๆ”)
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

  // ✅ งบเพดานของหน้านี้: ใช้จาก state ก่อน ถ้าไม่มีค่อย fallback ไปอ่าน storage id=4
  const ceoOtherBudget =
    location.state?.ceoOtherBudget ?? getBudgetFromStorage(4) ?? 0;

  // ค่าทั่วไป (เหมือนหน้าอื่น)
  const commonState = {
    ceoCash: location.state?.ceoCash ?? TOTAL_BUDGET,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 3.5,
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
    ceoOtherBudget, // ✅ ส่งต่อไว้ด้วย เผื่อกดไปหน้าอื่นแล้วกลับมา
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

  // เซฟแบบตัด icon ออก
  useEffect(() => {
    const serializableSections = sections.map(({ icon, ...rest }) => rest);
    localStorage.setItem(
      STORAGE_KEY_OTHER,
      JSON.stringify({ sections: serializableSections, isSaved })
    );
  }, [sections, isSaved]);

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

  const totalSpend = useMemo(() => {
    return sections.reduce(
      (acc, s) => acc + s.cards.reduce((a, c) => a + (c.budget || 0), 0),
      0
    );
  }, [sections]);

  // ✅✅✅ สำคัญ: remaining/isOver ต้องเทียบกับ “งบด้านอื่นๆ” ของ CEO
  const remaining = (ceoOtherBudget || 0) - totalSpend;
  const isOver = remaining < 0;

  const handleSave = () => {
    if (isSaved) return;
    if (window.confirm("ยืนยันการบันทึกการลงทุนด้านอื่นๆ?")) setIsSaved(true);
  };

  return (
    <div className="decision-page other-page">
      {/* ====== TOP STATS ====== */}
      <div className="stats-grid">
        {/* 1) งบการลงทุนด้านอื่นๆ (ดึงจาก CEO) */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการลงทุนด้านอื่นๆ</span>
            <div className="stat-icon-box">
              <Banknote size={18} />
            </div>
          </div>

          {/* ✅ จากเดิม fmt(2_000_000) -> ใช้ ceoOtherBudget */}
          <div className="stat-value">{fmt(ceoOtherBudget)}</div>

          {/* ถ้าจะมี “งบไตรมาสก่อน” จริง ๆ ต้องมาจาก data ของเกม
              ตอนนี้ใส่ placeholder ไว้เหมือนเดิม */}
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
                      {SecIcon ? (
                        <SecIcon size={16} />
                      ) : (
                        <span style={{ fontWeight: 900 }}>•</span>
                      )}
                    </span>
                    <span>{sec.title}</span>
                  </div>
                </div>

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
              </div>
            );
          })}

          {/* ====== Bottom summary ====== */}
          <div className="other-bottom-wrap">
            <div className="other-bottom-card">
              <div className="other-bottom-left">
                <div className="other-bottom-title">
                  ต้นทุนรวมการลงทุนด้านอื่นๆ (ไตรมาสที่ 1)
                </div>
                <div className="other-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>
                <div className="other-bottom-sub">
                  งบคงเหลือ :{" "}
                  <b className={isOver ? "is-over" : ""}>{fmt(Math.max(0, remaining))}</b>
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
        </div>
      </div>

      <footer className="decision-footer">
        <div className="footer-text">© 2026 Hotel Business Simulation Game. All rights reserved.</div>
      </footer>
    </div>
  );
}
