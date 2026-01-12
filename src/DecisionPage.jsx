import React, { useState, useEffect } from 'react';
import './DecisionPage.css';
import { 
  Banknote, Bed, Users, TrendingUp, Save, 
  PieChart, Tag, Megaphone, Wrench 
} from 'lucide-react';

const TOTAL_BUDGET = 10000000; 

const PERCENT_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50];

const DecisionPage = () => {
  const [activeTab, setActiveTab] = useState('allocation');
  const [isSaved, setIsSaved] = useState(false); 

  // ✅ แก้ไข Comma (,) ที่หายไป และสีแดงของงบสำรองจ่าย
  const [budgets, setBudgets] = useState([
    { id: 1, name: 'งบการลงทุนด้านการตลาด', value: 2000000, color: '#00C49F' }, 
    { id: 2, name: 'งบการลงทุนด้านการพัฒนาและฝึกอบรมพนักงาน', value: 2500000, color: '#FFBB28' },
    { id: 3, name: 'งบซ่อมแซมและบำรุงรักษาสถานที่', value: 1000000, color: '#4287f5' },
    { id: 4, name: 'งบการลงทุนด้านอื่นๆ', value: 1500000, color: '#A020F0' }, // ✅ เติม , ให้แล้ว
    { id: 5, name: 'งบสำรองจ่าย', value: 1000000, color: '#f22c09' }        // ✅ ใช้สีแดงตามที่ขอ
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
      
      {/* --- Top Stats Cards --- */}
      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">เงินสดปัจจุบัน</div>
             <div className="card-sub">เงินหมุนเวียน : 3-4 ไตรมาส</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><Banknote size={28} /></div>
            <div className="card-value">{formatMoney(TOTAL_BUDGET)} </div>
          </div>
        </div>
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">จำนวนห้องที่ใช้งานได้</div>
             <div className="card-sub">สภาพห้อง : 100%</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><Bed size={28} /></div>
            <div className="card-value">110 ห้อง </div>
          </div>
        </div>
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
        <div className="stat-card accent-green">
          <div className="card-left">
             <div className="card-title">รายได้ไตรมาสที่แล้ว</div>
             <div className="card-sub">สถานะ : ดี</div>
          </div>
          <div className="card-right">
            <div className="card-icon-wrapper icon-green"><TrendingUp size={28} /></div>
            <div className="card-value">4,816,800 </div>
          </div>
        </div>
      </div>

      {/* --- Tabs --- */}
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

      {/* --- Content --- */}
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
                                // 1. ส่งค่าสีเข้าไปเป็นตัวแปร เพื่อให้ CSS เอาไปใช้ทำสีปุ่ม
                                     '--thumb-color': item.color,
       
                                // 2. สร้างแถบสีด้วยตัวเอง (ซ้ายสีเข้ม-ขวาสีเทา) จะได้ไม่ติดดำ
                                background: `linear-gradient(to right, ${item.color} 0%, ${item.color} ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`
                                 }} 
    /* ------------------------------------------------ */
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
                                          // ✅ เพิ่มตรงนี้: สั่งเปลี่ยนสีปุ่มตามสีของ item.color
                                          style={isActive ? { 
                                            backgroundColor: item.color, 
                                            borderColor: item.color,
                                            color: '#fff' // ตัวหนังสือสีขาว
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
                    รายจ่ายสูงสุดต่อเดือน (ยังไม่หักค่าใช้จ่าย): <strong>6,450,000 บาท/เดือน</strong>
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
                  
                  <svg viewBox="0 0 100 100" className="donut-chart">
                    {budgets.reduce((acc, item, index) => {
                      const totalValue = budgets.reduce((sum, b) => sum + b.value, 0);
                      const percentage = totalValue === 0 ? 0 : item.value / totalValue;
                      const dashArray = percentage * 100; 
                      const offset = acc.currentOffset;
                      acc.currentOffset -= dashArray; 
                      acc.elements.push(
                        <circle 
                          key={item.id} cx="50" cy="50" r="40" 
                          fill="transparent" 
                          stroke={item.color} 
                          strokeWidth="10" 
                          strokeDasharray={`${dashArray} ${100 - dashArray}`} 
                          strokeDashoffset={offset + 25} 
                          strokeLinecap="round" 
                        />
                      );
                      return acc;
                    }, { elements: [], currentOffset: 0 }).elements}
                  </svg>
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
                </div>

                <button 
                  className="confirm-btn" 
                  onClick={handleSave}
                  disabled={isSaved || usedBudget > TOTAL_BUDGET}
                >
                   <Save size={18} /> 
                   {isSaved ? 'บันทึกเรียบร้อยแล้ว' : 'บันทึกการตัดสินใจรอบที่ 1'}
                </button>
                
                <p className="warning-text">
                  {isSaved 
                    ? '✅ การตัดสินใจถูกบันทึกแล้ว ไม่สามารถแก้ไขได้' 
                    : '* หากบันทึกแล้วจะไม่สามารถแก้ไขได้อีกในรอบนี้'}
                </p>
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
    </div>
  );
};

export default DecisionPage;