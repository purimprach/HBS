import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
// ✅ นำเข้าไอคอนครบถ้วน
import { 
  Globe, MapPin, Home, Building, Car, 
  BedDouble, Users, Briefcase, Clock,
  DollarSign, Activity, CheckCircle, Wallet,
  Calendar, Award, Luggage, 
  Trees, Sparkles
} from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  // --- ⏰ Timer Logic ---
  const [timeLeft, setTimeLeft] = useState(600); 

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerState = () => {
    if (timeLeft <= 60) return 'critical'; 
    if (timeLeft <= 120) return 'warning'; 
    return 'normal';
  };

  const timerState = getTimerState();

  // --- Mock Data ---
  const roomTypes = [
    { name: 'ห้อง สแตนดาร์ด เอ', size: '32 ตร.ม.', count: 40, totalSize: '40 ห้อง' },
    { name: 'ห้อง สแตนดาร์ด บี (วิวภูเขา)', size: '40 ตร.ม.', count: 30, totalSize: '30 ห้อง' },
    { name: 'ห้อง ดีลักซ์', size: '60 ตร.ม.', count: 20, totalSize: '20 ห้อง' },
    { name: 'ห้อง สวีท สำหรับ 2 ท่าน', size: '80 ตร.ม.', count: 10, totalSize: '10 ห้อง' },
    { name: 'ห้อง สวีท สำหรับ 3 ท่าน', size: '90 ตร.ม.', count: 10, totalSize: '10 ห้อง' },
  ];

  const staffRoles = [
    { name: 'แม่บ้านและทำความสะอาด', count: 19, icon: '🧹' },
    { name: 'ฝ่ายบริการห้องพัก', count: 11, icon: '🛎️' },
    { name: 'ฝ่ายไอที (IT)', count: 2, icon: '💻' },
    { name: 'คนขับรถทั่วไป', count: 2, icon: '🚗' },
    { name: 'พนักงานดูแลสวนทั่วไป', count: 2, icon: '🌳' },
    { name: 'ผู้รักษาความปลอดภัย', count: 6, icon: '🛡️' },
    { name: 'ฝ่ายขายและการตลาด', count: 4, icon: '📢' },
    { name: 'ฝ่ายบัญชีและการเงิน', count: 6, icon: '💰' },
    { name: 'ฝ่ายทรัพยากรบุคคล (HR)', count: 3, icon: '👥' },
    { name: 'วิศวกร/ซ่อมบำรุง', count: 4, icon: '🔧' },
  ];

  const facilities = [
    { name: 'ห้องประชุม', info: 'จัดสัมนาได้ไม่เกิน 200 คน', icon: <Briefcase size={24}/> },
    { name: 'สวนและพื้นที่พักผ่อน', info: 'พื้นที่ 3 ไร่', icon: <Trees size={24}/> },
    { name: 'ลานจอดรถ', info: '350 คัน', icon: <Car size={24}/> }, // ใช้ไอคอนรถเพื่อให้สื่อความหมาย
    { name: 'รถรับส่งสนามบิน', info: '2 คัน', icon: <Car size={24}/> },
  ];

  return (
    <div className="homepage-container">
      
      {/* Top Bar */}
      <div className="top-status-bar">
        <div className="status-left">
           <span>รอบ : 1 / 12</span>
           <span className="divider">|</span>
           <span>ไตรมาสที่ 1 ช่วงเดือน มกราคม-มีนาคม พ.ศ. 2569</span>
        </div>
        <div className="status-right">
           <button className="lang-btn"><Globe size={14}/> TH</button>
           <div className="mini-profile"><div className="avatar-xs"></div> Jane Doe</div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="hero-section">
         <div className="hero-overlay">
             <div className="hero-content">
                <div className="premium-badge">✨ ระดับ Premium</div>
                <h1>โรงแรม SAWASDEE</h1>
                <p className="sub-hero">ที่พักสไตล์ล้านนาท่ามกลางธรรมชาติ</p>
                <div className="hero-meta">
                    <div className="meta-row"><Home size={18} /> <span>สถาปัตยกรรมไทยผสมผสานความทันสมัย</span></div>
                    <div className="meta-row"><MapPin size={18} /> <span>เมืองเชียงใหม่, ภาคเหนือ</span></div>
                </div>
             </div>
         </div>
      </header>

      {/* ✅ SECTION 1: ส่วนหัว */}
      <div className="main-layout layout-header">
         <div className="welcome-text">
            <h3>ยินดีต้อนรับสู่ การบริหารจัดการโรงแรมในเครือของคุณ</h3>
            <p>คุณกำลังบริหาร <span className="highlight-text">โรงแรม สวัสดี</span> โรงแรมพรีเมี่ยมสไตล์ล้านนา ในการแข่งขันกลุ่มโรงแรมพรีเมี่ยม เวลาในการตัดสินใจครั้งแรก : <span className="highlight-text">15 นาที</span></p>
         </div>

         {/* Timer Widget */}
         <div className="timer-container">
               <span className="timer-label">เวลาที่เหลือ</span>
               <div className="timer-right-side">
                   <div className={`time-badge bg-${timerState} ${timerState === 'critical' ? 'blink-active' : ''}`}>
                       {formatTime(timeLeft)}
                   </div>
                   <span 
                     className={`warning-message ${
                       timerState === 'normal' 
                         ? 'text-invisible' 
                         : (timerState === 'warning' ? 'text-warning' : 'text-critical')
                     }`}
                   >
                       {timerState === 'normal' ? 'Placeholder' : (timerState === 'warning' ? 'รีบพิจารณาการลงทุน !' : 'รีบตัดสินใจและกดยืนยัน !')}
                   </span>
               </div>
           </div>
      </div>

      {/* ✅ SECTION 2: ส่วนเนื้อหาหลัก */}
      <div className="main-layout layout-content">
        
        {/* --- Left Column (ซ้าย) --- */}
        <div className="left-column">
           
           {/* Green Card Premium */}
           <div 
             className="card" 
             style={{ 
               backgroundColor: '#2E7D32',
               borderRadius: '16px',
               padding: '30px',
               color: 'white',
               boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)',
               marginBottom: '30px'
             }}
           >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                 <div style={{ 
                    width: '48px', height: '48px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 
                 }}>
                    <Building size={24} color="white" />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
                        ข้อมูลพื้นฐานโรงแรม
                    </h3>
                    <span style={{ fontSize: '0.9rem', opacity: 0.9, color: 'white', marginTop: '2px' }}>
                        ทรัพย์สินและโครงสร้างหลัก
                    </span>
                 </div>
              </div>
              
              <div className="green-info-grid">
                 <div className="green-info-item" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="g-icon"><Home size={28} color="white"/></div>
                    <div>
                        <div className="g-label" style={{color: 'rgba(255,255,255,0.8)'}}>พื้นที่โครงการ</div>
                        <div className="g-value" style={{color: 'white'}}>15 ไร่</div>
                        <div className="g-sub" style={{color: 'rgba(255,255,255,0.7)'}}>พื้นที่อาคาร 14,400 ตร.ม.</div>
                    </div>
                 </div>
                 <div className="green-info-item" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="g-icon"><MapPin size={28} color="white"/></div>
                    <div>
                        <div className="g-label" style={{color: 'rgba(255,255,255,0.8)'}}>พื้นที่สวน</div>
                        <div className="g-value" style={{color: 'white'}}>3 ไร่</div>
                        <div className="g-sub" style={{color: 'rgba(255,255,255,0.7)'}}>ภูมิทัศน์และสวน</div>
                    </div>
                 </div>
                 <div className="green-info-item" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="g-icon"><Building size={28} color="white"/></div>
                    <div>
                        <div className="g-label" style={{color: 'rgba(255,255,255,0.8)'}}>อาคารทั้งหมด</div>
                        <div className="g-value" style={{color: 'white'}}>4 อาคาร</div>
                        <div className="g-sub">-</div>
                    </div>
                 </div>
                 <div className="green-info-item" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="g-icon"><Car size={28} color="white"/></div>
                    <div>
                        <div className="g-label" style={{color: 'rgba(255,255,255,0.8)'}}>ที่จอดรถ</div>
                        <div className="g-value" style={{color: 'white'}}>350 คัน</div>
                        <div className="g-sub">-</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Room Section */}
           <div 
             className="section-container" 
             style={{ 
               background: 'white', 
               borderRadius: '16px', 
               padding: '30px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
               marginBottom: '30px'
             }}
           >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                 <div style={{ 
                    width: '42px', height: '42px', 
                    background: '#E0F2F1', 
                    borderRadius: '10px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <BedDouble size={24} color="#00695C"/>
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>ห้องพัก</h3>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>ทั้งหมด 110 ห้อง แบ่งเป็น 5 ประเภท</span>
                 </div>
              </div>

              <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: '1fr 1fr', 
                 gap: '15px', 
                 marginBottom: '30px' 
              }}>
                 {roomTypes.map((room, idx) => (
                    <div key={idx} style={{ 
                       border: '1px solid #eee', 
                       borderRadius: '12px', 
                       padding: '15px 20px',
                       display: 'flex', 
                       justifyContent: 'space-between', 
                       alignItems: 'center',
                       background: '#fff'
                    }}>
                       <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#333' }}>{room.name}</h4>
                          <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: '#888' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <BedDouble size={14}/> {room.totalSize}
                             </span>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Home size={14}/> {room.size}
                             </span>
                          </div>
                       </div>
                       <div style={{ 
                          background: '#E8F5E9', 
                          borderRadius: '10px',
                          padding: '5px 15px',
                          textAlign: 'center',
                          minWidth: '60px'
                       }}>
                          <strong style={{ display: 'block', fontSize: '1.2rem', color: '#2E7D32', lineHeight: 1 }}>
                             {room.count}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#2E7D32' }}>ห้อง</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                 <div style={{ flex: 1, background: '#D4EFDF', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '5px' }}>รวมทั้งหมด</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1E8449', marginBottom: '2px' }}>110</strong>
                    <span style={{ fontSize: '0.85rem', color: '#444' }}>ห้องพัก</span>
                 </div>
                 <div style={{ flex: 1, background: '#FFF9C4', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#795548', marginBottom: '5px' }}>ค่าเฉลี่ย/คืน</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#F57F17', marginBottom: '2px' }}>3,000</strong>
                    <span style={{ fontSize: '0.85rem', color: '#5D4037' }}>บาท</span>
                 </div>
                 <div style={{ flex: 1, background: '#B2EBF2', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#006064', marginBottom: '5px' }}>อัตราเข้าพักไตรมาสที่ 0</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#006064', marginBottom: '2px' }}>78%</strong>
                 </div>
              </div>
           </div>

           {/* Staff Section */}
           <div 
             className="section-container" 
             style={{ 
               background: 'white', 
               borderRadius: '24px', 
               padding: '30px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
               marginBottom: '30px',
               border: '1px solid #f0f0f0'
             }}
           >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                 <div style={{ 
                    width: '48px', height: '48px', 
                    background: '#FFF8E1', 
                    borderRadius: '14px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <Users size={24} color="#FBC02D"/>
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#222', fontWeight: 700 }}>พนักงาน</h3>
                    <span style={{ fontSize: '0.9rem', color: '#999' }}>ทั้งหมด 56 คน แบ่งเป็น 10 ฝ่าย</span>
                 </div>
              </div>

              {/* Banner */}
              <div style={{
                  background: 'linear-gradient(90deg, #E8F5E9 0%, #D1F2EB 50%, #B2DFDB 100%)', 
                  borderRadius: '16px',
                  padding: '20px 25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '25px',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)' 
              }}>
                  <div style={{ 
                      background: 'white', 
                      width: '50px', height: '50px',
                      borderRadius: '14px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}>
                     <Users size={24} color="#00897B"/>
                  </div>
                  <div>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#757575', marginBottom: '2px' }}>พนักงานทั้งหมด</span>
                      <strong style={{ fontSize: '1.8rem', color: '#2E7D32', fontWeight: 700 }}>59 คน</strong>
                  </div>
              </div>

              {/* Grid 3 Columns */}
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '15px'
              }}>
                  {staffRoles.map((role, idx) => (
                      <div key={idx} style={{
                          border: '1px solid #eee',
                          borderRadius: '16px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          background: '#fff',
                          gap: '10px'
                      }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                  width: '36px', height: '36px', 
                                  background: '#E0F2F1', 
                                  borderRadius: '10px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#00695C'
                              }}>
                                  <span style={{ fontSize: '1.1rem' }}>{role.icon}</span> 
                              </div>
                              <span style={{ fontSize: '0.9rem', color: '#444', fontWeight: 600 }}>{role.name}</span>
                          </div>
                          
                          <div style={{ paddingLeft: '48px' }}> 
                              <strong style={{ fontSize: '1.1rem', color: '#2E7D32' }}>{role.count}</strong>
                              <span style={{ fontSize: '0.85rem', color: '#888', marginLeft: '5px' }}>คน</span>
                          </div>
                      </div>
                  ))}
              </div>
           </div>

          {/* ✅ Facilities Section (แก้ไขตามรูป: Grid 4 ช่อง, ดีไซน์กึ่งกลาง) */}
           <div 
             className="section-container" 
             style={{ 
               background: 'white', 
               borderRadius: '24px', 
               padding: '30px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
               marginBottom: '30px',
               border: '1px solid #f0f0f0'
             }}
           >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                 <div style={{ 
                    width: '48px', height: '48px', 
                    background: '#E0F7FA', // สีฟ้าอ่อนๆ (Cyan-50)
                    borderRadius: '14px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <Sparkles size={24} color="#006064"/> {/* ไอคอนวิบวับตามธีม */}
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#222', fontWeight: 700 }}>สิ่งอำนวยความสะดวก</h3>
                    <span style={{ fontSize: '0.9rem', color: '#999' }}>บริการและพื้นที่ต่างๆ</span>
                 </div>
              </div>

              {/* Grid 4 Columns */}
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)', // ✅ แบ่ง 4 คอลัมน์เท่ากัน
                  gap: '15px'
              }}>
                 {facilities.map((fac, idx) => (
                      <div key={idx} style={{
                          border: '1px solid #eee',
                          borderRadius: '16px',
                          padding: '25px 15px', // เพิ่ม padding บนล่างให้ดูโปร่ง
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center', // ✅ จัดกึ่งกลาง
                          textAlign: 'center',
                          background: '#fff',
                          gap: '12px'
                      }}>
                          {/* Icon Circle */}
                          <div style={{
                              width: '45px', height: '45px',
                              background: '#E8F5E9', // พื้นหลังเขียวอ่อน
                              borderRadius: '12px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#2E7D32', // สีไอคอนเขียวเข้ม
                              marginBottom: '5px'
                          }}>
                              {fac.icon}
                          </div>

                          {/* Text Info */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ fontSize: '0.95rem', color: '#333' }}>{fac.name}</strong>
                              <span style={{ fontSize: '0.8rem', color: '#888' }}>{fac.info}</span>
                          </div>
                      </div>
                 ))}
              </div>
           </div>

        </div>

        {/* --- Right Column (ขวา) --- */}
        <div className="right-column">
           
           {/* 1. Gold Card */}
           <div 
             className="card" 
             style={{ 
               backgroundColor: '#DFC98A',
               borderRadius: '16px',
               padding: '25px',
               color: '#5D4037',
               boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
               border: 'none',
               marginBottom: '30px'
             }}
           >
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                   <div style={{ 
                       width: '36px', height: '36px', 
                       border: '1px solid #5D4037', borderRadius: '8px',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       opacity: 0.6
                   }}>
                       <Wallet size={20} color="#5D4037"/>
                   </div>
                   <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, opacity: 0.9 }}>ภาพรวมการเงิน</h3>
               </div>

               <div style={{ 
                   backgroundColor: 'rgba(255,255,255,0.25)',
                   borderRadius: '12px',
                   padding: '15px 20px',
                   marginBottom: '20px'
               }}>
                   <span style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', opacity: 0.8 }}>
                       เงินสดปัจจุบัน
                   </span>
                   <strong style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                       10M
                   </strong>
               </div>

               <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                   <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', opacity: 0.9 }}>
                       <span>เงินทุนเริ่มต้น</span>
                       <span style={{ fontWeight: 600 }}>10M</span>
                   </li>
                   <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.9 }}>
                       <span>มูลค่าอสังหาฯ</span>
                   </li>
                   <li style={{ 
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       backgroundColor: 'rgba(255,255,255,0.25)',
                       borderRadius: '8px',
                       padding: '8px 12px',
                       margin: '5px -12px 10px -12px'
                   }}>
                       <span style={{ fontWeight: 600 }}>มูลค่าทรัพย์สินรวม</span>
                       <span style={{ fontWeight: 800, fontSize: '1rem' }}>220M</span>
                   </li>
                   <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', opacity: 0.9 }}>
                       <span>รายได้สูงสุดต่อเดือน</span>
                       <span style={{ fontWeight: 600 }}>6.69M</span>
                   </li>
                   <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.9 }}>
                       <span>ต้นทุนสูงสุดเดือน</span>
                       <span style={{ fontWeight: 600 }}>3.15M</span>
                   </li>
                   <li style={{ 
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       backgroundColor: 'rgba(255,255,255,0.25)',
                       borderRadius: '8px',
                       padding: '8px 12px',
                       margin: '5px -12px 0 -12px'
                   }}>
                       <span style={{ fontWeight: 600 }}>กำไรขั้นต้นต่อเดือน (ประมาณ)</span>
                       <span style={{ fontWeight: 800, fontSize: '1rem' }}>3.54M</span>
                   </li>
               </ul>
           </div>

           {/* 2. Action Card */}
           <div className="card" style={{ 
               background: 'white', 
               borderRadius: '24px',
               padding: '30px 25px', 
               boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
               marginBottom: '30px', 
               textAlign: 'center' 
           }}>
                <p style={{ 
                    color: '#D32F2F', 
                    fontWeight: '700', 
                    fontSize: '1rem', 
                    margin: '0 0 20px 0',
                    textShadow: '0 1px 1px rgba(0,0,0,0.05)'
                }}>
                    กรุณากดดูข้อมูลเบื้องต้นก่อนการตัดสินใจ
                </p>

                <button 
                    onClick={() => navigate('/next-step')}
                    style={{
                        backgroundColor: '#388E3C',
                        color: 'white', 
                        border: 'none',
                        borderRadius: '12px', 
                        padding: '12px 20px', 
                        width: '100%',
                        fontSize: '1.3rem', 
                        fontWeight: '700', 
                        cursor: 'pointer',
                        boxShadow: '0 6px 0 #1B5E20, 0 10px 10px rgba(0,0,0,0.15)',
                        transition: 'all 0.1s ease',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        fontFamily: 'inherit'
                    }}
                    onMouseDown={(e) => {
                        e.target.style.transform = 'translateY(4px)';
                        e.target.style.boxShadow = '0 2px 0 #1B5E20, 0 4px 4px rgba(0,0,0,0.1)';
                    }}
                    onMouseUp={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 0 #1B5E20, 0 10px 10px rgba(0,0,0,0.15)';
                    }}
                >
                    ข้อมูลเพิ่มเติม
                </button>
           </div>

           {/* 3. ✅ Progress Card (Updated: ใช้ Flexbox และ gap 12px แทน Grid) */}
           <div 
             className="card" 
             style={{ 
               background: 'white', 
               borderRadius: '24px', 
               padding: '30px', 
               boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
               marginBottom: '30px',
               border: '1px solid #f9f9f9'
             }}
           >
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                   <div style={{ 
                       width: '45px', height: '45px', 
                       background: '#E0F2F1', 
                       borderRadius: '12px', 
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       flexShrink: 0
                   }}>
                       <Calendar size={24} color="#00695C"/>
                   </div>
                   <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#222', fontWeight: 700 }}>ความคืบหน้า</h3>
               </div>

               <div style={{ marginBottom: '5px' }}>
                   <span style={{ fontSize: '0.85rem', color: '#757575', display: 'block', marginBottom: '5px' }}>รอบปัจจุบัน</span>
                   <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                       <span style={{ fontSize: '2.8rem', fontWeight: 700, color: '#2E7D32', lineHeight: 1 }}>1</span>
                       <span style={{ fontSize: '1.4rem', color: '#616161', fontWeight: 500 }}>/ 12</span>
                   </div>
               </div>

               <div style={{ marginBottom: '25px', marginTop: '15px' }}>
                   <div style={{ 
                       width: '100%', height: '8px', 
                       background: '#EEEEEE', 
                       borderRadius: '10px', 
                       overflow: 'hidden',
                       marginBottom: '8px'
                   }}>
                       <div style={{ width: '8%', height: '100%', background: '#388E3C', borderRadius: '10px' }}></div> 
                   </div>
                   <span style={{ fontSize: '0.75rem', color: '#9E9E9E' }}>8% เสร็จสมบูรณ์</span>
               </div>

               <div style={{ height: '1px', background: '#F0F0F0', marginBottom: '25px' }}></div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   
                   {/* Item 1: เวลา */}
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                       <Clock size={20} color="#388E3C" style={{ marginTop: '2px', flexShrink: 0 }} />
                       <div>
                           <span style={{ display: 'block', fontSize: '0.8rem', color: '#9E9E9E', marginBottom: '2px', lineHeight: 1.2 }}>เวลาในการตัดสินใจ</span>
                           <strong style={{ fontSize: '1rem', color: '#388E3C', fontWeight: 700 }}>15 นาที</strong>
                       </div>
                   </div>

                   {/* Item 2: โรงแรม */}
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                       <Award size={20} color="#D4AF37" style={{ marginTop: '2px', flexShrink: 0 }} />
                       <div>
                           <span style={{ display: 'block', fontSize: '0.8rem', color: '#9E9E9E', marginBottom: '2px', lineHeight: 1.2 }}>จำนวนโรงแรมทั้งหมด</span>
                           <strong style={{ fontSize: '1rem', color: '#424242', fontWeight: 600 }}>10 โรงแรม</strong>
                       </div>
                   </div>

                   {/* Item 3: กลุ่มตลาด */}
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                       <Luggage size={20} color="#388E3C" style={{ marginTop: '2px', flexShrink: 0 }} />
                       <div>
                           <span style={{ display: 'block', fontSize: '0.8rem', color: '#9E9E9E', marginBottom: '2px', lineHeight: 1.2 }}>กลุ่มตลาด</span>
                           <strong style={{ fontSize: '1rem', color: '#424242', fontWeight: 600 }}>นักท่องเที่ยวและคนในพื้นที่</strong>
                       </div>
                   </div>

               </div>
           </div>

           {/* 4. Team Card */}
           <div 
             className="card" 
             style={{ 
               background: 'white', 
               borderRadius: '16px', 
               padding: '25px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
             }}
           >
               {/* Header */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                   <div style={{ 
                       width: '42px', height: '42px', 
                       background: '#E8F5E9', 
                       borderRadius: '10px', 
                       display: 'flex', alignItems: 'center', justifyContent: 'center' 
                   }}>
                      <Users size={24} color="#2E7D32"/> 
                   </div>
                   <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#333' }}>ทีมของคุณ</h3>
               </div>

               <div className="team-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   
                   <div style={{ 
                       background: '#F9FAFB', 
                       borderRadius: '12px', 
                       padding: '15px 20px' 
                   }}>
                       <span style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>ชื่อทีม</span>
                       <strong style={{ fontSize: '1.2rem', color: '#333' }}>ทีมพญานาค</strong>
                   </div>

                   <div style={{ 
                       background: 'linear-gradient(90deg, #D4EFDF 0%, #E9F7EF 100%)', 
                       borderRadius: '12px', 
                       padding: '15px 20px' 
                   }}>
                       <span style={{ display: 'block', fontSize: '0.85rem', color: '#5D6D7E', marginBottom: '5px' }}>สมาชิกในทีม</span>
                       <strong style={{ fontSize: '1.6rem', color: '#2E7D32' }}>4 คน</strong>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
                       {
                        (() => {
                            const roleBadgeStyle = {
                                background: 'white',          
                                color: '#2E7D32',             
                                border: '1px solid #2E7D32',  
                                width: '200px',               
                                height: '38px',               
                                borderRadius: '8px', 
                                fontSize: '0.85rem', 
                                fontWeight: 500,
                                display: 'flex',          
                                justifyContent: 'center', 
                                alignItems: 'center',     
                                whiteSpace: 'nowrap'      
                            };

                            return (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '12px 15px', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>คุณ</span>
                                        <span style={roleBadgeStyle}>ประธานเจ้าหน้าที่บริหาร</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '12px 15px', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>John</span>
                                        <span style={roleBadgeStyle}>ฝ่ายบัญชีและการเงิน</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '12px 15px', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>Ptest</span>
                                        <span style={roleBadgeStyle}>ฝ่ายการตลาด</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '12px 15px', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>San</span>
                                        <span style={roleBadgeStyle}>ฝ่ายทรัพยากรบุคคล</span>
                                    </div>
                                </>
                            );
                        })()
                       }
                   </div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
}

export default HomePage;