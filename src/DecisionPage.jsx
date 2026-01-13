import React, { useState, useEffect } from 'react';
import './DecisionPage.css';
import { 
  Banknote, Bed, Users, TrendingUp, Save, Check, 
  PieChart, Tag, Megaphone, Wrench 
} from 'lucide-react';

const TOTAL_BUDGET = 10000000; 

const PERCENT_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50];

const DecisionPage = () => {
  const [activeTab, setActiveTab] = useState('allocation');
  const [isSaved, setIsSaved] = useState(false); 

  const [budgets, setBudgets] = useState([
    { id: 1, name: 'งบการลงทุนด้านการตลาด', value: 2000000, color: '#00C49F' }, 
    { id: 2, name: 'งบการลงทุนด้านการพัฒนาและฝึกอบรมพนักงาน', value: 2500000, color: '#FFBB28' },
    { id: 3, name: 'งบซ่อมแซมและบำรุงรักษาสถานที่', value: 1000000, color: '#4287f5' },
    { id: 4, name: 'งบการลงทุนด้านอื่นๆ', value: 1500000, color: '#A020F0' },
    { id: 5, name: 'งบสำรองจ่าย', value: 1000000, color: '#f22c09' }
  ]);

  const [usedBudget, setUsedBudget] = useState(0);

  useEffect(() => {
    const total = budgets.reduce((acc, item) => acc + item.value, 0);
    setUsedBudget(total);
  }, [budgets]);

  const handleBudgetChange = (id, newValue) => {
    if (isSaved) return; 
    const otherBudgetsTotal = budgets.filter(b => b.id !== id).reduce((acc, b) => acc + b.value, 0);
    if (otherBudgetsTotal + newValue > TOTAL_BUDGET) {
      newValue = TOTAL_BUDGET - otherBudgetsTotal; 
    }
    setBudgets(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item));
  };

  const handlePercentClick = (id, percent) => {
    if (isSaved) return;
    const amount = (TOTAL_BUDGET * percent) / 100;
    handleBudgetChange(id, amount);
  };

  const handleSave = () => {
    if (window.confirm('คุณต้องการยืนยันการจัดสรรงบประมาณใช่หรือไม่? \n(เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้)')) {
      setIsSaved(true);
    }
  };

  const formatMoney = (num) => num.toLocaleString();

  return (
    <div className="decision-page">
      
      {/* --- 1. Top Stats Cards --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">เงินสดปัจจุบัน</span>
             <div className="stat-icon-box"><Banknote size={20} /></div>
          </div>
          <div className="stat-value">{formatMoney(TOTAL_BUDGET)}</div>
          <div className="stat-sub">ระยะเวลาหมุนเวียน : 3-4 ไตรมาส</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">ส่วนแบ่งการตลาด</span>
             <div className="stat-icon-box"><Users size={20} /></div>
          </div>
          <div className="stat-value">12%</div>
          <div className="stat-sub">อยู่อันดับ 3 จาก 6</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">ความพึงพอใจลูกค้า</span>
             <div className="stat-icon-box"><Bed size={20} /></div>
          </div>
          <div className="stat-value">3.5/5</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : พอใช้</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
             <span className="stat-title">ความสมบูรณ์ทรัพย์สิน</span>
             <div className="stat-icon-box">
                <span style={{fontWeight:'bold', fontSize:'1.2rem'}}>฿</span> 
             </div>
          </div>
          <div className="stat-value">95%</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดีมาก</div>
        </div>
      </div>

      {/* --- 2. Tabs Navigation --- */}
      <div className="decision-tabs">
        <button className={`tab-btn ${activeTab === 'allocation' ? 'active' : ''}`} onClick={() => setActiveTab('allocation')}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>
        <button className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        <button className={`tab-btn ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')}>
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>
        <button className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`} onClick={() => setActiveTab('hr')}>
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>
        <button className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        <button className={`tab-btn ${activeTab === 'others' ? 'active' : ''}`} onClick={() => setActiveTab('others')}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* --- 3. Main Content --- */}
      <div className="decision-content">
        
        {activeTab === 'allocation' ? (
          <>
            <div className="left-column">
                <div className="budget-form-section">
                  <div className="section-header">
                      <h3>จัดสรรงบประมาณ รอบที่ 1</h3>
                      <span className="budget-limit">งบประมาณทั้งหมด: {formatMoney(TOTAL_BUDGET)} บาท</span>
                  </div>

                  <div className="sliders-container">
                      {budgets.map((item) => {
                      const percent = ((item.value / TOTAL_BUDGET) * 100).toFixed(1);
                      return (
                          <div key={item.id} className="budget-item">
                          <div className="item-label">
                              <span className="dot" style={{ backgroundColor: item.color }}></span>
                              <span>{item.name}</span>
                              <span className="percent-badge">{percent}%</span>
                          </div>
                          
                          <div className="slider-row">
                              <input 
                                type="range" min="0" max={TOTAL_BUDGET} step="10000"
                                value={item.value} 
                                onChange={(e) => handleBudgetChange(item.id, Number(e.target.value))}
                                className="range-slider"
                                style={{ 
                                     '--thumb-color': item.color,
                                     background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`
                                 }} 
                                disabled={isSaved}
                              />
                          </div>

                          <div className="controls-row">
                              <div className="number-input-wrapper">
                                <input 
                                    type="text" 
                                    value={item.value.toLocaleString()} 
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(/,/g, '');
                                      const numValue = Number(rawValue);
                                      if (!isNaN(numValue)) handleBudgetChange(item.id, numValue);
                                    }}
                                    disabled={isSaved}
                                />
                                <span className="unit">บาท</span>
                              </div>

                              <div className="percent-buttons">
                                  {PERCENT_OPTIONS.map((pct) => {
                                    const targetValue = (TOTAL_BUDGET * pct) / 100;
                                    const isActive = item.value === targetValue;
                                    return (
                                        <button 
                                          key={pct} 
                                          onClick={() => handlePercentClick(item.id, pct)} 
                                          disabled={isSaved}
                                          className={isActive ? 'active' : ''}
                                          style={isActive ? { 
                                            backgroundColor: item.color, 
                                            borderColor: item.color,
                                            color: '#fff' 
                                          } : {}}
                                        >
                                          {pct}%
                                        </button>
                                    );
                                  })}
                              </div>
                          </div>
                          </div>
                      );
                      })}
                  </div>
                </div>

                <div className="max-spending-card">
                    รายได้สูงสุดต่อเดือน (ยังไม่หักค่าใช้จ่าย): <strong>6,450,000 บาท/เดือน</strong>
                </div>
            </div>

            <div className="summary-section">
              <h3>สัดส่วนการจัดสรร</h3>

              <div className="donut-chart-wrapper">
                  <div className="chart-center-info">
                    <span className="chart-label-text">ใช้ไป</span>
                    <span className="chart-percent-text">
                      {((usedBudget / TOTAL_BUDGET) * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  {/* ✅✅✅ แก้ไขกราฟ: เพิ่มส่วน Remaining Budget ✅✅✅ */}
                  <svg viewBox="0 0 100 100" className="donut-chart">
                    {(() => {
                      let currentOffset = 25; // เริ่มที่ 12 นาฬิกา
                      const elements = [];

                      // 1. วาดส่วนที่จัดสรรแล้ว
                      budgets.forEach((item) => {
                        const percentage = (item.value / TOTAL_BUDGET) * 100;
                        if (percentage > 0) {
                          elements.push(
                            <circle 
                              key={item.id} cx="50" cy="50" r="40" 
                              fill="transparent" 
                              stroke={item.color} 
                              strokeWidth="10" 
                              pathLength="100"
                              strokeDasharray={`${percentage} ${100 - percentage}`} 
                              strokeDashoffset={currentOffset} 
                              strokeLinecap="butt" // ใช้ butt เพื่อให้วงกลมต่อกันสนิทเหมือนในรูป
                            />
                          );
                          currentOffset -= percentage;
                        }
                      });

                      // 2. วาดส่วนที่เหลือ (สีเทา)
                      const remainingBudget = TOTAL_BUDGET - usedBudget;
                      if (remainingBudget > 0) {
                        const remainingPercent = (remainingBudget / TOTAL_BUDGET) * 100;
                        elements.push(
                          <circle 
                            key="remaining" cx="50" cy="50" r="40" 
                            fill="transparent" 
                            stroke="#E5E7EB" // สีเทาอ่อน
                            strokeWidth="10" 
                            pathLength="100"
                            strokeDasharray={`${remainingPercent} ${100 - remainingPercent}`} 
                            strokeDashoffset={currentOffset} 
                            strokeLinecap="butt"
                          />
                        );
                      }

                      return elements;
                    })()}
                  </svg>
                  {/* ------------------------------------------------ */}
              </div>

              <div className="legend-list">
                  {budgets.map(item => (
                    <div key={item.id} className="legend-item">
                      <div className="legend-left">
                        <span className="legend-dot" style={{backgroundColor: item.color}}></span>
                        <span className="legend-name">{item.name}</span>
                      </div>
                      <span className="legend-val">{((item.value/TOTAL_BUDGET)*100).toFixed(0)}%</span>
                    </div>
                  ))}
                  
                  {/* ✅ เพิ่ม Legend สำหรับงบคงเหลือ */}
                  <div className="legend-item">
                      <div className="legend-left">
                        <span className="legend-dot" style={{backgroundColor: '#E5E7EB'}}></span>
                        <span className="legend-name" style={{color: '#6B7280'}}>งบประมาณคงเหลือ</span>
                      </div>
                      <span className="legend-val" style={{color: '#6B7280'}}>
                        {(((TOTAL_BUDGET - usedBudget)/TOTAL_BUDGET)*100).toFixed(0)}%
                      </span>
                  </div>
              </div>

              <div className="budget-status">
                <div className="status-header">
                   <span>ใช้ไปแล้ว</span>
                   <span className="status-percent">{((usedBudget / TOTAL_BUDGET) * 100).toFixed(1)}%</span>
                </div>

                <div className="progress-bar">
                   <div 
                     className="progress-fill" 
                     style={{ 
                       width: `${Math.min((usedBudget / TOTAL_BUDGET) * 100, 100)}%`, 
                       backgroundColor: usedBudget > TOTAL_BUDGET ? '#EF4444' : '#10B981' 
                     }}
                   ></div>
                </div>
                
                <div className="summary-text-group">
                   <div className="summary-row">
                     <span>งบประมาณทั้งหมด:</span>
                     <span className="val">{formatMoney(TOTAL_BUDGET)} บาท</span>
                   </div>
                   <div className="summary-row">
                     <span>จัดสรรแล้ว:</span>
                     <span className="val">{formatMoney(usedBudget)} บาท</span>
                   </div>
                   <div className="summary-row highlight">
                     <span>คงเหลือ:</span>
                     <span className={`val ${usedBudget > TOTAL_BUDGET ? 'text-red' : 'text-green'}`}>
                        {formatMoney(TOTAL_BUDGET - usedBudget)} บาท
                     </span>
                   </div>

                   <p style={{ 
                      color: '#EF4444', 
                      fontSize: '0.75rem', 
                      textAlign: 'right', 
                      marginTop: '8px',
                      marginBottom: '0',
                      fontWeight: '500'
                   }}>
                      * ควรสำรองเงินสดเพื่อรักษาสภาพคล่อง ในการดำเนินงานรอบถัดไป
                   </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', width: '100%', gridColumn: '1 / -1', background: 'white', borderRadius: '12px' }}>
            <h2>กำลังพัฒนาระบบส่วนของ: {activeTab}</h2>
            <p>เนื้อหาจะปรากฏที่นี่เมื่อคุณเลือกเมนูนี้</p>
          </div>
        )}
      </div>

      {/* --- 4. Bottom Action Bar --- */}
      {activeTab === 'allocation' && (
        <div className="bottom-action-bar">
           <div className="break-even-section">
              <div className="be-title">จุดคุ้มทุน (Break-even point)</div>
              <div className="be-value">3,500,000 บาท/เดือน</div>
           </div>
           
           <div className="action-section">
              <button 
                className="confirm-btn-large" 
                onClick={handleSave}
                disabled={isSaved || usedBudget > TOTAL_BUDGET}
              >
                 <div className="btn-icon-circle"><Check size={16} strokeWidth={3} /></div>
                 {isSaved ? 'บันทึกเรียบร้อย' : 'บันทึกการจัดสรรเงิน'}
              </button>
              <div className="action-remark">
                * หากบันทึกแล้วจะไม่สามารถแก้ไขได้
              </div>
           </div>
        </div>
      )}

      {/* --- 5. Footer --- */}
      <footer className="decision-footer">
         <div className="footer-text">
            © 2026 Hotel Business Simulation Game. All rights reserved.
         </div>
      </footer>

    </div>
  );
};

export default DecisionPage;