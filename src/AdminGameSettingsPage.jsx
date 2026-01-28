import React, { useMemo, useState, useEffect } from "react";
import "./AdminGameSettingsPage.css";
import { 
  User, Users, UsersRound, CalendarDays, Save, 
  LayoutDashboard, CircleDollarSign, PieChart, ClipboardList, 
  Users2, AlertTriangle, TrendingUp, CheckCircle2, Play,
  Copy, Share2, Pencil // ✅ เพิ่ม Pencil เข้ามา
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- รายการเหตุการณ์ ---
const EVENT_OPTIONS = [
  { value: "none", label: "ไม่มีเหตุการณ์" },
  { label: "--- ปัจจัยลบ (Negative) ---", options: [
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
  ]},
  { label: "--- ปัจจัยบวก (Positive) ---", options: [
    { value: "min_wage", label: "การปรับขึ้นค่าแรงขั้นต่ำ" },
    { value: "free_visa", label: "นโยบายฟรีวีซ่า" },
    { value: "gov_subsidy", label: "รัฐอัดฉีดเงินอุดหนุนการท่องเที่ยว" },
    { value: "mega_event", label: "การจัดคอนเสิร์ต/อีเวนต์ยักษ์" },
    { value: "new_attraction", label: "มีสถานที่ท่องเที่ยวเปิดใหม่ใกล้โรงแรม" },
    { value: "asian_games", label: "ประเทศไทยเป็นเจ้าภาพจัดงานเอเชียนเกมส์" },
    { value: "airline_expansion", label: "สายการบินเพิ่มเที่ยวบิน" },
    { value: "tax_deduction", label: "นโยบายลดหย่อนภาษีท่องเที่ยว" },
    { value: "weak_currency", label: "ค่าเงินบาทอ่อนตัว" },
  ]}
];

export default function AdminGameSettingsPage() {
  const navigate = useNavigate();

  // ===================== Step 1 States =====================
  const [gameName, setGameName] = useState("MBA Class 1 - Hard Mode");
  const [hotelSize, setHotelSize] = useState("medium");
  const [location, setLocation] = useState("chiangmai");
  const [scenario, setScenario] = useState("balanced");

  const [mode, setMode] = useState("team");
  const [teamSize, setTeamSize] = useState(4);
  const [minTeams, setMinTeams] = useState(1);
  const [maxTeams, setMaxTeams] = useState(4);

  const [totalQuarters, setTotalQuarters] = useState(12);
  const [minutesPerRound, setMinutesPerRound] = useState(15);

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
  const [activeYear, setActiveYear] = useState(1);
  const [econFormula, setEconFormula] = useState("gdp_event");
  const [gdpStart, setGdpStart] = useState(4);
  const [inflation, setInflation] = useState(8);
  const [mrr, setMrr] = useState(5);
  const [industryFactor, setIndustryFactor] = useState(1.0);

  const [qSettings, setQSettings] = useState([
    { quarter: 1, minutes: 15, demand: 1, event: "pm25" },
    { quarter: 2, minutes: 15, demand: 1, event: "pm25" },
    { quarter: 3, minutes: 15, demand: 1, event: "disaster" },
    { quarter: 4, minutes: 15, demand: 1, event: "pm25" },
  ]);

  const updateQuarter = (idx, patch) => {
    setQSettings((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  // ✅ New State: สถานะการบันทึก Step 2
  const [isStep2Saved, setIsStep2Saved] = useState(false);

  // ✅ Logic ปุ่มบันทึก/แก้ไข
  const handleSaveStep2 = () => {
    if (isStep2Saved) {
      // ถ้าบันทึกอยู่ -> กดเพื่อ "แก้ไข" (ปลดล็อก)
      setIsStep2Saved(false);
    } else {
      // ถ้ายังไม่บันทึก -> กดเพื่อ "บันทึก" (ล็อก)
      setIsStep2Saved(true);
      // alert("บันทึกการตั้งค่าเรียบร้อย ✅"); // เอาออกหรือใส่ไว้ก็ได้
    }
  };

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

  const currentYearQuarters = useMemo(() => {
    const passedQuarters = (activeYear - 1) * 4;
    const remaining = totalQuarters - passedQuarters;
    return Math.min(4, Math.max(0, remaining));
  }, [activeYear, totalQuarters]);

  // ===================== Step 3 States =====================
  const [scoring, setScoring] = useState({
    overall: 20,
    financial: 20,
    market: 15,
    operations: 15,
    people: 10,
    risk: 10,
    growth: 10
  });

  const totalWeight = useMemo(() => {
    return Object.values(scoring).reduce((a, b) => a + b, 0);
  }, [scoring]);

  const adjustScore = (key, delta) => {
    setScoring(prev => {
      const newVal = prev[key] + delta;
      if (newVal < 0) return prev;
      return { ...prev, [key]: newVal };
    });
  };

  const scoringConfig = [
    { key: "overall", title: "ประสิทธิภาพโดยรวม", desc: "กำไรสุทธิ, RevPAR, ผลตอบแทนจากส่วนของผู้ถือหุ้น", icon: LayoutDashboard },
    { key: "financial", title: "ประสิทธิภาพทางการเงิน", desc: "กำไรสุทธิ, RevPAR, ผลตอบแทนจากส่วนของผู้ถือหุ้น", icon: CircleDollarSign },
    { key: "market", title: "ตลาด & แบรนด์", desc: "ส่วนแบ่งตลาด, คะแนนชื่อเสียงแบรนด์", icon: PieChart },
    { key: "operations", title: "การดำเนินงาน & บริการ", desc: "คะแนนความพึงพอใจของแขก, อัตราการเข้าพัก", icon: ClipboardList },
    { key: "people", title: "พนักงาน & องค์กร", desc: "ความพึงพอใจของพนักงาน, อัตราการลาออก, งบอบรม", icon: Users2 },
    { key: "risk", title: "ความเสี่ยง & วินัยทางการเงิน", desc: "กระแสเงินสด / สภาพคล่อง, D/E Ratio", icon: AlertTriangle },
    { key: "growth", title: "การเติบโต & มูลค่าระยะยาว", desc: "มูลค่าเศรษฐกิจที่เพิ่มขึ้น, การเติบโตของมูลค่าสินทรัพย์", icon: TrendingUp },
  ];

  // ===================== Step 4 States (Game Created) =====================
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [gameCode, setGameCode] = useState("");

  const handleCreateGame = () => {
    if (totalWeight !== 100) {
      alert(`น้ำหนักรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalWeight}%)`);
      return;
    }
    
    // ต้องบันทึก Step 2 ก่อนสร้างเกม
    if (!isStep2Saved) {
        alert("กรุณากด 'บันทึกการตั้งค่า' ในขั้นตอนที่ 2 ก่อนครับ");
        return;
    }

    setGameCode("AX603");
    setIsGameCreated(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    alert("คัดลอกรหัสเกมแล้ว: " + gameCode);
  };

  const handleEditGame = () => {
    setIsGameCreated(false);
  };

  const handleGoToLobby = () => {
    alert("ไปที่หน้า Lobby...");
  };

  // ✅ Helper Variable: เช็คว่าจะ Disable Input หรือไม่
  // ล็อกเมื่อ: เกมถูกสร้างแล้ว (Step 4) หรือ Step 2 ถูกบันทึกแล้ว (isStep2Saved)
  const isInputsLocked = isGameCreated || isStep2Saved;

  // ===================== RENDER =====================
  return (
    <div className="ags-page">
      {/* ===================== STEP 1 ===================== */}
      <div className="ags-stepTitleRow">
        <div className="ags-stepBar" />
        <div className="ags-titleText">
          ขั้นตอนที่ 1: ข้อมูลพื้นฐาน &amp; โครงสร้างเกม
        </div>
      </div>

      <section className="ags-card">
        <div className="asg-gridTop">
          <div className="ags-field asg-span2">
            <label>ชื่อเกม</label>
            <input value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="ตัวอย่าง: MBA Class 1" disabled={isInputsLocked} />
          </div>
          <div className="ags-field">
            <label>ขนาดโรงแรม</label>
            <select value={hotelSize} onChange={(e) => setHotelSize(e.target.value)} disabled={isInputsLocked}>
              <option value="small">ขนาดเล็ก</option><option value="medium">ขนาดกลาง</option><option value="large">ขนาดใหญ่</option>
            </select>
          </div>
          <div className="ags-field">
            <label>สถานที่ตั้ง</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} disabled={isInputsLocked}>
              <option value="bangkok">กรุงเทพฯ</option><option value="chiangmai">เชียงใหม่</option><option value="phuket">ภูเก็ต</option><option value="khonkaen">ขอนแก่น</option>
            </select>
          </div>
          <div className="ags-field">
            <label>สถานการณ์</label>
            <select value={scenario} onChange={(e) => setScenario(e.target.value)} disabled={isInputsLocked}>
              <option value="balanced">ธุรกิจที่มั่นคง</option><option value="growth">ธุรกิจที่กำลังประสบปัญหา</option><option value="crisis">ธุรกิจที่สภาพคล่องสูง</option>
            </select>
          </div>
        </div>

        <div className="asg-midRow">
          <div className="asg-leftBlock">
            <div className="asg-subtitle">การตั้งค่าโหมด</div>
            <div className="asg-modeRow">
              <button type="button" className={`asg-modeCard ${mode === "single" ? "active" : ""}`} onClick={() => setMode("single")} disabled={isInputsLocked}>
                <User size={20} /><div>เล่นแบบเดี่ยว</div>
              </button>
              <button type="button" className={`asg-modeCard ${mode === "team" ? "active" : ""}`} onClick={() => setMode("team")} disabled={isInputsLocked}>
                <Users size={20} /><div>เล่นแบบทีม</div>
              </button>
              <button type="button" className={`asg-modeCard ${mode === "other" ? "active" : ""}`} onClick={() => setMode("other")} disabled={isInputsLocked}>
                <UsersRound size={20} /><div>เล่นทั้ง 2 แบบ</div>
              </button>
            </div>

            <div className={`asg-modeExtras ${mode === "single" ? "is-hidden" : ""}`}>
              <div />
              <div className="asg-under-col2">
                <div className={`asg-teamSize ${mode === "team" ? "" : "is-hidden"}`}>
                  <label>สมาชิก (2-4)</label>
                  <select value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} disabled={mode !== "team" || isInputsLocked}>
                    {teamSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="asg-under-col3">
                <div className={`asg-otherRange ${mode === "other" ? "" : "is-hidden"}`}>
                  <div className="asg-miniSelect">
                    <label>ขั้นต่ำ</label>
                    <select value={minTeams} onChange={(e) => handleMinChange(Number(e.target.value))} disabled={mode !== "other" || isInputsLocked}>
                      {otherMinOptions.filter((n) => n < maxTeams).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="asg-miniSelect">
                    <label>สูงสุด</label>
                    <select value={maxTeams} onChange={(e) => handleMaxChange(Number(e.target.value))} disabled={mode !== "other" || isInputsLocked}>
                      {otherMaxOptions.filter((n) => n > minTeams).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="asg-rightBlock">
            <div className="asg-miniField">
              <label>จำนวนไตรมาสทั้งหมด</label>
              <input type="number" min={1} max={40} value={totalQuarters} onChange={(e) => {
                let val = Number(e.target.value); if (val > 40) val = 40; setTotalQuarters(val);
              }} disabled={isInputsLocked} />
            </div>
            <div className="asg-miniField">
              <label>นาทีต่อรอบ</label>
              <input 
                type="number" 
                min={1} 
                max={60} 
                value={minutesPerRound} 
                onChange={(e) => {
                  let val = Number(e.target.value); 
                  if (val > 60) val = 60; 
                  setMinutesPerRound(val);
                  setQSettings((prev) => prev.map((q) => ({ ...q, minutes: val })));
                }} 
                disabled={isInputsLocked} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STEP 2 ===================== */}
      <div className="ags-stepTitleRow ags-stepTitleRow--spacer">
        <div className="ags-stepBar" />
        <div className="ags-titleText">
          ขั้นตอนที่ 2: การตั้งค่าเศรษฐกิจ &amp; สิ่งแวดล้อม
        </div>
      </div>

      <div className="step2-container">
        <div className="step2-tabs-wrapper">
          {years.map((y) => (
            <button key={y} type="button" className={`step2-tab ${activeYear === y ? "active" : ""}`} onClick={() => setActiveYear(y)}>
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
                <select value={econFormula} onChange={(e) => setEconFormula(e.target.value)} className="input-full" disabled={isInputsLocked}>
                  <option value="gdp_event">อัตราการเติบโตของเศรษฐกิจ = 100 + 2*GDP + เหตุการณ์</option>
                  <option value="simple">อัตราการเติบโตของเศรษฐกิจ = 100 + GDP</option>
                </select>
              </div>
           </div>
           <div className="ags-row-4col">
              <div className="ags-field">
                 <label>GDP (ค่าเริ่มต้น)</label>
                 <select value={gdpStart} onChange={(e) => setGdpStart(Number(e.target.value))} disabled={isInputsLocked}>
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
              </div>
              <div className="ags-field">
                 <label>อัตราเงินเฟ้อ</label>
                 <select value={inflation} onChange={(e) => setInflation(Number(e.target.value))} disabled={isInputsLocked}>
                    {[-2, 0, 2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n}%</option>)}
                 </select>
              </div>
              <div className="ags-field">
                 <label>MRR</label>
                 <select value={mrr} onChange={(e) => setMrr(Number(e.target.value))} disabled={isInputsLocked}>
                    {[4, 4.5, 5.0, 5.5, 6, 6.5, 7, 7.5, 8].map(n => <option key={n} value={n}>{n}%</option>)}
                 </select>
              </div>
              <div className="ags-field">
                 <label>ปัจจัยอุตสาหกรรม</label>
                 <select value={industryFactor} onChange={(e) => setIndustryFactor(Number(e.target.value))} disabled={isInputsLocked}>
                    {[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
              </div>
           </div>

           <div className="step2-sub-title">การตั้งค่าไตรมาส</div>
           <div className="step2-q-grid">
              {qSettings.slice(0, currentYearQuarters).map((q, idx) => (
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
                                disabled={isInputsLocked}
                                onChange={(e) => { 
                                    let val = Number(e.target.value); 
                                    if(val>60) val=60; 
                                    updateQuarter(idx, {minutes: val}) 
                                }} 
                              />
                          </div>
                          <div className="ags-field">
                              <label>ตามฤดูกาล</label>
                              <select value={q.demand} onChange={(e) => updateQuarter(idx, {demand: Number(e.target.value)})} disabled={isInputsLocked}>
                                  <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                              </select>
                          </div>
                      </div>
                      <div className="ags-field">
                          <label>เหตุการณ์</label>
                          <select value={q.event} onChange={(e) => updateQuarter(idx, {event: e.target.value})} disabled={isInputsLocked}>
                              {EVENT_OPTIONS.map((opt, i) => (
                                  opt.options ? <optgroup key={i} label={opt.label}>{opt.options.map(sub => <option key={sub.value} value={sub.value}>{sub.label}</option>)}</optgroup> 
                                  : <option key={i} value={opt.value}>{opt.label}</option>
                              ))}
                          </select>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           {/* ✅ ปุ่มบันทึก/แก้ไข ใน Step 2 */}
           <div className="step2-footer">
              <button 
                className={`btn-save ${isStep2Saved ? "btn-edit-mode" : ""}`} 
                onClick={handleSaveStep2} 
                disabled={isGameCreated} // ถ้าสร้างเกมแล้ว ปุ่มนี้จะกดไม่ได้เลย (เพราะจบ process แล้ว)
              >
                 {isStep2Saved ? (
                    <>แก้ไขการตั้งค่า <Pencil size={18} style={{marginLeft: 8}}/></>
                 ) : (
                    <>บันทึกการตั้งค่า <Save size={18} style={{marginLeft: 8}}/></>
                 )}
              </button>
           </div>
        </section>
      </div>

      {/* ===================== STEP 3 ===================== */}
      <div className="ags-stepTitleRow ags-stepTitleRow--spacer">
        <div className="ags-stepBar" />
        <div className="ags-titleText">
          ขั้นตอนที่ 3: กฎ &amp; การให้คะแนน
        </div>
      </div>

      <section className="ags-card">
        <div className="step2-header">
           <h3>เกณฑ์การให้คะแนน</h3>
           <p>น้ำหนักการให้คะแนน - ปรับสไลเดอร์หรือตั้งค่าต่างๆ เพื่อกำหนดความสำคัญของแต่ละหมวดหมู่ โดยรวมต้องเท่ากับ 100%</p>
        </div>
        <div className={`step3-total-bar ${totalWeight === 100 ? "is-valid" : "is-invalid"}`}>
           <div className="bar-label">
              <CheckCircle2 size={20} />
              <div className="bar-text"><strong>น้ำหนักรวม</strong><span>ต้องเท่ากับ 100%</span></div>
           </div>
           <div className="bar-value">{totalWeight}%</div>
           <div className="bar-fill" style={{ width: `${Math.min(100, totalWeight)}%` }} />
        </div>
        <div className="step3-grid">
           {scoringConfig.map((item) => (
              <div className="step3-card" key={item.key}>
                 <div className="step3-card-icon"><item.icon size={24} /></div>
                 <div className="step3-card-content">
                    <div className="card-title">{item.title}</div>
                    <div className="card-desc">{item.desc}</div>
                 </div>
                 <div className="step3-card-actions">
                    <button type="button" className="btn-adj" onClick={() => adjustScore(item.key, -5)} disabled={isGameCreated}>-</button>
                    <div className="score-val">{scoring[item.key]}</div>
                    <button type="button" className="btn-adj" onClick={() => adjustScore(item.key, 5)} disabled={isGameCreated}>+</button>
                    <span className="unit">%</span>
                 </div>
              </div>
           ))}
        </div>
      </section>

      {/* ปุ่มสร้างเกม */}
      <div className="step3-footer-centered">
         <button 
            type="button" 
            className={`btn-create ${isGameCreated ? "btn-disabled-look" : ""}`}
            onClick={handleCreateGame}
            disabled={totalWeight !== 100 || isGameCreated}
         >
            {isGameCreated ? "สร้างรหัสเกมแล้ว" : "สร้างรหัสเกม"}
            {!isGameCreated && <Play size={20} fill="currentColor" style={{marginLeft: 8}} />}
         </button>
      </div>

      {/* ===================== STEP 4 ===================== */}
      {isGameCreated && (
        <div className="fade-in-up">
            <div className="ags-stepTitleRow ags-stepTitleRow--spacer">
                <div className="ags-stepBar" />
                <div className="ags-titleText">
                ขั้นตอนที่ 4: แชร์เกม
                </div>
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
                            <button type="button" className="btn-share">
                                <Share2 size={16} style={{marginRight: 6}} />
                                แชร์
                            </button>
                        </div>
                    </div>

                    <div className="step4-actions">
                        {/* ✅ แก้ไขปุ่มนี้ครับ */}
                        <button type="button" className="btn-edit-criteria" onClick={handleEditGame}>
                            <Pencil size={16} style={{marginRight: 6}} />
                            แก้ไขเกณฑ์การให้คะแนน
                        </button>

                        <button type="button" className="btn-green-go" onClick={handleGoToLobby}>
                            ไปยังหน้ารอเกม
                        </button>
                    </div>
                </div>
            </section>
        </div>
      )}

      {/* ===================== FOOTER ===================== */}
      <footer className="ags-footer">
        <div className="footer-line" />
        <p>© 2026 Hotel Business Simulator System</p>
        <p className="footer-sub">Designed for MBA Class • Admin Panel v1.0</p>
      </footer>

    </div>
  );
}