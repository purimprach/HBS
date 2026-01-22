import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DecisionPage.css";
import "./MaintenancePage.css";
import "./PersonnelPage.css";

import {
  Banknote,
  Users,
  Check,
  PieChart,
  Tag,
  Megaphone,
  Wrench,
  Plus,
  Minus,
  Camera,
  Star,
  Smile,
  LogOut,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;
const STORAGE_KEY_BUDGETS = "hbs_round1_decision_budgets";
const HR_STORAGE_KEY = "hbs_round1_personnel_decisions";

const INITIAL_STAFF_GROUPS = [
  {
    id: "housekeeping",
    label: "แม่บ้าน",
    countLabel: "19 คน",
    bannerImg: "/PersonalPic/Maid.png",
    items: [
      { id: "hk_training", title: "พัฒนาและอบรม", subtitle: "อบรมมาตรฐานงานแม่บ้าน", budget: 50000, prev: 45000, min: 0, step: 5000 },
      { id: "hk_bonus", title: "โบนัสประจำไตรมาส", subtitle: "เพิ่มแรงจูงใจ", budget: 25000, prev: 30000, min: 0, step: 5000 },
      { id: "hk_welfare", title: "สวัสดิการประจำไตรมาส", subtitle: "ค่าเดินทาง/สุขภาพ", budget: 20000, prev: 25000, min: 0, step: 5000 },
    ],
  },
  {
    id: "staff",
    label: "พนักงาน",
    countLabel: "40 คน",
    bannerImg: "/PersonalPic/Employee.png",
    items: [
      { id: "st_training", title: "พัฒนาและอบรม", subtitle: "งานบริการ/การขาย", budget: 80000, prev: 70000, min: 0, step: 5000 },
      { id: "st_bonus", title: "โบนัสประจำไตรมาส", subtitle: "เพิ่มแรงจูงใจทีมหน้าบ้าน", budget: 60000, prev: 65000, min: 0, step: 5000 },
      { id: "st_welfare", title: "สวัสดิการประจำไตรมาส", subtitle: "ยูนิฟอร์ม/ประกัน", budget: 50000, prev: 45000, min: 0, step: 5000 },
    ],
  },
];

const fmt = (n) => (Number(n) || 0).toLocaleString();

const pctChange = (curr, prev) => {
  if (!prev) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

export default function PersonnelPage() {
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
      console.error(e);
    }
    return 0;
  };

  const ceoHRBudget = location.state?.ceoHRBudget ?? getBudgetFromStorage(2);

  const commonState = {
    ceoCash: location.state?.ceoCash ?? TOTAL_BUDGET,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 3.5,
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
    ceoHRBudget,
  };

  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(HR_STORAGE_KEY);
    if (saved) {
      try {
        return !!JSON.parse(saved).isSaved;
      } catch (e) {}
    }
    return false;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem(HR_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.groups)) return parsed.groups;
      } catch (e) {}
    }
    return INITIAL_STAFF_GROUPS;
  });

  useEffect(() => {
    localStorage.setItem(HR_STORAGE_KEY, JSON.stringify({ groups, isSaved }));
  }, [groups, isSaved]);

  const updateItemBudget = (groupId, itemId, nextValue) => {
    if (isSaved) return;
    const safe = Math.max(0, Number(nextValue) || 0);
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) => (it.id === itemId ? { ...it, budget: safe } : it)),
        };
      })
    );
  };

  const adjustItem = (groupId, itemId, delta) => {
    if (isSaved) return;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) =>
            it.id === itemId ? { ...it, budget: Math.max(0, (it.budget || 0) + delta) } : it
          ),
        };
      })
    );
  };

  const totalSpend = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.items.reduce((a, it) => a + (it.budget || 0), 0), 0);
  }, [groups]);

  const remaining = ceoHRBudget - totalSpend;
  const over = Math.max(0, totalSpend - ceoHRBudget);
  const isOver = over > 0;

  const handleSave = () => {
    if (isSaved) return;
    if (window.confirm("ยืนยันการตัดสินใจรอบนี้?")) setIsSaved(true);
  };

  return (
    <div className="decision-page personnel-page">
      {/* ====== TOP STATS ====== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการพัฒนาบุคคล</span>
            <div className="stat-icon-box"><Banknote size={18} /></div>
          </div>
          <div className="stat-value">{fmt(ceoHRBudget)}</div>
          <div className="stat-sub">งบไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ความพึงพอใจต่อส่วนบริการ</span>
            <div className="stat-icon-box"><Star size={18} /></div>
          </div>
          <div className="stat-value">3.5 /5</div>
          <div className="stat-sub">ความพึงพอใจโดยรวม : พอใช้</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ความพึงพอใจพนักงาน</span>
            <div className="stat-icon-box"><Smile size={18} /></div>
          </div>
          <div className="stat-value">78%</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">จำนวนคนลาออก</span>
            <div className="stat-icon-box"><LogOut size={18} /></div>
          </div>
          <div className="stat-value">0 คน</div>
          <div className="stat-sub">สถานะ : ดีมาก</div>
        </div>
      </div>

      {/* ====== MAIN TABS ====== */}
      <div className="decision-tabs">
        <button className="tab-btn" onClick={() => navigate("/decision")}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>
        <button className="tab-btn" onClick={() => navigate("/pricing", { state: commonState })}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        <button
          className="tab-btn"
          onClick={() => {
            const mkt = getBudgetFromStorage(1);
            navigate("/marketing", { state: { ...commonState, ceoMarketingBudget: mkt } });
          }}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>
        <button className="tab-btn active">
          <Users size={15} /> <span>การลงทุนด้านบุคคลกร</span>
        </button>
        <button className="tab-btn" onClick={() => navigate("/maintenance", { state: commonState })}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        <button className={`tab-btn ${location.pathname === '/other' ? 'active' : ''}`} onClick={() => navigate('/other')}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="decision-content">
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="personnel-page-header">
            <h2>การลงทุนด้านการพัฒนาบุคคล</h2>
          </div>

          {/* ✅ กล่องใหญ่ครอบทั้งหมด (เหมือนรูป) */}
          <div className="hr-wrapper hr-wrapper-card">
            {groups.map((g) => (
              <div key={g.id} className="hr-group hr-group-card">
                {/* หัวกลุ่ม (แม่บ้าน + pill) */}
                <div className="hr-group-head">
                  <h3 className="hr-group-title">{g.label}</h3>
                  <span className="hr-pill">{g.countLabel}</span>
                </div>

                {/* banner */}
                <div className="hr-banner">
                  <img src={g.bannerImg} alt={g.label} />
                </div>

                {/* ✅ กล่องเล็กครอบรายการแต่ละอัน */}
                <div className="hr-items">
                  {g.items.map((it) => {
                    const pct = pctChange(it.budget, it.prev);
                    const up = pct > 0;
                    const down = pct < 0;
                    const hitMin = (it.budget || 0) <= (it.min || 0);

                    return (
                      <div key={it.id} className="hr-item hr-item-card">
                        <div className="hr-item-left">
                          <div className="hr-item-title">{it.title}</div>
                          <div className="hr-item-sub">{it.subtitle}</div>
                        </div>

                        <div className="hr-item-right">
                          <div className="hr-controls">
                            <button
                              className={`hr-mini-btn ${hitMin ? "limit" : ""}`}
                              onClick={() => adjustItem(g.id, it.id, -(it.step || 0))}
                              disabled={isSaved || hitMin}
                            >
                              <Minus size={16} />
                            </button>

                            <input
                              className="hr-input"
                              type="text"
                              value={fmt(it.budget)}
                              disabled={isSaved}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/,/g, "");
                                const num = Number(raw || 0);
                                if (!Number.isNaN(num)) updateItemBudget(g.id, it.id, num);
                              }}
                            />

                            <button
                              className="hr-mini-btn"
                              onClick={() => adjustItem(g.id, it.id, it.step || 0)}
                              disabled={isSaved}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="hr-meta">
                            <span>งบก่อนหน้า : {fmt(it.prev)}</span>
                            <span className={`hr-pct ${down ? "down" : up ? "up" : ""}`}>
                              {pct === 0 ? "0.00%" : `${up ? "+" : ""}${pct.toFixed(2)}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Summary (เหมือนเดิม ใช้ของ MaintenancePage) */}
            <div className="maint-bottom-wrap">
              <div className="maint-bottom-card">
                <div className="maint-bottom-left">
                  <div className="maint-bottom-title">
                    ต้นทุนรวมด้านการลงทุนบุคลากรในไตรมาสที่ 1
                  </div>
                  <div className="maint-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>
                  <div className="maint-bottom-sub">
                    งบคงเหลือ : <b>{fmt(Math.max(0, remaining))}</b>
                  </div>

                  {isOver && (
                    <div className="maint-bottom-alert">
                      งบการลงทุนบุคลากรเกินไป <b>{fmt(over)}</b> บาท
                    </div>
                  )}
                </div>

                <div className="maint-bottom-right">
                  <button
                    className={`maint-bottom-confirm ${isOver ? "is-disabled" : ""}`}
                    onClick={handleSave}
                    disabled={isSaved || isOver}
                    title={isOver ? "งบเกิน กรุณาลดงบหรือเบิกงบสำรอง" : "ยืนยันการตัดสินใจ"}
                  >
                    <span className="maint-bottom-check">
                      <Check size={16} strokeWidth={3} />
                    </span>
                    ยืนยันการตัดสินใจรอบที่ 1
                  </button>

                  <div className="maint-bottom-note">กรุณาตรวจสอบการตัดสินใจทั้งหมดก่อนยืนยัน</div>

                  {isOver && (
                    <button
                      type="button"
                      className="maint-bottom-reserve"
                      onClick={() => alert(`ต้องการเบิกงบสำรองเพิ่มหรือไม่? (เกิน ${fmt(over)} บาท)`)}
                      disabled={isSaved}
                    >
                      ต้องการเบิกงบสำรองเพิ่มหรือไม่?
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* /wrapper */}
        </div>
      </div>

      <footer className="decision-footer">
        <div className="footer-text">© 2026 Hotel Business Simulation Game. All rights reserved.</div>
      </footer>
    </div>
  );
}
