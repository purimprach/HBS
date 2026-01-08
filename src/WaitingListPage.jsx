import React, { useState, useEffect } from 'react';
import './WaitingListPage.css'; 
import { useNavigate } from 'react-router-dom';
import { 
  // --- Icons หลัก ---
  Clock, BookOpen, User, Globe, LogOut, 
  // --- Icons สำหรับ Rules (ต้องมี Zap ด้วย) ---
  Calendar, DollarSign, Zap, Sliders, TrendingUp, AlertTriangle,
  // --- Icons ใหม่สำหรับ Scoring (ให้ตรงกับรูป) ---
  CircleDollarSign, Building2, PieChart, Users, BarChart3, ClipboardList
} from 'lucide-react';

function WaitingListPage() {
  const navigate = useNavigate();

  // --- State ---
  const [isUserReady, setIsUserReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); 

  // --- Logic นับถอยหลัง ---
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      navigate('/home');
    }
  }, [timeLeft, navigate]);

  // [Helper] ฟังก์ชันเลือกสถานะตามเวลา (3 ระดับ)
  const getTimerStatus = (seconds) => {
    if (seconds <= 60 && seconds > 0) return 'critical'; // แดง (<= 1 นาที)
    if (seconds <= 120 && seconds > 0) return 'warning'; // เหลือง (<= 3 นาที)
    return 'normal'; // เขียว (> 3 นาที)
  };

  const handleConfirmReady = () => {
    setIsUserReady(true);
  };

  const handleExit = () => {
    if (window.confirm("คุณต้องการออกจากห้องรอเกมใช่หรือไม่?")) {
       navigate('/account'); 
    }
  };

  const formatTimeDigits = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (
      <div className="timer-digits-wrapper">
         <div className="digit-card">{m < 10 ? '0' + m : m}</div>
         <span className="timer-colon">:</span>
         <div className="digit-card">{s < 10 ? '0' + s : s}</div>
      </div>
    );
  };

  // Mock Data
  const teams = [
    { rank: 4, name: 'พญานาค (You)', captain: 'Username 4', members: 4, isUser: true }, 
    { rank: 1, name: 'Coastal Kings', captain: 'Username 1', members: 4, isUser: false },
    { rank: 2, name: 'Coastal Queen', captain: 'Username 2', members: 4, isUser: false },
    { rank: 3, name: 'Coastal Jack', captain: 'Username 3', members: 4, isUser: false },
    { rank: 5, name: 'Coastal Ace', captain: 'Username 5', members: 4, isUser: false },
  ];

  const gameRules = [
    { icon: <Calendar size={28} />, title: 'ระยะเวลาของเกม', desc: 'เกมจะเล่นทั้งหมด 12 รอบ', badge: '12 รอบ' },
    { icon: <Clock size={28} />, title: 'ระยะเวลาต่อรอบ', desc: 'กำหนดเวลาแบ่งในแต่ละรอบคือ 15 นาที', badge: '15 นาที' },
    { icon: <DollarSign size={28} />, title: 'เงินสดเริ่มต้น', desc: 'เงินสดเริ่มต้นที่ 10,000,000 บาท', badge: '10M', footerIcon: <Zap size={14} />, footerText: 'ข้อมูลสำคัญ' },
    { icon: <Sliders size={28} />, title: 'การตัดสินใจหลัก', desc: 'ควบคุมอัตราค่าห้องพัก, ค่าใช้จ่ายทางการตลาด ฯลฯ', badge: null },
    { icon: <TrendingUp size={28} />, title: 'ความผันผวนของตลาด', desc: 'ตั้งค่าเป็น "ปานกลาง" คาดหวังเหตุการณ์ทางเศรษฐกิจแบบสุ่ม', badge: 'ปานกลาง' },
    { icon: <AlertTriangle size={28} />, title: 'บทลงโทษ', desc: 'หากกระแสเงินสดติดลบมากเกินไป ธุรกิจจะล้มละลาย', badge: null, footerIcon: <AlertTriangle size={14} />, footerText: 'ข้อควรระวัง', isAlert: true },
  ];

  // ✅ อัปเดตไอคอน Scoring ให้ตรงกับรูปภาพ Ref
  const scoringCriteria = [
    { 
        title: 'ผลการดำเนินงานทางการเงิน', 
        desc: 'กำไรสุทธิ, รายได้เฉลี่ยต่อห้อง, ROE', 
        percent: '20%', 
        icon: <CircleDollarSign size={28} /> // รูปเหรียญ
    },
    { 
        title: 'ผลการดำเนินงานโดยรวม', 
        desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก', 
        percent: '20%', 
        icon: <Building2 size={28} /> // รูปตึก
    },
    { 
        title: 'การตลาดและแบรนด์', 
        desc: 'ส่วนแบ่งการตลาด, ชื่อเสียงของแบรนด์', 
        percent: '15%', 
        icon: <PieChart size={28} /> // รูปกราฟวงกลม
    },
    { 
        title: 'พนักงานและองค์กร', 
        desc: 'ความพึงพอใจพนักงาน, การฝึกอบรม', 
        percent: '10%', 
        icon: <Users size={28} /> // รูปกลุ่มคน
    },
    { 
        title: 'การเติบโตและมูลค่าในระยะยาว', 
        desc: 'มูลค่าเพิ่มทางเศรษฐศาสตร์, ทรัพย์สิน', 
        percent: '10%', 
        icon: <BarChart3 size={28} /> // รูปกราฟแท่ง
    },
    { 
        title: 'ปฏิบัติการและงานบริการ', 
        desc: 'ความพึงพอใจลูกค้า, อัตราการเข้าพัก', 
        percent: '15%', 
        icon: <ClipboardList size={28} /> // รูป Check list
    },
    { 
        title: 'ความเสี่ยงและวินัยทางการเงิน', 
        desc: 'กระแสเงินสด, D/E Ratio', 
        percent: '10%', 
        icon: <AlertTriangle size={28} /> // รูปตกใจ (เหมือนเดิม)
    },
  ];

  return (
    <div className="waiting-container">
      {/* Navbar */}
      <nav className="waiting-header">
        <div className="header-left">
              <Building2 size={24} color="#1a1a1a" />
              <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="btn-exit-room" onClick={handleExit}>
             <LogOut size={16} /> ออกจากห้อง
          </button>
          <button className="lang-btn"><Globe size={16}/> TH</button>
          <div className="user-mini-profile">
             <div className="user-avatar-small"><User size={20} /></div>
             <div className="user-info-text">
                <span className="user-name">Jane</span>
                <span className="user-role">ผู้เล่น</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="waiting-content">
        
        {/* --- 1. Session Hero Card --- */}
        <div className="session-hero-card">
            <div className="session-header-left">
                <h2>เซสชันเกม: การจำลองธุรกิจโรงแรม</h2>
                <div className="mode-badge-container">
                    <span className="mode-badge">โหมดผู้เล่นหลายคน</span>
                </div>
                <p className="session-desc">
                    ยินดีต้องรับ การก้าวเข้าสู่บทบาทของการเป็นหุ้นส่วนของโรงแรมในเกม การจำลองธุรกิจโรงแรม ภารกิจของคุณ คือการบริหารจัดการโรงแรมของคุณให้สามารถดำเนินธุรกิจได้ ภายใต้สภาวะต่างๆ ที่ตลาดมีการเปลี่ยนแปลงตลอดเวลา การแข่งขันที่ดุเดือด คือกุญแจสำคัญที่จะพาคุณก้าวขึ้นเป็นผู้นำในอุตสาหกรรมโรงแรมในซิมูเลชันที่เดิมพันสูงนี้
                </p>
            </div>

            <div className="session-stats-grid">
                <div className="stat-box-white">
                    <span className="stat-label">จำนวนรอบการเล่น</span>
                    <span className="stat-value">12</span>
                </div>
                <div className="stat-box-white">
                    <span className="stat-label">ผู้ดูแล</span>
                    <span className="stat-value">แอดมิน 1</span>
                </div>
                <div className="stat-box-white">
                    <span className="stat-label">ชื่อเกม</span>
                    <span className="stat-value">HBS 2029</span>
                </div>
                
                {/* Timer Box (Updated Logic) */}
                {(() => {
                    const status = getTimerStatus(timeLeft);
                    let boxClass = "timer-box-normal";
                    let iconColor = "#198754";
                    // 1. ตั้งค่าข้อความปกติ
                    let warningText = "โปรดยืนยันก่อนหมดเวลา";

                    if (status === 'critical') {
                        boxClass = "timer-box-critical";
                        iconColor = "white";
                        // 2. เปลี่ยนข้อความเมื่อเป็นสีแดง (วิกฤต)
                        warningText = "ถ้าไม่ยืนยันจะถูกตัดออกจากเกมโดยอัตโนมัติ";
                    } else if (status === 'warning') {
                        boxClass = "timer-box-warning";
                        iconColor = "#212529"; // สีดำ ให้ตัดกับพื้นเหลือง
                    }

                    return (
                        <div className={boxClass}>
                            <div className="timer-info-group">
                                 <div className="timer-label-row">
                                    <Clock size={22} color={iconColor} />
                                    <span className="timer-text-main">เกมจะเริ่มในอีก</span>
                                 </div>
                                 {/* 3. แสดงข้อความ และสั่งให้ตัดคำถ้าข้อความยาว (whiteSpace: 'normal') */}
                                 <span className="timer-sub-text" style={{ whiteSpace: status === 'critical' ? 'normal' : 'nowrap' }}>
                                    {warningText}
                                 </span>
                            </div>
                            {formatTimeDigits(timeLeft)}
                        </div>
                    );
                })()}
            </div>
        </div>

        {/* --- 2. Team Table --- */}
        <div className="team-table-card">
            <div className="team-header-row">
                <div className="team-icon-box">
                    <Users size={20} color="white" />
                </div>
                <h3>ทีมที่เข้าร่วม</h3>
            </div>

            <div className="custom-table">
                <div className="tbl-head">
                    <div>ลำดับที่</div>
                    <div>ชื่อทีม</div>
                    <div>หัวหน้าทีม</div>
                    <div style={{ textAlign: 'center' }}>จำนวนผู้เล่น</div>
                    <div style={{ textAlign: 'center' }}>สถานะ</div>
                </div>
                <div className="tbl-body">
                    {teams.map((team, idx) => {
                        let statusText = team.isUser ? (isUserReady ? 'ยืนยัน' : 'รอยืนยัน') : (team.rank === 3 ? 'รอยืนยัน' : 'ยืนยัน');
                        let statusClass = (statusText === 'ยืนยัน') ? 'status-text-green' : 'status-text-yellow';
                        let rowBgClass = team.isUser ? 'row-bg-user' : ((idx % 2 === 0) ? 'row-bg-white' : 'row-bg-gray');

                        return (
                            <div key={idx} className={`tbl-row ${rowBgClass}`}>
                                <div>{team.rank}</div>
                                <div>{team.name}</div>
                                <div>{team.captain}</div>
                                <div style={{ textAlign: 'center' }}>{team.members}</div>
                                <div style={{ textAlign: 'center' }} className={statusClass}>
                                    {statusText}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="table-footer-action">
                <button 
                    className="btn-confirm-action"
                    onClick={handleConfirmReady}
                    disabled={isUserReady}
                >
                    {isUserReady ? 'ยืนยันเรียบร้อย' : 'ยืนยัน'}
                </button>
            </div>
        </div>

        {/* --- 3. Rules Section --- */}
        <div className="rules-main-card">
            <div className="rules-card-header">
                <div className="rules-header-left">
                    <div className="rules-icon-main"><BookOpen size={24} color="white" /></div>
                    <div className="rules-text-group">
                        <h3>รายละเอียดและกติกาเกม</h3>
                        <span>ทำความเข้าใจกฎเกณฑ์และโครงสร้างของเกม</span>
                    </div>
                </div>
                <button className="btn-outline-green">
                    <BookOpen size={16} style={{marginRight:'5px'}}/> ดูหนังสือคู่มือกติกาฉบับเต็ม
                </button>
            </div>

            <div className="rules-grid">
                {gameRules.map((rule, idx) => (
                    <div key={idx} className="rule-card-modern">
                        <div className="rule-card-top">
                            <div className="rule-icon-box">{rule.icon}</div>
                            <div className="rule-info">
                                <div className="rule-header-row">
                                    <h4>{rule.title}</h4>
                                    {rule.badge && <span className="rule-badge">{rule.badge}</span>}
                                </div>
                                <p>{rule.desc}</p>
                            </div>
                        </div>
                        {rule.footerText && (
                            <div className={`rule-footer ${rule.isAlert ? 'text-alert' : 'text-success'}`}>
                                {rule.footerIcon}
                                <span>{rule.footerText}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
        {/* --- 4. Scoring Criteria Section --- */}
        <div className="scoring-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="rules-icon-main" style={{ backgroundColor: '#198754' }}>
              <ClipboardList size={24} color="white" />
            </div> 
            <h3>เกณฑ์การให้คะแนน</h3>
          </div> 

          <div className="scoring-note">
            <strong>เงื่อนไขการชนะ:</strong> ทีมที่มีคะแนนรวมสูงสุดเมื่อจบรอบสุดท้าย จะถูกประกาศให้เป็นผู้ชนะ <br />
            <strong>คำใบ้กลยุทธ์สำคัญ:</strong> ในขณะที่ความพึงพอใจของแขกและส่วนแบ่งการตลาดมีความสำคัญในการขับเคลื่อนรายได้ การตัดสินใจอย่างสม่ำเสมอที่ช่วยเพิ่มมูลค่าสินทรัพย์ รวมของคุณ คือเส้นทางที่ตรงที่สุดสู่ชัยชนะ
          </div>

          <div className="scoring-grid">
            {scoringCriteria.map((item, index) => (
              <div key={index} className="score-box-modern">
                  <div className="score-icon-box">{item.icon}</div>
                  <div className="score-text-info">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                  </div>
                  <div className="score-percent-badge">{item.percent}</div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default WaitingListPage;