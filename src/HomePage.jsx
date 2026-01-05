import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, MapPin, Home, Building, Car, 
  BedDouble, Users, Briefcase, Clock,
  Wallet, Calendar, Award, Luggage, 
  Trees, Sparkles,
  Wrench, ShieldCheck, Monitor, User, CircleDollarSign, Megaphone
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

  const getTimerDigits = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return { m, s };
  };

  const getTimerState = () => {
    if (timeLeft <= 60) return 'critical'; 
    if (timeLeft <= 120) return 'warning'; 
    return 'normal';
  };

  const timerState = getTimerState();
  const { m, s } = getTimerDigits(); 

  // --- Mock Data ---
  const roomTypes = [
    { name: 'ห้อง สแตนดาร์ด เอ', size: '32 ตร.ม.', count: 40, totalSize: '40 ห้อง' },
    { name: 'ห้อง สแตนดาร์ด บี (วิวภูเขา)', size: '40 ตร.ม.', count: 30, totalSize: '30 ห้อง' },
    { name: 'ห้อง ดีลักซ์', size: '60 ตร.ม.', count: 20, totalSize: '20 ห้อง' },
    { name: 'ห้อง สวีท สำหรับ 2 ท่าน', size: '80 ตร.ม.', count: 10, totalSize: '10 ห้อง' },
    { name: 'ห้อง สวีท สำหรับ 3 ท่าน', size: '90 ตร.ม.', count: 10, totalSize: '10 ห้อง' },
  ];

  const staffRoles = [
    { name: 'แม่บ้านและทำความสะอาด', count: 19, icon: <Sparkles size={24} color="#2E7D32"/> },
    { name: 'ฝ่ายบริการต้อนรับ', count: 11, icon: <User size={24} color="#2E7D32"/> },  
    { name: 'ฝ่ายไอที (IT)', count: 2, icon: <Monitor size={24} color="#2E7D32"/> },
    { name: 'คนขับรถทั่วไป', count: 2, icon: <Car size={24} color="#2E7D32"/> },
    { name: 'พนักงานดูแลสวนทั่วไป', count: 2, icon: <Trees size={24} color="#2E7D32"/> },
    { name: 'ผู้รักษาความปลอดภัย', count: 6, icon: <ShieldCheck size={24} color="#2E7D32"/> },
    { name: 'ฝ่ายขายและการตลาด', count: 4, icon: <Megaphone size={24} color="#2E7D32"/> },
    { name: 'ฝ่ายบัญชีและการเงิน', count: 6, icon: <CircleDollarSign size={24} color="#2E7D32"/> },
    { name: 'ฝ่ายทรัพยากรบุคคล (HR)', count: 3, icon: <Users size={24} color="#2E7D32"/> },
    { name: 'วิศวกรรม/ซ่อมบำรุง', count: 4, icon: <Wrench size={24} color="#2E7D32"/> }, 
  ];

  const facilities = [
    { name: 'ห้องประชุม', info: 'จัดสัมนาได้ไม่เกิน 200 คน', icon: <Briefcase size={24}/> },
    { name: 'สวนและพื้นที่พักผ่อน', info: 'พื้นที่ 3 ไร่', icon: <Trees size={24}/> },
    { name: 'ลานจอดรถ', info: '350 คัน', icon: <Car size={24}/> }, 
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

      {/* SECTION 1: ส่วนหัว */}
      <div className="main-layout layout-header">
         <div className="welcome-text">
            <h3>ยินดีต้อนรับสู่ การบริหารจัดการโรงแรมในเครือของคุณ</h3>
            <p>คุณกำลังบริหาร <span className="highlight-text">โรงแรม สวัสดี</span> โรงแรมพรีเมี่ยมสไตล์ล้านนา ในการแข่งขันกลุ่มโรงแรมพรีเมี่ยม เวลาในการตัดสินใจครั้งแรก : <span className="highlight-text">15 นาที</span></p>
         </div>

         <div className={`timer-widget-modern status-${timerState}`}>
               <div className="timer-icon-col">
                   <Clock size={28} className="timer-icon-svg" />
                   <span className="timer-label-sm">เวลาที่เหลือ</span>
               </div>
               
               <div className="timer-digits-group">
                   <div className="digit-box">{m}</div>
                   <div className="colon-separator">:</div>
                   <div className="digit-box">{s}</div>
               </div>
         </div>
      </div>

      <div className="main-layout" style={{ justifyContent: 'flex-end', display: 'flex', marginTop: '-15px' }}>
            <span className={`warning-message ${timerState === 'normal' ? 'text-invisible' : (timerState === 'warning' ? 'text-warning' : 'text-critical')}`}>
                {timerState === 'normal' ? '...' : (timerState === 'warning' ? '⚠️ รีบพิจารณาการลงทุน !' : '🔥 รีบตัดสินใจและกดยืนยัน !')}
            </span>
      </div>

      {/* ✅ SECTION 2: ส่วนเนื้อหาหลัก (แบ่งซ้าย-ขวา) */}
      <div className="main-layout layout-content">
        
        {/* --- Left Column (ซ้าย) --- */}
        <div className="left-column">
           
           {/* Green Card Premium */}
           <div 
             className="card" 
             style={{ 
               backgroundColor: '#2E7D32',
               borderRadius: '16px',
               padding: '15px 15px', 
               color: 'white',
               boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)',
               display: 'flex',
               alignItems: 'center', 
               gap: '40px'          
             }}
           >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                 <div style={{ 
                    width: '48px', height: '48px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 
                 }}>
                    <Building size={24} color="white" />
                 </div>
                 <div className="green-header-text">
                    <h3>ข้อมูลพื้นฐานโรงแรม</h3>
                    <span>ทรัพย์สินและโครงสร้างหลัก</span>
                </div>
              </div>
              
              <div className="green-info-grid" style={{ flex: 1 }}>
                 <div className="green-info-item">
                    <div className="g-icon"><Home size={24} color="white"/></div>
                    <div className="g-text-content">
                        <div className="g-label">พื้นที่โครงการ</div>
                        <div className="g-value">15 ไร่</div>
                    </div>
                 </div>
                 <div className="green-info-item">
                    <div className="g-icon"><MapPin size={24} color="white"/></div>
                    <div className="g-text-content">
                        <div className="g-label">พื้นที่สวน</div>
                        <div className="g-value">3 ไร่</div>
                    </div>
                 </div>
                 <div className="green-info-item">
                    <div className="g-icon"><Building size={24} color="white"/></div>
                    <div className="g-text-content">
                        <div className="g-label">อาคารทั้งหมด</div>
                        <div className="g-value">4 อาคาร</div>
                    </div>
                 </div>
                 <div className="green-info-item">
                    <div className="g-icon"><Car size={24} color="white"/></div>
                    <div className="g-text-content">
                        <div className="g-label">ที่จอดรถ</div>
                        <div className="g-value">350 คัน</div>
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
                 gridTemplateColumns: 'repeat(3, 1fr)', 
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
                       background: '#F3F4F6'
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
                          background: '#C8E6C9', 
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

              <div style={{ display: 'flex', gap: '15px' }}>
                 <div style={{ flex: 1, background: '#D4EFDF', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '2px' }}>รวมทั้งหมด</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', color: '#1E8449', lineHeight: 1, marginBottom: '2px' }}>110</strong>
                    <span style={{ fontSize: '0.75rem', color: '#444' }}>ห้องพัก</span>
                 </div>
                 <div style={{ flex: 1, background: '#FFF9C4', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#795548', marginBottom: '2px' }}>ค่าเฉลี่ย/คืน</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', color: '#F57F17', lineHeight: 1, marginBottom: '2px' }}>3,000</strong>
                    <span style={{ fontSize: '0.75rem', color: '#5D4037' }}>บาท</span>
                 </div>
                 <div style={{ flex: 1, background: '#B2EBF2', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#006064', marginBottom: '2px' }}>อัตราเข้าพักไตรมาสที่ 0</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', color: '#006064', lineHeight: 1 }}>78%</strong>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '25px' }}>
                 <div style={{ 
                    width: '48px', height: '48px', 
                    background: '#FDF7E8', 
                    borderRadius: '14px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <Users size={24} color="#D4A017"/>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#222', fontWeight: 700 }}>พนักงาน</h3>
                    <span style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>ทั้งหมด 59 คน แบ่งเป็น 10 ฝ่าย</span>
                 </div>
              </div>

              <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '10px'
              }}>
                  {staffRoles.map((role, idx) => (
                      <div key={idx} style={{
                          border: '1px solid #eee',
                          borderRadius: '12px',
                          padding: '15px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: '#F9FAFB'
                      }}>
                          <div style={{ 
                              width: '42px', height: '42px', 
                              background: '#C8E6C9',    
                              borderRadius: '10px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#2E7D32',
                              flexShrink: 0
                          }}>
                              <span style={{ fontSize: '1.2rem' }}>{role.icon}</span> 
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: 600, marginBottom: '2px' }}>
                                  {role.name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                  <strong style={{ fontSize: '1.4rem', color: '#2E7D32', lineHeight: 1 }}>
                                      {role.count}
                                  </strong>
                                  <span style={{ fontSize: '0.8rem', color: '#888' }}>คน</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        
        {/* ✅ ปิด left-column ตรงนี้ */}
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
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
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
               }}>
                   <span style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', opacity: 0.8 }}>
                       เงินสดปัจจุบัน
                   </span>
                   <strong style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                       10M
                   </strong>
               </div>

               <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                   <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.9 }}>
                       <span>มูลค่าอสังหาฯ</span>
                       <span style={{ fontWeight: 600 }}>10M</span>
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

           {/* 3. Team Card */}
           <div 
             className="card" 
             style={{ 
               background: 'white', 
               borderRadius: '16px', 
               padding: '15px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
             }}
           >
               {/* Header */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ 
                           width: '40px', height: '40px', 
                           background: '#E8F5E9', 
                           borderRadius: '10px', 
                           display: 'flex', alignItems: 'center', justifyContent: 'center' 
                       }}>
                          <Users size={22} color="#2E7D32"/> 
                       </div>
                       <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#222', fontWeight: 700 }}>ทีมของคุณ</h3>
                   </div>
                   
                   <button style={{
                       background: '#2E7D32',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       padding: '6px 12px',
                       fontSize: '0.85rem',
                       fontWeight: 600,
                       cursor: 'pointer',
                       boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)'
                   }}>
                       จัดการทีม
                   </button>
               </div>

               <div className="team-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ 
                       background: '#F9FAFB', 
                       borderRadius: '12px', 
                       padding: '10px 15px' 
                   }}>
                       <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>ชื่อทีม</span>
                       <strong style={{ fontSize: '1.0rem', color: '#333' }}>ทีมพญานาค</strong>
                   </div>

                   <div style={{ 
                       background: 'linear-gradient(90deg, #D6EAF8 0%, #D5F5E3 100%)', 
                       borderRadius: '12px', 
                       padding: '10px 15px', 
                       marginBottom: '5px'
                   }}>
                       <span style={{ display: 'block', fontSize: '0.8rem', color: '#5D6D7E', marginBottom: '4px' }}>สมาชิกในทีม</span>
                       <strong style={{ fontSize: '1.0rem', color: '#2E7D32' }}>4 คน</strong>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                       {
                        (() => {
                            const roleBadgeStyle = {
                                background: 'white',          
                                color: '#2E7D32',             
                                border: '1px solid #2E7D32',  
                                width: '180px',               
                                height: '32px',               
                                borderRadius: '8px', 
                                fontSize: '0.8rem', 
                                fontWeight: 500,
                                display: 'flex',              
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap'      
                            };

                            const rowStyle = {
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: '#F9FAFB', 
                                padding: '12px 20px',        
                                borderRadius: '10px'
                            };

                            return (
                                <>
                                    <div style={rowStyle}>
                                        <strong style={{ fontSize: '0.9rem', color: '#333' }}>คุณ</strong>
                                        <div style={roleBadgeStyle}>ประธานเจ้าหน้าที่บริหาร</div>
                                    </div>

                                    <div style={rowStyle}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>John</span>
                                        <div style={roleBadgeStyle}>ฝ่ายบัญชีและการเงิน</div>
                                    </div>

                                    <div style={rowStyle}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>Ptest</span>
                                        <div style={roleBadgeStyle}>ฝ่ายการตลาด</div>
                                    </div>

                                    <div style={rowStyle}>
                                        <span style={{ fontSize: '0.9rem', color: '#555' }}>San</span>
                                        <div style={roleBadgeStyle}>ฝ่ายทรัพยากรบุคคล</div>
                                    </div>
                                </>
                            );
                        })()
                       }
                   </div>
               </div>
           </div>
        
        {/* ✅ ปิด right-column ตรงนี้ */}
        </div>

      {/* ✅ ปิด layout-content ตรงนี้ */}
      </div>

      {/* ✅ SECTION 3: สิ่งอำนวยความสะดวก (อยู่นอกสุดจริงๆ แล้ว!) */}
      <div className="main-layout" style={{ marginBottom: '50px' }}>
           <div 
             className="section-container" 
             style={{ 
               background: 'white', 
               borderRadius: '24px', 
               padding: '20px', 
               boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
               border: '1px solid #f0f0f0',
               width: '100%',     /* สั่งให้กว้างเต็มที่ */
               boxSizing: 'border-box'
             }}
           >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                 <div style={{ 
                    width: '40px', height: '40px', 
                    background: '#E0F7FA', 
                    borderRadius: '14px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                 }}>
                    <Sparkles size={24} color="#006064"/> 
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#222', fontWeight: 700 }}>สิ่งอำนวยความสะดวก</h3>
                    <span style={{ fontSize: '0.9rem', color: '#999' }}>บริการและพื้นที่ต่างๆ</span>
                 </div>
              </div>

              {/* Grid 4 Columns (จะขยายเต็มจอสวยงาม) */}
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '10px' 
              }}>
                 {facilities.map((fac, idx) => (
                      <div key={idx} style={{
                          border: '1px solid #eee',
                          borderRadius: '16px',
                          padding: '20px 15px', 
                          display: 'flex',
                          alignItems: 'center', 
                          textAlign: 'left',
                          background: '#F9FAFB',
                          gap: '15px'
                      }}>
                          <div style={{
                              width: '50px', height: '50px',
                              background: '#C8E6C9', 
                              borderRadius: '14px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#1B5E20', 
                              marginBottom: '5px'
                          }}>
                              {fac.icon}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ fontSize: '1rem', color: '#333' }}>{fac.name}</strong>
                              <span style={{ fontSize: '0.85rem', color: '#888' }}>{fac.info}</span>
                          </div>
                      </div>
                 ))}
              </div>
           </div>
      </div>
      
    </div>
  );
}

export default HomePage;