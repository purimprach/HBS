import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DecisionPage.css"; 
import "./MaintenancePage.css";

// ✅ Import ไอคอนให้ครบถ้วน
import {
  Wrench, PieChart, Tag, Megaphone, Users, Banknote,
  Check, Plus, Minus, TrendingUp, TrendingDown, Camera, Info,
  Star, Smile, LogOut
} from "lucide-react";

// เปลี่ยน Key เป็น v13 เพื่อล้างค่าเก่าและใช้ค่าเริ่มต้นใหม่ของคุณ
const STORAGE_KEY = "hbs_round1_maintenance_decisions_v13"; 
const DEFAULT_BUDGET = 1_200_000;

// ✅ ข้อมูลชุดปัจจุบันของคุณ (Correct Data)
const MAINTENANCE_ITEMS = [
  { id: "place_building", group: "ซ่อมบำรุงด้านสถานที่", title: "สถานที่ในตึก", desc: "ค่าซ่อมบำรุงอาคาร ห้องพัก ห้องสัมมนา", prev: 120000, defBudget: 50000, step: 10000, img: "/MaintenancePic/M1.jpg" },
  { id: "place_parking", group: "ซ่อมบำรุงด้านสถานที่", title: "ลานจอดรถ", desc: "ค่าซ่อมบำรุงลานจอดรถในโรงแรม", prev: 30000, defBudget: 50000, step: 10000, img: "/MaintenancePic/M2.jpg" },
  { id: "place_garden", group: "ซ่อมบำรุงด้านสถานที่", title: "สวนในโรงแรม", desc: "ค่าซ่อมบำรุงสวนในโรงแรม", prev: 100000, defBudget: 50000, step: 10000, img: "/MaintenancePic/M3.jpg" },
  { id: "general_vehicle", group: "ซ่อมบำรุงทั่วไป", title: "ยานพาหนะ", desc: "ค่าซ่อมบำรุงรถตู้รับส่งและรถกอล์ฟ", prev: 50000, defBudget: 50000, step: 10000, img: "/MaintenancePic/M4.jpg" },
  { id: "general_tools", group: "ซ่อมบำรุงทั่วไป", title: "เครื่องมือช่าง", desc: "ค่าอุปกรณ์ต่างๆที่ใช้ในโรงแรม", prev: 20000, defBudget: 50000, step: 10000, img: "/MaintenancePic/M5.jpg" },
];

const fmt = (n) => (Number(n) || 0).toLocaleString();
const pct = (curr, prev) => {
  const c = Number(curr) || 0;
  const p = Number(prev) || 0;
  if (!p) return c === 0 ? 0 : 100;
  return ((c - p) / p) * 100;
};

