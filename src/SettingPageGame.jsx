import React, { useState } from 'react';
import './SettingPageGame.css';
import {
  Monitor, Volume2, Accessibility, HelpCircle,
  Sun, Moon, ChevronDown, Save, VolumeX, Volume1,
  Eye, BookOpen, ExternalLink
} from 'lucide-react';

function SettingPageGame() {
  // --- State สำหรับจัดการ Tabs ---
  const [activeTab, setActiveTab] = useState('display'); // display, sound, access, help

  // --- State ของแต่ละหน้า (ตัวอย่าง) ---
  // 1. Display
  const [displayMode, setDisplayMode] = useState('light');
  const [fontSize, setFontSize] = useState(50);
  
  // 2. Sound
  const [mainVol, setMainVol] = useState(50);
  const [musicVol, setMusicVol] = useState(70);
  const [isMute, setIsMute] = useState(false);

  // 3. Accessibility
  const [colorBlindMode, setColorBlindMode] = useState(false);

  return (
    <div className="content-body setting-body">
        
        {/* --- Tabs Navigation --- */}
        <div className="settings-tabs-container">
            <button 
                className={`setting-tab ${activeTab === 'display' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('display')}
            >
                <Monitor size={18} /> ตั้งค่าการแสดงผล
            </button>
            <button 
                className={`setting-tab ${activeTab === 'sound' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('sound')}
            >
                <Volume2 size={18} /> ตั้งค่าเสียง
            </button>
            <button 
                className={`setting-tab ${activeTab === 'access' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('access')}
            >
                <Accessibility size={18} /> ความช่วยเหลือด้านการเข้าถึง
            </button>
            <button 
                className={`setting-tab ${activeTab === 'help' ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab('help')}
            >
                <HelpCircle size={18} /> การช่วยเหลือและข้อมูลเพิ่มเติม
            </button>
        </div>

        {/* --- Settings Card Area --- */}
        <div className="settings-card">
            
            {/* ================= TAB 1: Display (หน้าเดิม) ================= */}
            {activeTab === 'display' && (
                <div className="fade-in">
                    <h2 className="setting-section-title">ตั้งค่าการแสดงผล</h2>
                    
                    <div className="setting-form-group">
                        <div className="form-label-box">
                            <label>โหมดการแสดงผล</label>
                            <span className="form-desc">เปลี่ยนการโหมดระหว่างสว่างและมืด</span>
                        </div>
                        <div className="mode-toggle-switch">
                            <button 
                                className={`toggle-opt ${displayMode === 'light' ? 'active' : ''}`}
                                onClick={() => setDisplayMode('light')}
                            >
                                <Sun size={16} /> สว่าง
                            </button>
                            <button 
                                className={`toggle-opt ${displayMode === 'dark' ? 'active' : ''}`}
                                onClick={() => setDisplayMode('dark')}
                            >
                                <Moon size={16} /> มืด
                            </button>
                        </div>
                    </div>

                    <div className="setting-form-group">
                        <div className="form-label-box">
                            <label>ขนาดตัวอักษร</label>
                            <span className="form-desc">ปรับขนาดตัวอักษรเพื่อให้อ่านง่ายขึ้น</span>
                        </div>
                        <div className="slider-container">
                            <span className="slider-label">เล็ก</span>
                            <input type="range" className="green-slider" min="0" max="100" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                            <span className="slider-label">ใหญ่</span>
                        </div>
                    </div>

                    <div className="setting-form-group">
                        <div className="form-label-box">
                            <label>ภาษา</label>
                            <span className="form-desc">เลือกภาษาที่คุณต้องการ</span>
                        </div>
                        <div className="custom-select-wrapper">
                            <select className="custom-select">
                                <option>ไทย (Thai)</option>
                                <option>English</option>
                            </select>
                            <ChevronDown size={16} className="select-arrow" />
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 2: Sound (ตามรูป image_0a9f12) ================= */}
            {activeTab === 'sound' && (
                <div className="fade-in">
                    <h2 className="setting-section-title">ตั้งค่าเสียง</h2>

                    {/* Slider 1: เสียงหลัก */}
                    <div className="setting-form-group-col">
                        <div className="form-label-box mb-2">
                            <label><Volume2 size={18} className="inline-icon"/> ตั้งค่าเสียงหลัก</label>
                        </div>
                        <div className="full-width-slider">
                            <input type="range" className="green-slider w-100" min="0" max="100" value={mainVol} onChange={(e) => setMainVol(e.target.value)} />
                        </div>
                    </div>

                    {/* Slider 2: เสียงดนตรี */}
                    <div className="setting-form-group-col">
                        <div className="form-label-box mb-2">
                            <label><Volume1 size={18} className="inline-icon"/> ตั้งค่าเสียงดนตรี</label>
                        </div>
                        <div className="full-width-slider">
                            <input type="range" className="green-slider w-100" min="0" max="100" value={musicVol} onChange={(e) => setMusicVol(e.target.value)} />
                        </div>
                    </div>

                    <hr className="divider-light" />

                    {/* Toggle Mute */}
                    <div className="setting-form-group">
                        <div className="form-label-box">
                            <div className="flex-row-center">
                                <div className="icon-sq-gray"><VolumeX size={20} /></div>
                                <div className="ml-3">
                                    <label style={{marginBottom:0}}>ปิดเสียงทั้งหมด</label>
                                    <span className="form-desc block">ปิดเสียงในเกมทั้งหมดทันที</span>
                                </div>
                            </div>
                        </div>
                        <div className="toggle-switch-ios">
                            <input 
                                type="checkbox" 
                                id="mute-switch" 
                                checked={isMute} 
                                onChange={() => setIsMute(!isMute)} 
                            />
                            <label htmlFor="mute-switch"></label>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 3: Accessibility (ตามรูป image_0a9f6e) ================= */}
            {activeTab === 'access' && (
                <div className="fade-in">
                    <h2 className="setting-section-title">ตั้งค่าความช่วยเหลือด้านการเข้าถึง</h2>

                    <div className="access-card-item">
                        <div className="access-icon-box">
                            <Eye size={24} color="#2E7D32" />
                        </div>
                        <div className="access-text-content">
                            <h3>โหมดสำหรับผู้ที่มีปัญหาเกี่ยวกับการมองเห็นสี</h3>
                            <p>ปรับสีให้ชัดเจนยิ่งขึ้นสำหรับผู้ที่มีความบกพร่องทางการมองเห็นสีประเภทต่างๆ</p>
                        </div>
                        {/* ถ้าต้องการ Toggle */}
                        <div className="toggle-switch-ios">
                            <input 
                                type="checkbox" 
                                id="blind-mode" 
                                checked={colorBlindMode} 
                                onChange={() => setColorBlindMode(!colorBlindMode)} 
                            />
                            <label htmlFor="blind-mode"></label>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 4: Help (ตามรูป image_0a9f90) ================= */}
            {activeTab === 'help' && (
                <div className="fade-in">
                    <h2 className="setting-section-title">การช่วยเหลือและข้อมูลเพิ่มเติม</h2>

                    <div className="help-banner-card">
                        <div className="help-icon-box">
                            <BookOpen size={24} color="#1b5e20" />
                        </div>
                        <div className="help-text-content">
                            <h3>คู่มือการใช้งาน / คำแนะนำ</h3>
                            <p>เข้าถึงคู่มือผู้ใช้ฉบับสมบูรณ์ภายในเกมเพื่อรับคำแนะนำโดยละเอียด</p>
                        </div>
                        <button className="btn-green-outline">
                            Open Manual
                        </button>
                    </div>
                </div>
            )}

            {/* ✅✅ แก้ไขตรงนี้: ซ่อนปุ่ม Save ถ้าเป็นหน้า Help ✅✅ */}
            {activeTab !== 'help' && (
                <div className="setting-footer">
                    <button className="btn-save">
                        <Save size={18} /> บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            )}

        </div>
    </div>
  );
}

export default SettingPageGame;