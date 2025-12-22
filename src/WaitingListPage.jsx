import React, { useState, useEffect } from 'react';
import './WaitingListPage.css'; 
import { useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, DollarSign, Settings, TrendingUp, AlertTriangle, 
  Calendar, Users, User, Globe, LogOut, Building, Zap, Sliders,ClipboardList 
} from 'lucide-react';

function WaitingListPage() {
  const navigate = useNavigate();

  // --- State ---
  const [isUserReady, setIsUserReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); 

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

  // เช็คนาทีสุดท้าย
  const isLastMinute = timeLeft <= 60 && timeLeft > 0;

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
      <div className="timer-display-row">
        <span className="digit-box">{m < 10 ? '0' + m : m}</span>
        <span className="colon">:</span>
        <span className="digit-box">{s < 10 ? '0' + s : s}</span>
      </div>
    );
  };

  // Mock Data: Teams
  const teams = [
    { rank: 4, name: 'พญานาค (You)', captain: 'Username 4', members: 4, isUser: true }, 
    { rank: 1, name: 'Coastal Kings', captain: 'Username 1', members: 4, isUser: false },
    { rank: 2, name: 'Coastal Queen', captain: 'Username 2', members: 4, isUser: false },
    { rank: 3, name: 'Coastal Jack', captain: 'Username 3', members: 4, isUser: false },
    { rank: 5, name: 'Coastal Ace', captain: 'Username 5', members: 4, isUser: false },
  ];

  // ✅ แก้ไข Mock Data: Game Rules ให้ตรงตามรูป (เพิ่ม footer, badge)
  const gameRules = [
    { 
        icon: <Calendar size={28} />, 
        title: 'ระยะเวลาของเกม', 
        desc: 'เกมจะเล่นทั้งหมด 12 รอบ', 
        badge: '12 รอบ' 
    },
    { 
        icon: <Clock size={28} />, 
        title: 'ระยะเวลาต่อรอบ', 
        desc: 'กำหนดเวลาแบ่งในแต่ละรอบคือ 15 นาที', 
        badge: '15 นาที' 
    },
    { 
        icon: <DollarSign size={28} />, 
        title: 'เงินสดเริ่มต้น', 
        desc: 'เงินสดเริ่มต้นที่ 10,000,000 บาท', 
        badge: '10M',
        footerIcon: <Zap size={14} />,
        footerText: 'ข้อมูลสำคัญ'
    },
    { 
        icon: <Sliders size={28} />, 
        title: 'การตัดสินใจหลัก', 
        desc: 'ควบคุมอัตราค่าห้องพัก, ค่าใช้จ่ายทางการตลาด, ระดับพนักงาน, การอัปเกรดและการปรับปรุงสิ่งต่างๆในแต่ละรอบ', 
        badge: null 
    },
    { 
        icon: <TrendingUp size={28} />, 
        title: 'ความผันผวนของตลาด', 
        desc: 'ตั้งค่าเป็น "ปานกลาง" คาดหวังเหตุการณ์ทางเศรษฐกิจแบบสุ่มที่สามารถส่งผลกระทบต่ออัตราการท่องเที่ยวและต้นทุนการดำเนินงาน', 
        badge: 'ปานกลาง' 
    },
    { 
        icon: <AlertTriangle size={28} />, 
        title: 'บทลงโทษ', 
        desc: 'ข้อควรระวัง: หากคุณไม่สามารถรักษากระแสเงินสดให้เป็นบวก และปล่อยให้ตัวเลขติดลบมากเกินไป ธุรกิจของคุณจะล้มละลาย', 
        badge: null,
        footerIcon: <AlertTriangle size={14} />,
        footerText: 'ข้อควรระวัง',
        isAlert: true 
    },
  ];

  // Mock Data: Scoring
  const scoringCriteria = [
    { 
      title: 'ผลการดำเนินงานทางการเงิน', 
      desc: 'กำไรสุทธิ, รายได้เฉลี่ยต่อห้อง (RevPAR), อัตราผลตอบแทนต่อส่วนผู้ถือหุ้น (ROE)', 
      percent: '20%', 
      icon: <DollarSign size={32} /> 
    },
    { 
      title: 'ผลการดำเนินงานโดยรวม', 
      desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ชั่วโมง/งบประมาณการฝึกอบรม', 
      percent: '20%', 
      icon: <Building size={32} /> 
    },
    { 
      title: 'การตลาดและแบรนด์', 
      desc: 'ส่วนแบ่งการตลาด, คะแนนชื่อเสียงของแบรนด์', 
      percent: '15%', 
      icon: <Globe size={32} /> 
    },
    { 
      title: 'พนักงานและองค์กร', 
      desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ชั่วโมง/งบประมาณการฝึกอบรม', 
      percent: '10%', 
      icon: <Users size={32} /> 
    },
    { 
      title: 'การเติบโตและมูลค่าในระยะยาว', 
      desc: 'มูลค่าเพิ่มทางเศรษฐศาสตร์, การเติบโตของมูลค่าทรัพย์สิน', 
      percent: '10%', 
      icon: <TrendingUp size={32} /> 
    },
    { 
      title: 'ปฏิบัติการและงานบริการ', 
      desc: 'คะแนนความพึงพอใจลูกค้า, อัตราการเข้าพัก', 
      percent: '15%', 
      icon: <Settings size={32} /> 
    },
    { 
      title: 'ความเสี่ยงและวินัยทางการเงิน', 
      desc: 'กระแสเงินสด / สภาพคล่อง, อัตราส่วนหนี้สินต่อทุน (D/E Ratio), งานซ่อมบำรุงคงค้าง', 
      percent: '10%', 
      icon: <AlertTriangle size={32} /> 
    },
  ];

  return (
    <div className="waiting-container">
      <nav className="waiting-header">
        <div className="header-brand">
          <span className="logo-emoji">🏨</span>
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
        <div className="card session-hero-card">
            
            <div className="session-header-left">
                <h2>เซสชันเกม: การจำลองธุรกิจโรงแรม</h2>
                <span className="mode-badge">โหมดผู้เล่นหลายคน</span>
                <p className="session-desc">
                    ยินดีต้อนรับ การก้าวเข้าสู่บทบาทของการเป็นหุ้นส่วนของโรงแรมในเกม การจำลองธุรกิจโรงแรม ภารกิจของคุณ คือการบริหารจัดการโรงแรมของคุณให้สามารถดำเนินธุรกิจได้ ภายใต้สภาวะต่างๆ ที่ตลาดมีการเปลี่ยนแปลงตลอดเวลา การแข่งขันที่ดุเดือด คือกุญแจสำคัญที่จะพาคุณก้าวขึ้นเป็นผู้นำในอุตสาหกรรมโรงแรมในซิมูเลชันที่เดิมพันสูงนี้
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
                <div className="stat-box-white game-name-box">
                    <span className="stat-label">ชื่อเกม</span>
                    <span className="stat-value">HBS 2029</span>
                </div>
                <div className={isLastMinute ? "timer-box-warning" : "timer-box-green"}>
                    <div className="timer-info">
                        <div className="timer-title-row">
                            <Clock size={20} className="timer-icon" />
                            <span className="timer-label">เกมจะเริ่มในอีก</span>
                        </div>
                        <span className="timer-sub">โปรดยืนยันก่อนหมดเวลา</span>
                    </div>
                    <div className="timer-digits">
                        {formatTimeDigits(timeLeft)}
                    </div>
                </div>
            </div>
        </div>

        {/* --- 2. Team Table --- */}
        <div className="card team-table-card">
            <div className="team-header-row">
                <h3>ทีมที่เข้าร่วม</h3>
            </div>
            <div className="custom-table">
                <div className="tbl-head">
                    <div className="th col-rank">ลำดับที่</div>
                    <div className="th col-name">ชื่อทีม</div>
                    <div className="th col-capt">หัวหน้าทีม</div>
                    <div className="th col-count">จำนวนผู้เล่น</div>
                    <div className="th col-status">สถานะ</div>
                </div>
                <div className="tbl-body">
                    {teams.map((team, idx) => {
                        let statusText = team.isUser ? (isUserReady ? 'ยืนยัน' : 'รอยืนยัน') : (team.rank === 3 ? 'รอยืนยัน' : 'ยืนยัน');
                        let statusClass = team.isUser ? (isUserReady ? 'status-text-green' : 'status-text-yellow') : (team.rank === 3 ? 'status-text-yellow' : 'status-text-green');

                        return (
                            <div key={idx} className={`tbl-row ${team.isUser ? 'row-highlight' : ''}`}>
                                <div className="td col-rank">{team.rank}</div>
                                <div className="td col-name">{team.name}</div>
                                <div className="td col-capt">{team.captain}</div>
                                <div className="td col-count">{team.members}</div>
                                <div className="td col-status">
                                    <span className={statusClass}>{statusText}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="table-footer-action">
                <button 
                    className={`btn-confirm-action ${isUserReady ? 'confirmed' : 'active'}`}
                    onClick={handleConfirmReady}
                    disabled={isUserReady}
                >
                    {isUserReady ? 'ยืนยันเรียบร้อย' : 'ยืนยัน'}
                </button>
            </div>
        </div>

        {/* ✅✅✅ ส่วนที่แก้ไข: รวม Header และ Grid ไว้ใน Card เดียวกัน ✅✅✅ */}
        <div className="card rules-main-card">
            
            {/* Header ส่วนบนของ Card */}
            <div className="rules-card-header">
                <div className="rules-header-left">
                    <div className="rules-icon-main"><BookOpen size={24} color="white" /></div>
                    <div className="rules-text-group" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start', /* ตัวสำคัญ: สั่งชิดซ้าย */
                      textAlign: 'left'         /* ตัวสำคัญ: สั่งชิดซ้าย */
                      }}>
                        <h3>รายละเอียดและกติกาเกม</h3>
                        <span>ทำความเข้าใจกฎเกณฑ์และโครงสร้างของเกม</span>
                    </div>
                </div>
                <button className="btn-outline-green">
                    <BookOpen size={16} style={{marginRight:'5px'}}/> ดูหนังสือคู่มือกติกาฉบับเต็ม
                </button>
            </div>

            {/* Grid ของข้อมูลกติกา */}
            <div className="rules-grid">
                {gameRules.map((rule, idx) => (
                    <div key={idx} className="rule-card-modern">
                        <div className="rule-card-top">
                            <div className="rule-icon-box">
                                {rule.icon}
                            </div>
                            <div className="rule-info">
                                <div className="rule-header-row">
                                    <h4>{rule.title}</h4>
                                    {rule.badge && <span className="rule-badge">{rule.badge}</span>}
                                </div>
                                <p>{rule.desc}</p>
                            </div>
                        </div>
                        
                        {/* Footer แสดงข้อความเตือน/ข้อมูลสำคัญ (ถ้ามี) */}
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
        {/* ✅✅✅ จบส่วนที่แก้ไข ✅✅✅ */}
        
        {/* Scoring Criteria Section */}
<div className="card scoring-card">
  
  {/* --- ส่วนหัว (Header) : ใช้ Flex เพื่อวางไอคอนคู่กับหัวข้อ --- */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
    
    {/* กล่องไอคอนสีเขียว */}
    <div className="rules-icon-main" style={{ backgroundColor: '#198754' }}>
      <ClipboardList size={24} color="white" />
    </div> 
    {/* ปิด div ของ rules-icon-main ตรงนี้ เพื่อให้จบส่วนไอคอน */}

    <h3>เกณฑ์การให้คะแนน</h3>
  </div> 
  {/* ปิด div ของ flex header ตรงนี้ เพื่อให้ Note และ Grid ลงมาอยู่บรรทัดใหม่ */}

  {/* Note Box */}
  <div className="scoring-note">
    <strong>เงื่อนไขการชนะ:</strong> ทีมที่มีคะแนนรวมสูงสุดเมื่อจบรอบสุดท้าย จะถูกประกาศให้เป็นผู้ชนะ <br />
    <strong>คำใบ้กลยุทธ์สำคัญ:</strong> 💡 ในขณะที่ความพึงพอใจของแขกและส่วนแบ่งการตลาดมีความสำคัญในการขับเคลื่อนรายได้ การตัดสินใจอย่างสม่ำเสมอที่ช่วยเพิ่มมูลค่าสินทรัพย์ รวมของคุณ คือเส้นทางที่ตรงที่สุดสู่ชัยชนะ
  </div>

 {/* Grid Layout */}
<div className="scoring-grid">
  {scoringCriteria.map((item, index) => (
    <div 
      key={index} 
      className="score-box-modern" 
      style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', // จัดให้อยู่กึ่งกลางแนวตั้ง
        padding: '20px',
        gap: '20px' // <-- [จุดที่ 1] กำหนดระยะห่างระหว่าง ไอคอน กับ ข้อความ ให้พอดี
      }} 
    >
        
        {/* ส่วนไอคอน */}
        <div className="score-icon-box" style={{ flexShrink: 0 }}>
            {item.icon}
        </div>

        {/* ส่วนข้อความ */}
        <div className="score-text-info" style={{ 
            flex: 1, 
            textAlign: 'left', // <-- [จุดที่ 2] เปลี่ยนจาก center เป็น left เพื่อให้ชิดรูป
            padding: '0'      // เอา padding ออกเพื่อให้ชิดซ้ายจริงๆ
        }}>
            <h4 style={{ margin: '0 0 8px 0' }}>{item.title}</h4>
            <p style={{ margin: 0 }}>{item.desc}</p>
        </div>

        {/* ส่วน Badge (เปอร์เซ็นต์) มุมขวาบนเหมือนเดิม */}
        <div 
            className="score-percent-badge" 
            style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px',
              backgroundColor: '#198754', 
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
        >
            {item.percent}
        </div>

    </div>
  ))}
</div>

</div>

      </main>
    </div>
  );
}

export default WaitingListPage;