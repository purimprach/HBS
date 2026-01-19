import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PersonnelPage.css";
import "./DecisionPage.css";

import {
  Banknote,
  Users,
  Check,
  PieChart,
  Tag,
  Megaphone,
  Wrench,
  TrendingUp,
  Plus,
  Minus,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;

// ✅✅✅ เพิ่ม key สำหรับเก็บค่าหน้านี้
const HR_STORAGE_KEY = "hbs_round1_personnel_decisions";

const INITIAL_STAFF_GROUPS = [
  {
    id: "housekeeping",
    label: "แม่บ้าน",
    countLabel: "19 คน",
    bannerImg: "/PersonalPic/Maid.png", // ปรับ path ให้ตรง public ของคุณ
    items: [
      {
        id: "hk_training",
        title: "พัฒนาและอบรม",
        subtitle: "อบรมมาตรฐานงานแม่บ้าน เพิ่มคุณภาพการบริการ",
        budget: 50000,
        prev: 45000,
        min: 0,
        step: 5000,
      },
      {
        id: "hk_bonus",
        title: "โบนัสประจำไตรมาส",
        subtitle: "เพิ่มแรงจูงใจและลดอัตราการลาออก",
        budget: 25000,
        prev: 30000,
        min: 0,
        step: 5000,
      },
      {
        id: "hk_welfare",
        title: "สวัสดิการประจำไตรมาส",
        subtitle: "เช่น อาหาร/ค่าเดินทาง/สุขภาพ",
        budget: 20000,
        prev: 25000,
        min: 0,
        step: 5000,
      },
    ],
  },
  {
    id: "staff",
    label: "พนักงาน",
    countLabel: "40 คน",
    bannerImg: "/PersonalPic/Employee.png", // ปรับ path ให้ตรง public ของคุณ
    items: [
      {
        id: "st_training",
        title: "พัฒนาและอบรม",
        subtitle: "อบรมงานบริการ/การขาย/การแก้ปัญหา",
        budget: 80000,
        prev: 70000,
        min: 0,
        step: 5000,
      },
      {
        id: "st_bonus",
        title: "โบนัสประจำไตรมาส",
        subtitle: "เพิ่มแรงจูงใจทีมหน้าบ้าน",
        budget: 60000,
        prev: 65000,
        min: 0,
        step: 5000,
      },
      {
        id: "st_welfare",
        title: "สวัสดิการประจำไตรมาส",
        subtitle: "เช่น ยูนิฟอร์ม/อาหาร/ประกัน",
        budget: 50000,
        prev: 45000,
        min: 0,
        step: 5000,
      },
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

  // ✅ รับค่าคงที่จาก CEO (ส่งมาจาก Decision)
  const ceoHRBudget = location.state?.ceoHRBudget ?? 0;
  const ceoCash = location.state?.ceoCash ?? TOTAL_BUDGET;
  const ceoMarketSharePrev = location.state?.ceoMarketSharePrev ?? 12;
  const ceoSatisfaction = location.state?.ceoSatisfaction ?? 3.5;
  const ceoAssetHealth = location.state?.ceoAssetHealth ?? 95;

  // ✅✅✅ โหลด isSaved จาก localStorage
  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(HR_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!parsed.isSaved;
      } catch (e) {}
    }
    return false;
  });

  // ✅✅✅ โหลด groups จาก localStorage (ถ้ามี)
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

  // ✅✅✅ บันทึกทุกครั้งที่ groups/isSaved เปลี่ยน → กลับมาแล้วไม่ reset
  useEffect(() => {
    localStorage.setItem(
      HR_STORAGE_KEY,
      JSON.stringify({ groups, isSaved })
    );
  }, [groups, isSaved]);

  const updateItemBudget = (groupId, itemId, nextValue) => {
    if (isSaved) return;
    const safe = Math.max(0, Number(nextValue) || 0);

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) =>
            it.id === itemId ? { ...it, budget: safe } : it
          ),
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
            it.id === itemId
              ? { ...it, budget: Math.max(0, (it.budget || 0) + delta) }
              : it
          ),
        };
      })
    );
  };

  const totalSpend = useMemo(() => {
    return groups.reduce((acc, g) => {
      const s = g.items.reduce((a, it) => a + (it.budget || 0), 0);
      return acc + s;
    }, 0);
  }, [groups]);

  const remaining = ceoHRBudget - totalSpend;
  const over = Math.max(0, totalSpend - ceoHRBudget);
  const isOver = over > 0;

  const handleSave = () => {
    if (isSaved) return;
    if (window.confirm("ยืนยันการตัดสินใจรอบนี้?")) setIsSaved(true);
  };

  return (
    <div className="decision-page">
      {/* ====== TOP STATS (คงที่จาก CEO) ====== */}
        <div className="stats-grid">
        {/* 1) งบการพัฒนาบุคคล */}
        <div className="stat-card">
            <div className="stat-header">
            <span className="stat-title">งบการพัฒนาบุคคล</span>
            <div className="stat-icon-box"><Banknote size={18} /></div>
            </div>
            <div className="stat-value">{fmt(ceoHRBudget)}</div>
            <div className="stat-sub">งบไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>

        {/* 2) จำนวนพนักงาน */}
        <div className="stat-card">
            <div className="stat-header">
            <span className="stat-title">จำนวนพนักงาน</span>
            <div className="stat-icon-box"><Users size={18} /></div>
            </div>
            <div className="stat-value">59 คน</div>
            <div className="stat-sub">ประสิทธิภาพ : 85%</div>
        </div>

        {/* 3) ความพึงพอใจพนักงาน */}
        <div className="stat-card">
            <div className="stat-header">
            <span className="stat-title">ความพึงพอใจพนักงาน</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 900 }}>☺</span></div>
            </div>
            <div className="stat-value">78%</div>
            <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        {/* 4) จำนวนคนลาออก */}
        <div className="stat-card">
            <div className="stat-header">
            <span className="stat-title">จำนวนคนลาออก</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 900 }}>↪</span></div>
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
        <button className="tab-btn" onClick={() => navigate("/pricing")}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        <button
          className="tab-btn"
          onClick={() => navigate("/marketing", { state: location.state })}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        {/* ✅ แท็บนี้เป็น active */}
        <button className="tab-btn active">
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>

        <button className="tab-btn" onClick={() => alert("กำลังพัฒนา")}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        <button className="tab-btn" onClick={() => alert("กำลังพัฒนา")}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="decision-content">
        <div className="hr-wrapper" style={{ gridColumn: "1 / -1" }}>
          {groups.map((g) => (
            <div key={g.id} className="hr-group">
              <div className="hr-group-head">
                <h3 className="hr-group-title">{g.label}</h3>
                <span className="hr-pill">{g.countLabel}</span>
              </div>

              <div className="hr-banner">
                <img src={g.bannerImg} alt={g.label} />
              </div>

              <div className="hr-items">
                {g.items.map((it) => {
                  const pct = pctChange(it.budget, it.prev);
                  const up = pct > 0;
                  const down = pct < 0;
                  const hitMin = (it.budget || 0) <= (it.min || 0);

                  return (
                    <div key={it.id} className="hr-item">
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
                            title={`ลด ${fmt(it.step)}`}
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
                            title={`เพิ่ม ${fmt(it.step)}`}
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

          {/* ===== BOTTOM SUMMARY (แบบ figma) ===== */}
          <div className="hr-bottom-wrap">
            <div className="hr-bottom-card">
              <div className="hr-bottom-left">
                <div className="hr-bottom-title">
                  ต้นทุนรวมด้านการลงทุนบุคลากรในไตรมาสที่ 1
                </div>
                <div className="hr-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>
                <div className="hr-bottom-sub">
                  งบคงเหลือ : <b>{fmt(Math.max(0, remaining))}</b>
                </div>

                {isOver && (
                  <div className="hr-bottom-alert">
                    งบการลงทุนบุคลากรเกินไป <b>{fmt(over)}</b> บาท
                  </div>
                )}
              </div>

              <div className="hr-bottom-right">
                <button
                  className={`hr-confirm ${isOver ? "is-disabled" : ""}`}
                  onClick={handleSave}
                  disabled={isSaved || isOver}
                  title={isOver ? "งบเกิน กรุณาลดงบหรือเบิกงบสำรอง" : "ยืนยันการตัดสินใจ"}
                >
                  <span className="hr-check">
                    <Check size={16} strokeWidth={3} />
                  </span>
                  ยืนยันการตัดสินใจรอบที่ 1
                </button>

                <div className="hr-note">กรุณาตรวจสอบการตัดสินใจทั้งหมดก่อนยืนยัน</div>

                {isOver && (
                  <button
                    type="button"
                    className="hr-reserve"
                    onClick={() =>
                      alert(`ต้องการเบิกงบสำรองเพิ่มหรือไม่? (เกิน ${fmt(over)} บาท)`)
                    }
                    disabled={isSaved}
                  >
                    ต้องการเบิกงบสำรองเพิ่มหรือไม่?
                  </button>
                )}
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
