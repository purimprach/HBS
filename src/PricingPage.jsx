import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DecisionPage.css';
import { 
  Banknote, Bed, Users, Check, 
  PieChart, Tag, Megaphone, Wrench,
  Plus, Minus, TrendingUp, TrendingDown
} from 'lucide-react';

const TOTAL_BUDGET = 10000000; 

const PricingPage = () => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false); 

  const [rooms, setRooms] = useState([
    { id: 1, name: 'ห้องมาตรฐาน A (Standard A)', price: 800, prevPrice: 800, min: 600, max: 1000, step: 100, count: 40, color: '#00C49F' },
    { id: 2, name: 'ห้องมาตรฐาน B (Standard B)', price: 1200, prevPrice: 1200, min: 900, max: 1500, step: 100, count: 30, color: '#14B8A6' },
    { id: 3, name: 'ห้องดีลักซ์ (Deluxe)', price: 2500, prevPrice: 2500, min: 1800, max: 3200, step: 100, count: 20, color: '#FFBB28' },
    { id: 4, name: 'ห้องสวีท (Suite)', price: 4500, prevPrice: 4500, min: 3200, max: 5800, step: 100, count: 10, color: '#4287f5' },
    { id: 5, name: 'ห้องสวีทแบบครอบครัว (Family)', price: 6000, prevPrice: 6000, min: 4200, max: 7800, step: 100, count: 10, color: '#A020F0' }
  ]);

  const adjustPrice = (id, amount) => {
    if (isSaved) return;
    setRooms(prev => prev.map(room => {
      if (room.id === id) {
        const newPrice = room.price + amount;
        if (newPrice >= room.min && newPrice <= room.max) return { ...room, price: newPrice };
      }
      return room;
    }));
  };

  const setPriceExact = (id, value) => {
    if (isSaved) return;
    setRooms(prev => prev.map(room => {
      if (room.id === id) return { ...room, price: value };
      return room;
    }));
  };

  const handleSave = () => {
    if (window.confirm('ยืนยันการบันทึกราคาห้องพัก?')) setIsSaved(true);
  };

  const formatMoney = (num) => num.toLocaleString();

  const getChangePercent = (current, prev) => {
    if (prev === 0) return 0;
    return ((current - prev) / prev) * 100;
  };

  return (
    <div className="decision-page">
      
      {/* 1. Header Stats (แก้ไขให้เหมือนรูป) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">จำนวนห้องที่ใช้งานได้</span>
             <div className="stat-icon-box"><Bed size={20} strokeWidth={2} /></div>
          </div>
          <div className="stat-value">110</div>
          <div className="stat-sub">สภาพห้อง : 100%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">ผู้เข้าพักเฉลี่ยไตรมาสที่แล้ว</span>
             <div className="stat-icon-box"><Users size={20} strokeWidth={2} /></div>
          </div>
          <div className="stat-value">72%</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">รายได้ไตรมาสที่แล้ว</span>
             <div className="stat-icon-box"><span style={{fontWeight:'bold', fontSize:'1.2rem'}}>฿</span></div>
          </div>
          <div className="stat-value">4,816,800</div>
          <div className="stat-sub">สถานะ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">ความต้องการในการตลาด</span>
             <div className="stat-icon-box"><Megaphone size={18} strokeWidth={2} /></div>
          </div>
          <div className="stat-value" style={{fontSize: '1.6rem'}}>ระดับกลาง</div>
          <div className="stat-sub">ในช่วงไตรมาสที่ 1</div>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="decision-tabs">
        <button className="tab-btn" onClick={() => navigate('/decision')}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>
        <button className="tab-btn active">
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        <button className="tab-btn" onClick={() => alert('กำลังพัฒนา')}>
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>
        <button className="tab-btn" onClick={() => alert('กำลังพัฒนา')}>
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>
        <button className="tab-btn" onClick={() => alert('กำลังพัฒนา')}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        <button className="tab-btn" onClick={() => alert('กำลังพัฒนา')}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* 3. Main Content */}
      <div className="decision-content">
          <div className="pricing-wrapper" style={{ gridColumn: '1 / -1' }}>
              
              <div className="pricing-page-header">
                <h2>กำหนดราคาห้องพัก</h2>
                <p>กำหนดราคาห้องพักให้เหมาะสมกับตลาดและกลยุทธ์ของคุณ</p>
              </div>

              <div className="pricing-list">
                {rooms.map((room) => {
                  const percentChange = getChangePercent(room.price, room.prevPrice);
                  const isUp = percentChange > 0;
                  const isDown = percentChange < 0;
                  const range = room.max - room.min;
                  const percent = ((room.price - room.min) / range) * 100;

                  // คำนวณความสูงกราฟ
                  const maxVal = Math.max(room.price, room.prevPrice) * 1.1; 
                  // ✅ แก้ไขชื่อตัวแปรให้ถูกต้องตรงนี้ครับ
                  const hPrev = (room.prevPrice / maxVal) * 100;
                  const hCurr = (room.price / maxVal) * 100;

                  return (
                    <div key={room.id} className="room-pricing-card-custom">
                      
                      {/* ฝั่งซ้าย */}
                      <div className="card-left-section">
                        <div className="room-title-row">
                           <div className="room-icon-wrapper" style={{background: '#F3F4F6', padding:'8px', borderRadius:'8px'}}>
                              <Bed size={24} color="#374151" />
                           </div>
                           <div>
                              <h3 className="room-name">{room.name}</h3>
                              <span className="room-limit-text">
                                (ต่ำสุด {formatMoney(room.min)} - สูงสุด {formatMoney(room.max)})
                              </span>
                           </div>
                           <div className="room-count-capsule">
                              {room.count} ห้อง
                           </div>
                        </div>

                        <div style={{ margin: '0 0 8px 0', padding: '0 8px' }}>
                            <input 
                              type="range" 
                              min={room.min} max={room.max} step={room.step}
                              value={room.price} 
                              onChange={(e) => setPriceExact(room.id, Number(e.target.value))}
                              className="range-slider"
                              style={{ 
                                  '--thumb-color': room.color,
                                  width: '100%',
                                  background: `linear-gradient(to right, ${room.color} 0%, ${room.color} ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`
                              }} 
                              disabled={isSaved}
                            />
                        </div>

                        <div className="price-control-area">
                           <button 
                              className="adjust-btn minus" 
                              onClick={() => adjustPrice(room.id, -room.step)}
                              disabled={isSaved || room.price <= room.min}
                           >
                              <Minus size={18} />
                           </button>
                           
                           <div className="current-price-display">
                              <span className="price-number">{formatMoney(room.price)}</span>
                              <span className="price-unit">บาท</span>
                           </div>

                           <button 
                              className="adjust-btn plus" 
                              onClick={() => adjustPrice(room.id, room.step)}
                              disabled={isSaved || room.price >= room.max}
                           >
                              <Plus size={18} />
                           </button>
                        </div>
                      </div>

                      {/* เส้นกั้นแนวตั้ง */}
                      <div className="vertical-divider"></div>

                      {/* ฝั่งขวา: กราฟแท่งแนวตั้ง */}
                      <div className="card-right-section">
                         <div className="compare-vertical-box">
                            <div className={`diff-badge-floating ${isUp ? 'up' : isDown ? 'down' : 'neutral'}`}>
                               {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : null}
                               <span>
                                 {percentChange === 0 ? 'คงที่' : `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`}
                               </span>
                            </div>

                            <div className="chart-area">
                                <div className="bar-col">
                                   <div className="bar-wrapper">
                                      {/* ✅ แก้ไข: ใช้ hPrev แทน prevHeight */}
                                      <div className="v-bar prev" style={{height: `${hPrev}%`}}></div>
                                   </div>
                                   <span className="bar-label">ก่อนหน้า</span>
                                   <span className="bar-value">{formatMoney(room.prevPrice)}</span>
                                </div>

                                <div className="bar-col">
                                   <div className="bar-wrapper">
                                      {/* ✅ แก้ไข: ใช้ hCurr แทน currHeight */}
                                      <div className={`v-bar curr ${isUp ? 'up' : isDown ? 'down' : 'neutral'}`} 
                                           style={{height: `${hCurr}%`}}></div>
                                   </div>
                                   <span className="bar-label">ปัจจุบัน</span>
                                   <span className={`bar-value ${isUp ? 'text-green' : isDown ? 'text-red' : ''}`}>
                                      {formatMoney(room.price)}
                                   </span>
                                </div>
                            </div>
                         </div>
                      </div>

                    </div>
                  );
                })}
              </div>

          </div>
      </div>

      {/* 4. Bottom Action Bar */}
      <div className="bottom-action-bar">
         <div className="break-even-section">
            <div className="be-title">คาดการณ์รายได้ (เฉลี่ย) โดยคิดแค่ 60% ของจำนวนห้องพัก</div>
            <div className="be-value">
               {formatMoney(rooms.reduce((acc, r) => acc + (r.price * r.count * 30 * 0.6), 0))} บาท
            </div>
         </div>
         <div className="action-section">
            <button className="confirm-btn-large" onClick={handleSave} disabled={isSaved}>
               <div className="btn-icon-circle"><Check size={16} strokeWidth={3} /></div>
               {isSaved ? 'บันทึกเรียบร้อย' : 'บันทึกราคาห้องพัก'}
            </button>
            <div className="action-remark">* หากบันทึกแล้วจะไม่สามารถแก้ไขได้</div>
         </div>
      </div>

      {/* 5. Footer */}
      <footer className="decision-footer">
         <div className="footer-text">
            © 2026 Hotel Business Simulation Game. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

export default PricingPage;