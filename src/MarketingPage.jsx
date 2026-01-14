import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketingPage.css";
import "./DecisionPage.css";
import {
  Banknote,
  Bed,
  Users,
  Check,
  PieChart,
  Tag,
  Megaphone,
  Wrench,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;

const INITIAL_SOCIAL = [
  {
    id: "tiktok",
    title: "TikTok",
    subtitle: "โฆษณาวิดีโอสั้นเพิ่มการรับรู้",
    budget: 100000,
    prev: 60000,
    min: 0,
    max: 300000,
    step: 5000,
    img: "/assets/marketing/tiktok.png",
  },
  {
    id: "instagram",
    title: "Instagram",
    subtitle: "โฆษณาสำหรับผู้คนค้นหา",
    budget: 50000,
    prev: 20000,
    min: 0,
    max: 250000,
    step: 5000,
    img: "/assets/marketing/instagram.png",
  },
  {
    id: "youtube",
    title: "YouTube",
    subtitle: "วิดีโอโฆษณาในระบบยูทูป",
    budget: 60000,
    prev: 60000,
    min: 0,
    max: 300000,
    step: 5000,
    img: "/assets/marketing/youtube.png",
  },
  {
    id: "agoda",
    title: "Agoda",
    subtitle: "ทำแคมเปญใน OTA platform",
    budget: 40000,
    prev: 60000,
    min: 0,
    max: 200000,
    step: 5000,
    img: "/assets/marketing/agoda.png",
  },
  {
    id: "facebook",
    title: "Facebook",
    subtitle: "โฆษณา Facebook Ads และ engagement",
    budget: 30000,
    prev: 30000,
    min: 0,
    max: 250000,
    step: 5000,
    img: "/assets/marketing/facebook.png",
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
    max: 300000,
    step: 10000,
    img: "/assets/marketing/event1.jpg",
  },
  {
    id: "regional_fest",
    group: "งานเทศกาล",
    title: "งานประจำภูมิภาค",
    subtitle: "งานดอกไม้เปลี่ยนสี ครั้งที่ 5 จ.เชียงราย",
    budget: 100000,
    prev: 100000,
    min: 0,
    max: 200000,
    step: 10000,
    img: "/assets/marketing/event2.jpg",
  },
  {
    id: "mall_booth",
    group: "ตั้งบูธออกงาน",
    title: "สนามบินและห้างสรรพสินค้า",
    subtitle: "",
    budget: 100000,
    prev: 100000,
    min: 0,
    max: 200000,
    step: 10000,
    img: "/assets/marketing/booth1.jpg",
  },
  {
    id: "thai_travel_fair",
    group: "ตั้งบูธออกงาน",
    title: "งาน ไทยเที่ยวไทย",
    subtitle: "",
    budget: 50000,
    prev: 100000,
    min: 0,
    max: 200000,
    step: 10000,
    img: "/assets/marketing/booth2.jpg",
  },
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const fmt = (n) => n.toLocaleString();

const pctChange = (curr, prev) => {
  if (!prev) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

export default function MarketingPage() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [activeTab, setActiveTab] = useState("digital"); // digital / strategy / offline / crm / etc
  const [social, setSocial] = useState(INITIAL_SOCIAL);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const totalSpend = useMemo(() => {
    const a = social.reduce((acc, x) => acc + x.budget, 0);
    const b = events.reduce((acc, x) => acc + x.budget, 0);
    return a + b;
  }, [social, events]);

  const remaining = TOTAL_BUDGET - totalSpend;

  const handleSave = () => {
    if (window.confirm("ยืนยันการตัดสินใจรอบนี้?")) setIsSaved(true);
  };

  const adjustSocial = (id, delta) => {
    if (isSaved) return;
    setSocial((prev) =>
      prev.map((x) => (x.id === id ? { ...x, budget: clamp(x.budget + delta, x.min, x.max) } : x))
    );
  };

  const setSocialExact = (id, value) => {
    if (isSaved) return;
    setSocial((prev) =>
      prev.map((x) => (x.id === id ? { ...x, budget: clamp(value, x.min, x.max) } : x))
    );
  };

  const setEventExact = (id, value) => {
    if (isSaved) return;
    setEvents((prev) =>
      prev.map((x) => (x.id === id ? { ...x, budget: clamp(value, x.min, x.max) } : x))
    );
  };

  const socialCards = social; // ตอนนี้โชว์ทั้งหมดเหมือน Figma
  const festivalRows = events.filter((e) => e.group === "งานเทศกาล");
  const boothRows = events.filter((e) => e.group === "ตั้งบูธออกงาน");

  return (
    <div className="decision-page">
      {/* ====== TOP STATS (คุณมีสไตล์เดิมอยู่แล้ว) ====== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">งบการลงทุนด้านการตลาด</span>
            <div className="stat-icon-box"><Megaphone size={18} /></div>
          </div>
          <div className="stat-value">{fmt(totalSpend)}</div>
          <div className="stat-sub">คิดเป็น : {Math.round((totalSpend / TOTAL_BUDGET) * 100)}% ของงบทั้งหมด</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ส่วนแบ่งการตลาดไตรมาสก่อน</span>
            <div className="stat-icon-box"><TrendingUp size={18} /></div>
          </div>
          <div className="stat-value">12%</div>
          <div className="stat-sub">อันดับ : 4/10</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ค่าการตลาดรวมไตรมาสนี้</span>
            <div className="stat-icon-box"><Banknote size={18} /></div>
          </div>
          <div className="stat-value">{fmt(1_500_000)}</div>
          <div className="stat-sub">อันดับค่าการตลาด : 5/10</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">คะแนนรีวิว</span>
            <div className="stat-icon-box"><span style={{ fontWeight: 800 }}>★</span></div>
          </div>
          <div className="stat-value">4.5 <span style={{ fontSize: ".95rem", color: "#6B7280", fontWeight: 700 }}>/ 5</span></div>
          <div className="stat-sub">ความพึงพอใจโดยรวม : ดีมาก</div>
        </div>
      </div>

      {/* ====== MAIN TABS (บนสุด) ====== */}
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
        <button className="tab-btn" onClick={() => alert("กำลังพัฒนา")}>
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
        <div className="mk-wrapper" style={{ gridColumn: "1 / -1" }}>
          {/* --- Sub tabs (pill) แบบ Figma --- */}
          <div className="mk-toolbar">
            <button className="mk-add-btn" onClick={() => alert("กำลังพัฒนา")}>เพิ่มงบการลงทุนเพิ่มเติม</button>
          </div>


          {/* ===== SECTION: Social ===== */}
          <div className="mk-section-head">
            <h3>โซเชียลมีเดีย</h3>
          </div>

          <div className="mk-social-grid">
            {socialCards.map((c) => {
              const pct = pctChange(c.budget, c.prev);
              const up = pct > 0;
              const down = pct < 0;

              const range = c.max - c.min;
              const p = range === 0 ? 0 : ((c.budget - c.min) / range) * 100;

              const hitMin = c.budget <= c.min;
              const hitMax = c.budget >= c.max;

              return (
                <div key={c.id} className="mk-card">
                  <div className="mk-card-img">
                    {c.img ? <img src={c.img} alt={c.title} /> : <div className="mk-img-ph" />}
                  </div>

                  <div className="mk-card-body">
                    <div className="mk-card-title">{c.title}</div>
                    <div className="mk-card-sub">{c.subtitle}</div>

                    <div className="mk-card-slider">
                      <input
                        type="range"
                        min={c.min}
                        max={c.max}
                        step={c.step}
                        value={c.budget}
                        disabled={isSaved}
                        onChange={(e) => setSocialExact(c.id, Number(e.target.value))}
                        className="mk-range"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${p}%, #E5E7EB ${p}%, #E5E7EB 100%)`,
                        }}
                      />
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
                        <div className="mk-amount-box">{fmt(c.budget)}</div>
                      </div>

                      <button
                        className={`adjust-btn ${hitMax ? "limit" : ""}`}
                        onClick={() => adjustSocial(c.id, c.step)}
                        disabled={isSaved || hitMax}
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

          {/* ===== SECTION: Festival rows ===== */}
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

          {/* ===== SECTION: Booth rows ===== */}
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

          {/* ===== BOTTOM SUMMARY (เหมือนกล่องล่างใน Figma) ===== */}
          <div className="mk-bottom-bar">
            <div className="mk-bottom-left">
              <div className="mk-bottom-title">ต้นทุนรวมด้านการตลาดในไตรมาสที่ 1</div>
              <div className="mk-bottom-val">{fmt(totalSpend)} บาท/ไตรมาส</div>

              <div className="mk-bottom-subrow">
                <span>งบคงเหลือ : <b>{fmt(Math.max(0, remaining))}</b></span>
                <span>งบสำหรับลงทุนเหลือ : <b>{fmt(1_500_000)}</b></span>
              </div>
            </div>

            <div className="mk-bottom-right">
              <button
                className="mk-confirm"
                onClick={handleSave}
                disabled={isSaved || remaining < 0}
              >
                <span className="mk-confirm-icon"><Check size={16} strokeWidth={3} /></span>
                ยืนยันการตัดสินใจรอบที่ 1
              </button>
              <div className="mk-bottom-note">กรุณาตรวจสอบการตัดสินใจก่อนยืนยันอีกครั้ง</div>
              {remaining < 0 && <div className="mk-bottom-note danger">งบเกิน กรุณาลดงบลงก่อน</div>}
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
