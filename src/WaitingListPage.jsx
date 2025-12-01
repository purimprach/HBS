import React, { useState, useEffect } from 'react';
import './WaitingListPage.css';
import { useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate

function WaitingListPage() {
  const navigate = useNavigate();

  // --- State ---
  const [isUserReady, setIsUserReady] = useState(false); // สถานะความพร้อมของผู้เล่น (เริ่มที่ false)
  const [timeLeft, setTimeLeft] = useState(null); // เวลา (เริ่มที่ null คือยังไม่นับ)

  // --- Logic นับถอยหลัง ---
  useEffect(() => {
    // ถ้าเวลาไม่เป็น null และมากกว่า 0 ให้ลดลงทีละ 1 วินาที
    if (timeLeft !== null && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId); // Clear interval เมื่อ unmount หรือ time เปลี่ยน
    } 
    // ถ้าเวลาเหลือ 0 ให้ย้ายหน้า
    else if (timeLeft === 0) {
      navigate('/game-dashboard'); // ** แก้เป็น path ของหน้าถัดไปที่คุณต้องการ **
    }
  }, [timeLeft, navigate]);

  // --- ฟังก์ชันกดปุ่ม ---
  const handleConfirmReady = () => {
    setIsUserReady(true); // เปลี่ยนสถานะเป็นพร้อม
    setTimeLeft(10);      // เริ่มนับถอยหลัง 15 วินาที
  };

  // Mock Data (แก้สถานะของทีมแรกให้ผูกกับ State)
  const teams = [
    { id: 1, name: 'พญานาค (You)', captain: 'Username 1', members: 4, 
      status: isUserReady ? 'ready' : 'not-ready' }, // ผูกกับ State
    { id: 2, name: 'Coastal Kings', captain: 'Username 2', members: 4, status: 'ready' },
    { id: 3, name: 'Paradise Properties', captain: 'Username 3', members: 4, status: 'ready' },
    { id: 4, name: 'Big Mountain', captain: 'Username 4', members: 4, status: 'not-ready' },
    { id: 5, name: 'Giant Waterpark', captain: 'Username 5', members: 4, status: 'ready' },
  ];

  // (ข้อมูล Scoring Criteria คงเดิม...)
  const scoringCriteria = [
    { title: 'ผลการดำเนินงานทางการเงิน', desc: 'กำไรสุทธิ, รายได้เฉลี่ยต่อห้อง (RevPAR), อัตราผลตอบแทนต่อผู้ถือหุ้น (ROE)', percent: '20%', icon: '💰' },
    { title: 'ผลการดำเนินงานโดยรวม', desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ประสิทธิภาพการดำเนินงาน', percent: '20%', icon: '🏢' },
    { title: 'การตลาดและแบรนด์', desc: 'ส่วนแบ่งการตลาด, คะแนนชื่อเสียงของแบรนด์', percent: '15%', icon: '📢' },
    { title: 'พนักงานและองค์กร', desc: 'ความพึงพอใจพนักงาน, อัตราการลาออก, ชั่วโมงการฝึกอบรม/การพัฒนา', percent: '10%', icon: '👥' },
    { title: 'การเติบโตและมูลค่าในระยะยาว', desc: 'มูลค่าทรัพย์สินตามราคาตลาด, การเติบโตของมูลค่ากิจการ', percent: '10%', icon: '📈' },
    { title: 'ปฏิบัติการและงานบริการ', desc: 'คะแนนความพึงพอใจลูกค้า, อัตราการเข้าพัก', percent: '15%', icon: '🛎️' },
    { title: 'ความเสี่ยงและวินัยทางการเงิน', desc: 'กระแสเงินสด / สภาพคล่อง, อัตราส่วนหนี้สินต่อทุน (D/E Ratio)', percent: '10%', icon: '⚠️' },
  ];

  // Helper แปลงวินาทีเป็น นาที:วินาที (เช่น 0:15)
  const formatTime = (seconds) => {
    if (seconds === null) return "รอการยืนยัน...";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="waiting-container">
      {/* Header (คงเดิม) */}
      <nav className="account-header">
        <div className="header-left">
          <span className="logo-icon">🏨</span>
          <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="lang-btn">🌐 TH</button>
          <div className="user-mini-profile">
             <div className="user-info-text">
                <span className="user-name">Jane </span>
                <span className="user-role">ผู้เล่น</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="waiting-content">
        
        {/* Card 1: Session Info */}
        <div className="card session-card">
            <h2>เซสชันเกม: การจำลองธุรกิจโรงแรม</h2>
            <span className="mode-tag">โหมดผู้เล่นหลายคน</span>
            <p className="session-desc">
                ยินดีต้อนรับ... (ข้อความเดิม)
            </p>
            <div className="session-stats">
                <div className="stat-item">
                    <span className="stat-label">จำนวนรอบการเล่น</span>
                    <span className="stat-value">12</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">ชื่อผู้ดูแล</span>
                    <span className="stat-value">แอดมิน 1</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">เวลาและวันที่เริ่มเกม</span>
                    <span className="stat-value">9:00 น. วันที่ 5 ธ.ค. 2568</span>
                </div>
            </div>
        </div>

        {/* Card 2: Team List */}
        <div className="card team-list-card">
            <h3>ทีมที่เข้าร่วม</h3>
            <div className="table-header">
                <span style={{flex: 2}}>ชื่อทีม</span>
                <span style={{flex: 2}}>หัวหน้าทีม</span>
                <span style={{flex: 1, textAlign: 'center'}}>จำนวนผู้เล่น</span>
                <span style={{flex: 1, textAlign: 'right'}}>สถานะ</span>
            </div>
            <div className="table-body">
                {teams.map((team) => (
                    <div key={team.id} className={`table-row ${team.id === 1 ? 'row-highlight' : ''}`}>
                        <span style={{flex: 2, fontWeight: 'bold'}}>{team.name}</span>
                        <span style={{flex: 2}}>{team.captain}</span>
                        <span style={{flex: 1, textAlign: 'center'}}>{team.members}</span>
                        <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                            {/* แสดงสถานะ (เปลี่ยนสีตาม class) */}
                            <span className={`status-badge ${team.status}`}>
                                {team.status === 'ready' ? 'พร้อม' : 'ไม่พร้อม'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="waiting-footer">
                {/* แสดงเวลาถอยหลัง */}
                <span className="countdown-text">
                    {timeLeft !== null ? `เกมจะเริ่มในอีก ${formatTime(timeLeft)} นาที` : 'กรุณายืนยันเพื่อเริ่มเกม'}
                </span>
                
                {/* ปุ่มยืนยัน (เปลี่ยนสีตามสถานะ) */}
                <button 
                    className={`btn-confirm-ready ${isUserReady ? 'disabled' : 'active'}`}
                    onClick={handleConfirmReady}
                    disabled={isUserReady} // กดแล้วห้ามกดซ้ำ
                >
                    {isUserReady ? 'ยืนยันเรียบร้อย' : 'ยืนยันเตรียมพร้อม'}
                </button>
            </div>
        </div>

        {/* Card 3, 4 ... (ส่วนอื่นๆ คงเดิม) */}
        <div className="card details-card">
             {/* ... content คงเดิม ... */}
             <h3>รายละเอียดและกติกาเกม</h3>
             {/* ... */}
        </div>
        
        <div className="card scoring-card">
             {/* ... content คงเดิม ... */}
             <h3>เกณฑ์การให้คะแนน</h3>
             <div className="scoring-grid">
                {scoringCriteria.map((item, index) => (
                    <div key={index} className="score-box">
                        <div className="score-content">
                            <div className="score-icon">{item.icon}</div>
                            <div className="score-text">
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                        <div className="score-percent">{item.percent}</div>
                    </div>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
}

export default WaitingListPage;