export default function MaintenancePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getBudgetFromStorage = (id) => {
    try {
      const saved = localStorage.getItem("hbs_round1_decision_budgets");
      if (saved) return JSON.parse(saved).budgets?.find((b) => b.id === id)?.value || 0;
    } catch (e) { console.error(e); }
    return 0;
  };

  const maintenanceBudget = location.state?.ceoMaintenanceBudget ?? getBudgetFromStorage(3) ?? DEFAULT_BUDGET;
  
  const commonState = {
    ceoCash: location.state?.ceoCash ?? 10_000_000,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 4.5, // ค่าตามรูปตัวอย่าง
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
  };

  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaults = {};
    MAINTENANCE_ITEMS.forEach(it => { defaults[it.id] = it.defBudget; });
    return { budgets: defaults, isSaved: false };
  });

  const getVal = (id) => userData.budgets[id] ?? 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  const updateItem = (itemId, nextValue) => {
    if (userData.isSaved) return;
    const safe = Math.max(0, Number(nextValue) || 0);
    setUserData(prev => ({ ...prev, budgets: { ...prev.budgets, [itemId]: safe } }));
  };

  const adjustItem = (itemId, delta) => {
    if (userData.isSaved) return;
    setUserData(prev => {
      const current = prev.budgets[itemId] || 0;
      return { ...prev, budgets: { ...prev.budgets, [itemId]: Math.max(0, current + delta) } };
    });
  };

  const totalSpend = useMemo(() => {
    let sum = 0;
    Object.values(userData.budgets).forEach(v => sum += v);
    return sum;
  }, [userData]);

  const remaining = maintenanceBudget - totalSpend;
  const over = Math.max(0, totalSpend - maintenanceBudget);
  const isOver = over > 0;

  const handleSave = () => {
    if (userData.isSaved) return;
    if (window.confirm("ยืนยันการตัดสินใจบำรุงรักษารอบที่ 1 ?")) {
      setUserData(prev => ({ ...prev, isSaved: true }));
    }
  };

  const groups = useMemo(() => {
    const g = {};
    MAINTENANCE_ITEMS.forEach(it => {
      if (!g[it.group]) g[it.group] = [];
      g[it.group].push(it);
    });
    return g;
  }, []);

  return (
    <div className="decision-page maint-page-wrapper">
      
      {/* ✅ STATS GRID (แบบการ์ดขอบเขียว) */}
      <div className="stats-grid">
        <div className="stat-card green-border">
          <div className="stat-header">
            <span className="stat-title green-text">งบการจัดสรรค่าบำรุงรักษา</span>
            <div className="stat-icon-box light-green-bg"><Banknote size={18} className="icon-green"/></div>
          </div>
          <div className="stat-value right-align">{fmt(maintenanceBudget)}</div>
          <div className="stat-sub">งบไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>

        <div className="stat-card green-border">
          <div className="stat-header">
            <span className="stat-title green-text">ความพึงพอใจต่องานสถานที่</span>
            <div className="stat-icon-box light-green-bg"><Star size={18} className="icon-green"/></div>
          </div>
          <div className="stat-value right-align">
            {commonState.ceoSatisfaction} <span style={{fontSize: "0.6em", color: "#6B7280"}}>/5</span>
          </div>
          <div className="stat-sub">ความพึงพอใจโดยรวม : ดีมาก</div>
        </div>

        <div className="stat-card green-border">
          <div className="stat-header">
            <span className="stat-title green-text">อัตราการเข้าพักไตรมาสที่แล้ว</span>
            <div className="stat-icon-box light-green-bg"><Smile size={18} className="icon-green"/></div>
          </div>
          <div className="stat-value right-align">80%</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card green-border">
          <div className="stat-header">
            <span className="stat-title green-text">มูลค่าทรัพย์สินปัจจุบัน</span>
            <div className="stat-icon-box light-green-bg"><LogOut size={18} className="icon-green"/></div>
          </div>
          <div className="stat-value right-align">{fmt(400_000_000)}</div>
          <div className="stat-sub">มูลค่าไตรมาสก่อน : {fmt(1_800_000)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="decision-tabs">
        <button className="tab-btn" onClick={() => navigate("/decision")}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>
        <button className="tab-btn" onClick={() => navigate("/pricing")}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        <button className="tab-btn" onClick={() => {
            const mkt = getBudgetFromStorage(1);
            const hr = getBudgetFromStorage(2);
            navigate("/marketing", { state: { ...commonState, ceoMarketingBudget: mkt, ceoHRBudget: hr } });
        }}>
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>
        <button className="tab-btn" onClick={() => {
            const mkt = getBudgetFromStorage(1);
            const hr = getBudgetFromStorage(2);
            navigate("/personnel", { state: { ...commonState, ceoMarketingBudget: mkt, ceoHRBudget: hr } });
        }}>
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>
        <button className="tab-btn active">
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        <button className="tab-btn" onClick={() => alert("กำลังพัฒนา")}>
          <Camera size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* CONTENT */}
      <div className="decision-content">
        <div style={{ gridColumn: "1 / -1" }}>
          
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="maint-group-section">
              <h3 className="maint-group-header">{groupName}</h3>
              
              {items.map((it) => {
                const budget = getVal(it.id);
                const p = pct(budget, it.prev);
                const down = p < 0;
                const up = p > 0;

                return (
                  <div key={it.id} className="maint-card-row">
                    {/* Left: Title */}
                    <div className="maint-col-left">
                      <div className="maint-title">{it.title}</div>
                      <div className="maint-desc-wrapper">
                        <Info size={14} className="maint-info-icon"/>
                        <span className="maint-desc">{it.desc}</span>
                      </div>
                    </div>

                    {/* Center: Controls (Separated & Green Theme) */}
                    <div className="maint-col-center">
                      <div className="maint-control-row">
                        <div className="maint-separated-control">
                            <button 
                                className="maint-btn-circle" 
                                onClick={() => adjustItem(it.id, -it.step)} 
                                disabled={userData.isSaved || budget <= 0}
                            >
                                <Minus size={16}/>
                            </button>
                            
                            <div className="maint-input-box-separated">
                                <input 
                                    type="text" 
                                    className="maint-input-field-sep"
                                    value={fmt(budget)}
                                    disabled={userData.isSaved}
                                    onChange={(e) => updateItem(it.id, e.target.value.replace(/[^\d]/g, ""))}
                                />
                            </div>

                            <button 
                                className="maint-btn-circle" 
                                onClick={() => adjustItem(it.id, it.step)} 
                                disabled={userData.isSaved}
                            >
                                <Plus size={16}/>
                            </button>
                        </div>

                        <div className={`maint-pct ${down ? 'down' : up ? 'up' : ''}`}>
                           {down ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                           {p.toFixed(2)}%
                        </div>
                      </div>
                      <div className="maint-prev-val">รอบที่แล้ว {fmt(it.prev)}</div>
                    </div>

                    {/* Right: Image */}
                    <div className="maint-col-right">
                      <img src={it.img} alt={it.title} onError={(e) => e.target.src = "https://placehold.co/300x150?text=No+Image"} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* BOTTOM SUMMARY */}
          <div className="maint-bottom-wrap">
            <div className="maint-bottom-card">
              <div className="maint-bottom-left">
                <div className="maint-bottom-title">ต้นทุนรวมด้านการซ่อมบำรุงในไตรมาสที่ 1</div>
                <div className="maint-bottom-value">{fmt(totalSpend)} บาท/ไตรมาส</div>
                <div className="maint-bottom-sub">
                  งบคงเหลือ : <b>{fmt(Math.max(0, remaining))}</b>
                </div>
                {isOver && <div className="maint-bottom-alert">งบเกิน <b>{fmt(over)}</b> บาท</div>}
              </div>

              <div className="maint-bottom-right">
                <button
                  className={`maint-bottom-confirm ${isOver ? "is-disabled" : ""}`}
                  onClick={handleSave}
                  disabled={userData.isSaved || isOver}
                >
                  <span className="maint-bottom-check"><Check size={16} strokeWidth={3} /></span>
                  ยืนยันการตัดสินใจรอบที่ 1
                </button>
                <div className="maint-bottom-note">กรุณาตรวจสอบการตัดสินใจทั้งหมดก่อนยืนยัน</div>
                {isOver && (
                  <button className="maint-bottom-reserve" onClick={() => alert("เบิกงบสำรอง")}>
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