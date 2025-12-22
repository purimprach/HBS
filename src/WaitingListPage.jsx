import React, { useState, useEffect } from 'react';
import './WaitingListPage.css'; 
import { useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, DollarSign, Settings, TrendingUp, AlertTriangle, 
  Calendar, Users, User, Globe, LogOut, Building, Zap, Sliders, ClipboardList 
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

  // Mock Data: Game Rules
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
      icon: <DollarSign size={28} />
    },
    { 
      title: 'ผลการดำเนินงานโดยรวม', 
      desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ชั่วโมง/งบประมาณการฝึกอบรม', 
      percent: '20%', 
      icon: <Building size={28} /> 
    },
    { 
      title: 'การตลาดและแบรนด์', 
      desc: 'ส่วนแบ่งการตลาด, คะแนนชื่อเสียงของแบรนด์', 
      percent: '15%', 
      icon: <Globe size={28} /> 
    },
    { 
      title: 'พนักงานและองค์กร', 
      desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ชั่วโมง/งบประมาณการฝึกอบรม', 
      percent: '10%', 
      icon: <Users size={28} /> 
    },
    { 
      title: 'การเติบโตและมูลค่าในระยะยาว', 
      desc: 'มูลค่าเพิ่มทางเศรษฐศาสตร์, การเติบโตของมูลค่าทรัพย์สิน', 
      percent: '10%', 
      icon: <TrendingUp size={28} /> 
    },
    { 
      title: 'ปฏิบัติการและงานบริการ', 
      desc: 'คะแนนความพึงพอใจลูกค้า, อัตราการเข้าพัก', 
      percent: '15%', 
      icon: <Settings size={28} /> 
    },
    { 
      title: 'ความเสี่ยงและวินัยทางการเงิน', 
      desc: 'กระแสเงินสด / สภาพคล่อง, อัตราส่วนหนี้สินต่อทุน (D/E Ratio), งานซ่อมบำรุงคงค้าง', 
      percent: '10%', 
      icon: <AlertTriangle size={28} /> 
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
        
        {/* --- 1. Session Hero Card (Original Code preserved) --- */}
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

        {/* --- 2. Team Table (Updated with Green Design) --- */}
        <div className="card team-table-card" style={{ padding: '24px' }}>
            {/* Header พร้อมไอคอน */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#198754', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>ทีมที่เข้าร่วม</h3>
            </div>

            <div className="custom-table" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Table Head: สีเขียวเข้ม */}
                <div className="tbl-head" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr', 
                    backgroundColor: '#2E7D32', // สีเขียวเข้มตาม Ref
                    color: 'white', 
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                }}>
                    <div>ลำดับที่</div>
                    <div>ชื่อทีม</div>
                    <div>หัวหน้าทีม</div>
                    <div style={{ textAlign: 'center' }}>จำนวนผู้เล่น</div>
                    <div style={{ textAlign: 'center' }}>สถานะ</div>
                </div>

                <div className="tbl-body">
                    {teams.map((team, idx) => {
                        let statusText = team.isUser ? (isUserReady ? 'ยืนยัน' : 'รอยืนยัน') : (team.rank === 3 ? 'รอยืนยัน' : 'ยืนยัน');
                        let statusColor = team.isUser ? (isUserReady ? '#15803d' : '#ca8a04') : (team.rank === 3 ? '#ca8a04' : '#15803d');
                        
                        // Row Background: ถ้าเป็น user ให้เป็นสีเขียวอ่อน
                        let rowBg = team.isUser ? '#dcfce7' : ((idx % 2 === 0) ? 'white' : '#f9fafb');

                        return (
                            <div key={idx} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr', 
                                padding: '12px 16px', 
                                backgroundColor: rowBg,
                                borderBottom: '1px solid #f3f4f6',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                fontWeight: team.isUser ? '600' : '400' 
                            }}>
                                <div style={{ fontWeight: 'bold' }}>{team.rank}</div>
                                <div>{team.name}</div>
                                <div>{team.captain}</div>
                                <div style={{ textAlign: 'center' }}>{team.members}</div>
                                <div style={{ textAlign: 'center', color: statusColor, fontWeight: 'bold' }}>
                                    {statusText}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* ปุ่มยืนยัน: ปรับให้เป็นสีเขียวเมื่อ Active */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                    onClick={handleConfirmReady}
                    disabled={isUserReady}
                    style={{
                        backgroundColor: isUserReady ? '#6b7280' : '#198754', // เขียวเมื่อยังไม่กด
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        cursor: isUserReady ? 'default' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        boxShadow: isUserReady ? 'none' : '0 2px 4px rgba(25, 135, 84, 0.3)'
                    }}
                >
                    {isUserReady ? 'ยืนยันเรียบร้อย' : 'ยืนยัน'}
                </button>
            </div>
        </div>

        {/* --- 3. Rules Section --- */}
        <div className="card rules-main-card">
            
            <div className="rules-card-header">
                <div className="rules-header-left">
                    <div className="rules-icon-main"><BookOpen size={24} color="white" /></div>
                    <div className="rules-text-group" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      textAlign: 'left'
                      }}>
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
        <div className="card scoring-card">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="rules-icon-main" style={{ backgroundColor: '#198754' }}>
              <ClipboardList size={24} color="white" />
            </div> 
            <h3>เกณฑ์การให้คะแนน</h3>
          </div> 

          <div className="scoring-note">
            <strong>เงื่อนไขการชนะ:</strong> ทีมที่มีคะแนนรวมสูงสุดเมื่อจบรอบสุดท้าย จะถูกประกาศให้เป็นผู้ชนะ <br />
            <strong>คำใบ้กลยุทธ์สำคัญ:</strong> 💡 ในขณะที่ความพึงพอใจของแขกและส่วนแบ่งการตลาดมีความสำคัญในการขับเคลื่อนรายได้ การตัดสินใจอย่างสม่ำเสมอที่ช่วยเพิ่มมูลค่าสินทรัพย์ รวมของคุณ คือเส้นทางที่ตรงที่สุดสู่ชัยชนะ
          </div>

          <div className="scoring-grid">
            {scoringCriteria.map((item, index) => (
              <div 
                key={index} 
                className="score-box-modern" 
                style={{ 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px',
                  gap: '12px'
                }} 
              >
                  <div className="score-icon-box" style={{ flexShrink: 0 }}>
                      {item.icon}
                  </div>
                  <div className="score-text-info" style={{ 
                      flex: 1, 
                      textAlign: 'left', 
                      padding: '0',
                      paddingRight: '35px'
                  }}>
                      <h4 style={{ 
                          margin: '0 0 2px 0', 
                          fontSize: '0.95rem', 
                          fontWeight: 'bold',
                          color: '#212529'
                      }}>
                          {item.title}
                      </h4>
                      <p style={{ 
                          margin: 0, 
                          fontSize: '0.8rem', 
                          color: '#6c757d',
                          lineHeight: '1.3'
                      }}>
                          {item.desc}
                      </p>
                  </div>
                  <div 
                      className="score-percent-badge" 
                      style={{ 
                        position: 'absolute', 
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#198754', 
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
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