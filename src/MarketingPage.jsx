import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MarketingPage.css";
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

// ✅ Key ต้องตรงกับ DecisionPage
const STORAGE_KEY = "hbs_round1_decision_budgets"; // (เก็บงบจาก CEO)
const TOTAL_BUDGET = 10_000_000;

// ✅✅✅ เพิ่ม key แยกของหน้า Marketing เพื่อจำค่าที่ปรับในหน้านี้
const MK_STORAGE_KEY = "hbs_round1_marketing_decisions";

// ✅ รูปใน React ถ้าอยู่ใน public/MarketPic -> อ้างด้วย "/MarketPic/xxx.png"
const INITIAL_SOCIAL = [
  {
    id: "tiktok",
    title: "TikTok",
    subtitle: "โฆษณาวิดีโอสั้นเพิ่มการรับรู้",
    budget: 100000,
    prev: 60000,
    min: 0,
    step: 5000,
    img: "/MarketPic/tiktok.png",
  },
  {
    id: "instagram",
    title: "Instagram",
    subtitle: "โฆษณาสำหรับผู้คนค้นหา",
    budget: 50000,
    prev: 20000,
    min: 0,
    step: 5000,
    img: "/MarketPic/ig.png",
  },
  {
    id: "youtube",
    title: "YouTube",
    subtitle: "วิดีโอโฆษณาในระบบยูทูป",
    budget: 60000,
    prev: 60000,
    min: 0,
    step: 5000,
    img: "/MarketPic/youtube.png",
  },
  {
    id: "agoda",
    title: "Agoda",
    subtitle: "ทำแคมเปญใน OTA platform",
    budget: 40000,
    prev: 60000,
    min: 0,
    step: 5000,
    img: "/MarketPic/agoda.png",
  },
  {
    id: "facebook",
    title: "Facebook",
    subtitle: "โฆษณา Facebook Ads และ engagement",
    budget: 30000,
    prev: 30000,
    min: 0,
    step: 5000,
    img: "/MarketPic/facebook.png",
  },
];

const INITIAL_EVENTS = [
  {
    id: "chiangmai_flower",
    group: "งานเทศกาล",
    title: "งานประจำจังหวัดเชียงใหม่",
    subtitle: "เทศกาลไม้ดอกไม้ประดับมหกรรม ครั้งที่ 15",
    budget: 200000,
    prev: 100000,
    min: 0,
    step: 5000,
    img: "/MarketPic/eventCH.png",
  },
  {
    id: "regional_fest",
    group: "งานเทศกาล",
    title: "งานประจำภูมิภาค",
    subtitle: "งานดอกไม้เปลี่ยนสี ครั้งที่ 5 จ.เชียงราย",
    budget: 100000,
    prev: 100000,
    min: 0,
    step: 5000,
    img: "/MarketPic/eventN.png",
  },
  {
    id: "mall_booth",
    group: "ตั้งบูธออกงาน",
    title: "สนามบินและห้างสรรพสินค้า",
    subtitle: "",
    budget: 100000,
    prev: 100000,
    min: 0,
    step: 5000,
    img: "/MarketPic/airport.png",
  },
  {
    id: "thai_travel_fair",
    group: "ตั้งบูธออกงาน",
    title: "งาน ไทยเที่ยวไทย",
    subtitle: "",
    budget: 50000,
    prev: 100000,
    min: 0,
    step: 5000,
    img: "/MarketPic/TAT.jpg",
  },
];

const fmt = (n) => n.toLocaleString();

