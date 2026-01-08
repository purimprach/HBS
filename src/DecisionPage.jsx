import React, { useState, useEffect } from 'react';
import './DecisionPage.css';
import { 
  Banknote, Bed, Users, TrendingUp, Save, 
  PieChart, Tag, Megaphone, Wrench 
} from 'lucide-react';

const TOTAL_BUDGET = 10000000; 

const DecisionPage = () => {
  // 1. ✅ เพิ่ม State สำหรับเก็บว่า Tab ไหนกำลังถูกเลือกอยู่
  const [activeTab, setActiveTab] = useState('allocation'); // ค่าเริ่มต้นคือ 'allocation' (การจัดสรรเงิน)

  const [budgets, setBudgets] = useState([
    { id: 1, name: 'ซ่อมแซมและบำรุงรักษาสถานที่', value: 2000000, color: '#00C49F' }, 
    { id: 2, name: 'การลงทุนด้านการตลาด', value: 2500000, color: '#FFBB28' },
    { id: 3, name: 'การพัฒนาและฝึกอบรมพนักงาน', value: 2000000, color: '#4287f5' },
    { id: 4, name: 'การจัดจ้างที่ปรึกษา', value: 2000000, color: '#A020F0' },
    { id: 5, name: 'การลงทุนด้านอื่นๆ', value: 1500000, color: '#FF8042' }
  ]);

  const [usedBudget, setUsedBudget] = useState(0);

  useEffect(() => {
    const total = budgets.reduce((acc, item) => acc + item.value, 0);
    setUsedBudget(total);
  }, [budgets]);

  const handleBudgetChange = (id, newValue) => {
    const otherBudgetsTotal = budgets
      .filter(b => b.id !== id)
      .reduce((acc, b) => acc + b.value, 0);

    if (otherBudgetsTotal + newValue > TOTAL_BUDGET) {
      newValue = TOTAL_BUDGET - otherBudgetsTotal; 
    }

    setBudgets(prev => prev.map(item => 
      item.id === id ? { ...item, value: newValue } : item
    ));
  };

  const handlePercentClick = (id, percent) => {
    const amount = (TOTAL_BUDGET * percent) / 100;
    handleBudgetChange(id, amount);
  };

  const formatMoney = (num) => num.toLocaleString();

  return (
    <div className="decision-page">
      
      {/* --- Top Stats Cards --- */}
      <div className="stats-grid">
        {/* Card 1 */}
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">เงินสดปัจจุบัน</div>
             <div className="card-sub">เงินหมุนเวียน : 3-4 ไตรมาส</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><Banknote size={28} /></div>
            <div className="card-value">{formatMoney(TOTAL_BUDGET)}</div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">จำนวนห้องที่ใช้งานได้</div>
             <div className="card-sub">สภาพห้อง : 100%</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><Bed size={28} /></div>
            <div className="card-value">85% <span className="trend-indicator positive">+5%</span></div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">ผู้เข้าพักเฉลี่ยไตรมาสที่แล้ว</div>
             <div className="card-sub">อยู่ในเกณฑ์ : ดี</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><Users size={28} /></div>
            <div className="card-value">72%</div>
          </div>
        </div>
        {/* Card 4 */}
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">รายได้ไตรมาสที่แล้ว</div>
             <div className="card-sub">สถานะ : ดี</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><TrendingUp size={28} /></div>
            <div className="card-value">4,816,800</div>
          </div>
        </div>
      </div>

      {/* 2. ✅ แก้ไข Tabs ให้ทำงานได้จริง (เปลี่ยน Class ตาม State) */}
      <div className="decision-tabs">
        <button 
          className={`tab-btn ${activeTab === 'allocation' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocation')}
        >
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'marketing' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
          onClick={() => setActiveTab('hr')}
        >
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'others' ? 'active' : ''}`}
          onClick={() => setActiveTab('others')}
        >
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      {/* 3. ✅ แสดงเนื้อหาเฉพาะเมื่อเลือก Tab 'allocation' (หรือทำเนื้อหาอื่นมารอไว้) */}
      <div className="decision-content">
        
        {activeTab === 'allocation' ? (
          /* --- เนื้อหาหน้า Budget Allocation --- */
          <>
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
                          style={{ accentColor: item.color }} 
                        />
                      </div>

                      <div className="controls-row">
                        <div className="number-input-wrapper">
                          <input 
                            type="number" value={item.value}
                            onChange={(e) => handleBudgetChange(item.id, Number(e.target.value))}
                          />
                          <span className="unit">บาท</span>
                        </div>
                        <div className="percent-buttons">
                          <button onClick={() => handlePercentClick(item.id, 10)}>10%</button>
                          <button onClick={() => handlePercentClick(item.id, 25)}>25%</button>
                          <button onClick={() => handlePercentClick(item.id, 50)}>50%</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="max-spending">
                 รายจ่ายสูงสุดต่อเดือน (ยังไม่หักค่าใช้จ่าย): <strong>6,450,000 บาท/เดือน</strong>
              </div>
            </div>

            <div className="summary-section">
              <h3>สัดส่วนการจัดสรร</h3>
              <div className="donut-chart-wrapper">
                 <svg viewBox="0 0 100 100" className="donut-chart">
                   {budgets.reduce((acc, item, index) => {
                      const totalValue = budgets.reduce((sum, b) => sum + b.value, 0);
                      const percentage = totalValue === 0 ? 0 : item.value / totalValue;
                      const dashArray = percentage * 100; 
                      const offset = acc.currentOffset;
                      acc.currentOffset -= dashArray; 
                      acc.elements.push(
                        <circle key={item.id} cx="50" cy="50" r="40" fill="transparent" stroke={item.color} strokeWidth="15" strokeDasharray={`${dashArray} ${100 - dashArray}`} strokeDashoffset={offset + 25} />
                      );
                      return acc;
                   }, { elements: [], currentOffset: 0 }).elements}
                   <circle cx="50" cy="50" r="25" fill="white" />
                 </svg>
              </div>
              <div className="legend-list">
                 {budgets.map(item => (
                   <div key={item.id} className="legend-item">
                     <span className="legend-dot" style={{backgroundColor: item.color}}></span>
                     <span className="legend-name">{item.name}</span>
                     <span className="legend-val">{((item.value/TOTAL_BUDGET)*100).toFixed(0)}%</span>
                   </div>
                 ))}
              </div>
              <div className="budget-status">
                <div className="status-row">
                  <span>ใช้ไปแล้ว</span>
                  <span>{((usedBudget / TOTAL_BUDGET) * 100).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                   <div className="progress-fill" style={{ width: `${(usedBudget / TOTAL_BUDGET) * 100}%`, backgroundColor: usedBudget > TOTAL_BUDGET ? 'red' : '#00C49F' }}></div>
                </div>
                <div className="summary-text">
                   <div>งบประมาณทั้งหมด: {formatMoney(TOTAL_BUDGET)} บาท</div>
                   <div>รักษาเสถียรภาพ: {formatMoney(TOTAL_BUDGET - usedBudget)} บาท</div>
                   <div className={`status-msg ${usedBudget > TOTAL_BUDGET ? 'error' : 'ok'}`}>
                      ยอดคงเหลือ: {formatMoney(TOTAL_BUDGET - usedBudget)} บาท
                   </div>
                </div>
                <button className="confirm-btn"><Save size={18} /> บันทึกการตัดสินใจรอบที่ 1</button>
                <p className="warning-text">* หากบันทึกแล้วจะไม่สามารถแก้ไขได้อีกในรอบนี้</p>
              </div>
            </div>
          </>
        ) : (
          /* --- Placeholder สำหรับหน้าอื่นที่ยังไม่ได้ทำ --- */
          <div style={{ padding: '40px', textAlign: 'center', width: '100%', gridColumn: '1 / -1', background: 'white', borderRadius: '12px' }}>
            <h2>กำลังพัฒนาระบบส่วนของ: {activeTab}</h2>
            <p>เนื้อหาจะปรากฏที่นี่เมื่อคุณเลือกเมนูนี้</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DecisionPage;