const pctChange = (curr, prev) => {
  if (!prev) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

export default function MarketingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅✅✅ 1) ดึงงบจาก localStorage ของ DecisionPage (งบ CEO)
  const getBudgetFromStorage = (id) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.budgets?.find((b) => b.id === id)?.value ?? 0;
      }
    } catch (e) {
      console.error("Error loading budget", e);
    }
    return 0;
  };

  // ✅✅✅ 2) รับค่าจาก State ถ้าไม่มีให้ดึงจาก Storage (ID 1 = Marketing)
  const ceoMarketingBudget =
    location.state?.ceoMarketingBudget ?? getBudgetFromStorage(1);

  const ceoCash = location.state?.ceoCash ?? TOTAL_BUDGET;
  const ceoMarketSharePrev = location.state?.ceoMarketSharePrev ?? 12;
  const ceoSatisfaction = location.state?.ceoSatisfaction ?? 3.5;
  const ceoAssetHealth = location.state?.ceoAssetHealth ?? 95;

  // ✅✅✅ 3) โหลดค่า isSaved/social/events ของหน้า Marketing จาก localStorage
  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(MK_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!parsed.isSaved;
      } catch (e) {}
    }
    return false;
  });

  const [social, setSocial] = useState(() => {
    const saved = localStorage.getItem(MK_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.social)) return parsed.social;
      } catch (e) {}
    }
    return INITIAL_SOCIAL;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem(MK_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.events)) return parsed.events;
      } catch (e) {}
    }
    return INITIAL_EVENTS;
  });

  // ✅✅✅ 4) บันทึกค่า social/events/isSaved ทุกครั้งที่เปลี่ยน (ทำให้กลับมาแล้วไม่ reset)
  useEffect(() => {
    localStorage.setItem(
      MK_STORAGE_KEY,
      JSON.stringify({ social, events, isSaved })
    );
  }, [social, events, isSaved]);

  // ✅ Event: ปรับงบ
  const adjustEvent = (id, delta) => {
    if (isSaved) return;
    setEvents((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, budget: Math.max(0, x.budget + delta) } : x
      )
    );
  };

  const totalSpend = useMemo(() => {
    const a = social.reduce((acc, x) => acc + x.budget, 0);
    const b = events.reduce((acc, x) => acc + x.budget, 0);
    return a + b;
  }, [social, events]);

  const remaining = ceoMarketingBudget - totalSpend;

  const handleSave = () => {
    if (window.confirm("ยืนยันการตัดสินใจรอบนี้?")) setIsSaved(true);
  };

  // ✅ Social: ปรับงบ
  const adjustSocial = (id, delta) => {
    if (isSaved) return;
    setSocial((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, budget: Math.max(0, x.budget + delta) } : x
      )
    );
  };

  const setSocialExact = (id, value) => {
    if (isSaved) return;
    setSocial((prev) =>
      prev.map((x) => (x.id === id ? { ...x, budget: Math.max(0, value) } : x))
    );
  };

  const setEventExact = (id, value) => {
    if (isSaved) return;
    setEvents((prev) =>
      prev.map((x) => (x.id === id ? { ...x, budget: Math.max(0, value) } : x))
    );
  };

  const festivalRows = events.filter((e) => e.group === "งานเทศกาล");
  const boothRows = events.filter((e) => e.group === "ตั้งบูธออกงาน");

  return (
    <div className="decision-page">
      {/* ====== TOP STATS ====== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการลงทุนด้านการตลาด</span>
            <div className="stat-icon-box">
              <Megaphone size={18} />
            </div>
          </div>
          <div className="stat-value">{fmt(ceoMarketingBudget)}</div>
          <div className="stat-sub">
            คิดเป็น :{" "}
            {ceoCash ? Math.round((ceoMarketingBudget / ceoCash) * 100) : 0}%
            ของงบทั้งหมด
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ส่วนแบ่งการตลาดไตรมาสก่อน</span>
            <div className="stat-icon-box">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">{ceoMarketSharePrev}%</div>
          <div className="stat-sub">อันดับ : 4/10</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ค่าการตลาดรวมไตรมาสนี้</span>
            <div className="stat-icon-box">
              <Banknote size={18} />
            </div>
          </div>
          <div className="stat-value">{fmt(totalSpend)}</div>
          <div className="stat-sub">อันดับค่าการตลาด : 5/10</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">คะแนนรีวิว</span>
            <div className="stat-icon-box">
              <span style={{ fontWeight: 800 }}>★</span>
            </div>
          </div>
          <div className="stat-value">
            {ceoSatisfaction}{" "}
            <span
              style={{
                fontSize: ".95rem",
                color: "#6B7280",
                fontWeight: 700,
              }}
            >
              / 5
            </span>
          </div>
          <div className="stat-sub">ความพึงพอใจโดยรวม : ดีมาก</div>
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
        <button className="tab-btn active">
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const hrBudget = getBudgetFromStorage(2);
            const mkBudget = getBudgetFromStorage(1);
            navigate("/personnel", {
              state: {
                ...location.state,
                ceoHRBudget: hrBudget,
                ceoMarketingBudget: mkBudget,
              },
            });
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

      {/* ====== CONTENT ====== */}
      <div className="decision-content">
        <div className="mk-wrapper" style={{ gridColumn: "1 / -1" }}>
          <div className="mk-section-head">
            <h3>โซเชียลมีเดีย</h3>
          </div>

          <div className="mk-social-grid">
            {social.map((c) => {
              const pct = pctChange(c.budget, c.prev);
              const up = pct > 0;
              const down = pct < 0;
              const hitMin = c.budget <= c.min;

              return (
                <div key={c.id} className="mk-card">
                  <div className="mk-card-img">
                    {c.img ? <img src={c.img} alt={c.title} /> : <div className="mk-img-ph" />}
                  </div>

                  <div className="mk-card-body">
                    <div className="mk-card-title">{c.title}</div>
                    <div className="mk-card-sub">{c.subtitle}</div>

                    <div className="mk-card-slider">
                      <div className="mk-card-minirow">
                        <span className="mk-mini-left">งบก่อนหน้า : {fmt(c.prev)}</span>
                        <span className={`mk-mini-right ${down ? "down" : up ? "up" : ""}`}>
                          {pct === 0 ? "0.00%" : `${up ? "+" : ""}${pct.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>

                    <div className="mk-card-controls">
                      <button
                        className={`adjust-btn ${hitMin ? "limit" : ""}`}
                        onClick={() => adjustSocial(c.id, -c.step)}
                        disabled={isSaved || hitMin}
                        title="ลดงบ"
                      >
                        <Minus size={18} />
                      </button>

                      <div className="mk-amount">
                        <input
                          className="mk-amount-box"
                          type="text"
                          value={fmt(c.budget)}
                          disabled={isSaved}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, "");
                            const num = Number(raw || 0);
                            if (!Number.isNaN(num)) setSocialExact(c.id, num);
                          }}
                          style={{ width: "100%", outline: "none", cursor: "text" }}
                        />
                      </div>

                      <button
                        className="adjust-btn"
                        onClick={() => adjustSocial(c.id, c.step)}
                        disabled={isSaved}
                        title="เพิ่มงบ"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mk-section-head spaced">
            <h3>งานเทศกาล</h3>
          </div>

          <div className="mk-row-list">
            {festivalRows.map((r) => {
              const pct = pctChange(r.budget, r.prev);
              const up = pct > 0;
              const down = pct < 0;

              return (
                <div key={r.id} className="mk-row">
                  <div className="mk-row-img">
                    {r.img ? <img src={r.img} alt={r.title} /> : <div className="mk-img-ph" />}
                  </div>

                  <div className="mk-row-mid">
                    <div className="mk-row-title">{r.title}</div>
                    {r.subtitle ? <div className="mk-row-sub">{r.subtitle}</div> : null}
                  </div>

                  <div className="mk-row-right">
                    <div className="mk-row-controls">
                      <button
                        className="mk-mini-btn"
                        onClick={() => adjustEvent(r.id, -r.step)}
                        disabled={isSaved || r.budget <= r.min}
                        title={`ลด ${fmt(r.step)}`}
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        className="mk-input"
                        type="text"
                        value={fmt(r.budget)}
                        disabled={isSaved}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          const num = Number(raw || 0);
                          if (!Number.isNaN(num)) setEventExact(r.id, num);
                        }}
                      />

                      <button
                        className="mk-mini-btn"
                        onClick={() => adjustEvent(r.id, r.step)}
                        disabled={isSaved}
                        title={`เพิ่ม ${fmt(r.step)}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="mk-row-meta">
                      <span>งบก่อนหน้า : {fmt(r.prev)}</span>
                      <span className={`mk-pct ${down ? "down" : up ? "up" : ""}`}>
                        {pct === 0 ? "0.00%" : `${up ? "+" : ""}${pct.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mk-section-head spaced">
            <h3>ตั้งบูธออกงาน</h3>
          </div>

          <div className="mk-row-list">
            {boothRows.map((r) => {
              const pct = pctChange(r.budget, r.prev);
              const up = pct > 0;
              const down = pct < 0;

              return (
                <div key={r.id} className="mk-row">
                  <div className="mk-row-img">
                    {r.img ? <img src={r.img} alt={r.title} /> : <div className="mk-img-ph" />}
                  </div>

                  <div className="mk-row-mid">
                    <div className="mk-row-title">{r.title}</div>
                    {r.subtitle ? <div className="mk-row-sub">{r.subtitle}</div> : null}
                  </div>

                  <div className="mk-row-right">
                    <div className="mk-row-controls">
                      <button
                        className="mk-mini-btn"
                        onClick={() => adjustEvent(r.id, -r.step)}
                        disabled={isSaved || r.budget <= r.min}
                        title={`ลด ${fmt(r.step)}`}
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        className="mk-input"
                        type="text"
                        value={fmt(r.budget)}
                        disabled={isSaved}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          const num = Number(raw || 0);
                          if (!Number.isNaN(num)) setEventExact(r.id, num);
                        }}
                      />

                      <button
                        className="mk-mini-btn"
                        onClick={() => adjustEvent(r.id, r.step)}
                        disabled={isSaved}
                        title={`เพิ่ม ${fmt(r.step)}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="mk-row-meta">
                      <span>งบก่อนหน้า : {fmt(r.prev)}</span>
                      <span className={`mk-pct ${down ? "down" : up ? "up" : ""}`}>
                        {pct === 0 ? "0.00%" : `${up ? "+" : ""}${pct.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== BOTTOM SUMMARY ===== */}
          {(() => {
            const over = Math.max(0, totalSpend - ceoMarketingBudget);
            const isOver = over > 0;

            return (
              <div className="mk-bottom-wrap">
                <div className="mk-bottom-card">
                  <div className="mk-bottom-left">
                    <div className="mk-bottom-title">ต้นทุนรวมด้านการตลาดในไตรมาสที่ 1</div>

                    <div className="mk-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>

                    <div className="mk-bottom-sub">
                      งบคงเหลือ : <b>{fmt(Math.max(0, remaining))}</b>
                    </div>

                    {isOver && (
                      <div className="mk-bottom-alert">
                        งบการตลาดเกินไป <b>{fmt(over)}</b> บาท
                      </div>
                    )}
                  </div>

                  <div className="mk-bottom-right">
                    <button
                      className={`mk-bottom-confirm ${isOver ? "is-disabled" : ""}`}
                      onClick={handleSave}
                      disabled={isSaved || isOver}
                      title={isOver ? "งบเกิน กรุณาลดงบหรือเบิกงบสำรอง" : "ยืนยันการตัดสินใจ"}
                    >
                      <span className="mk-bottom-check">
                        <Check size={16} strokeWidth={3} />
                      </span>
                      ยืนยันการตัดสินใจรอบที่ 1
                    </button>

                    <div className="mk-bottom-note">กรุณาตรวจสอบการตัดสินใจทั้งหมดก่อนยืนยัน</div>

                    {isOver && (
                      <button
                        type="button"
                        className="mk-bottom-reserve"
                        onClick={() => alert(`ต้องการเบิกงบสำรองเพิ่มหรือไม่? (เกิน ${fmt(over)} บาท)`)}
                        disabled={isSaved}
                      >
                        ต้องการเบิกงบสำรองเพิ่มหรือไม่?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <footer className="decision-footer">
        <div className="footer-text">© 2026 Hotel Business Simulation Game. All rights reserved.</div>
      </footer>
    </div>
  );
}
