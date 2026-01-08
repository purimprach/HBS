import React, { useState } from 'react';
import './SettingsPage.css';
import { Link } from 'react-router-dom';
import { 
    User, Monitor, Volume2, Accessibility, HelpCircle, 
    LogOut, Building2, ChevronLeft,
} from 'lucide-react';

function SettingsPage() {
  // --- State ---
  // 1. State สำหรับเปลี่ยน Tab เมนู
  const [activeTab, setActiveTab] = useState('profile');

  // 2. State ข้อมูลต่างๆ
  const [username, setUsername] = useState('Jane');
  const [email, setEmail] = useState('Janza1001@gmail.com');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(50);
  const [language, setLanguage] = useState('English');
  const [masterVolume, setMasterVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isColorBlind, setIsColorBlind] = useState(false);

  return (
    <div className="settings-page-wrapper">
      {/* ใช้ class 'account-header' เพื่อให้สไตล์เหมือนหน้า Account เป๊ะๆ */}
<nav className="account-header">
    
    {/* ใช้ 'header-left' ตาม CSS หลัก */}
    <div className="header-left">
        {/* ❌ ลบ color="#1a1a1a" ออก เพื่อให้ Dark Mode มองเห็น */}
        <Building2 size={24} className="header-icon" /> 
        <span className="header-title">Hotel Business Simulator</span>
    </div>

    {/* ใช้ 'header-right' ตาม CSS หลัก */}
    <div className="header-right">
      
        {/* ปุ่ม Back */}
        <Link to="/account" className="header-btn settings-btn">
            <ChevronLeft size={18} /> Back
        </Link>

        {/* ปุ่ม Logout */}
        <Link to="/login" className="header-btn logout-btn">
            <LogOut size={16} /> Log Out
        </Link>
    </div>
</nav>

          



      {/* --- 2. Main Container --- */}
      <div className="settings-main-container">
        
        {/* หัวข้อหน้า */}
        <div className="settings-header-title">
            <h2>Settings</h2>
        </div>

        {/* Grid Layout: ซ้ายเป็นเมนู ขวาเป็นเนื้อหา */}
        <div className="settings-layout">
            
            {/* --- 3. Sidebar Menu (ซ้าย) --- */}
            <aside className="settings-sidebar">
                <ul>
                    <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <User size={18}/> Profile
                    </li>
                    <li className={activeTab === 'display' ? 'active' : ''} onClick={() => setActiveTab('display')}>
                        <Monitor size={18}/> Display
                    </li>
                    <li className={activeTab === 'audio' ? 'active' : ''} onClick={() => setActiveTab('audio')}>
                        <Volume2 size={18}/> Audio
                    </li>
                    <li className={activeTab === 'access' ? 'active' : ''} onClick={() => setActiveTab('access')}>
                        <Accessibility size={18}/> Accessibility
                    </li>
                    <li className={activeTab === 'help' ? 'active' : ''} onClick={() => setActiveTab('help')}>
                        <HelpCircle size={18}/> Help & Info
                    </li>
                </ul>
            </aside>

            {/* --- 4. Content Area (ขวา) --- */}
            <main className="settings-content-area">
                
                {/* TAB: Profile */}
                {activeTab === 'profile' && (
                    <div className="tab-content fade-in">
                        <h3>Profile Settings</h3>
                        <div className="profile-layout-grid">
                            <div className="profile-inputs">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" className="setting-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" className="setting-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input type="password" placeholder="New password" className="setting-input"/>
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm</label>
                                        <input type="password" placeholder="Confirm" className="setting-input"/>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-avatar-section">
                                <div className="avatar-preview">
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80" alt="Profile" />
                                </div>
                                <button className="btn-change-photo">Change Photo</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Display */}
                {activeTab === 'display' && (
                    <div className="tab-content fade-in">
                        <h3>Display Settings</h3>
                        
                        <div className="setting-item-row">
                            <div className="setting-info">
                                <label>Application Theme</label>
                                <p>Switch between light and dark mode.</p>
                            </div>
                            <div className="theme-switcher">
                                <button className={`theme-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀ Light</button>
                                <button className={`theme-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>☾ Dark</button>
                            </div>
                        </div>

                        <div className="setting-item-stack">
                            <label>Font Size</label>
                            <div className="slider-wrapper">
                                <span>Small</span>
                                <input type="range" className="green-slider" min="0" max="100" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                                <span>Large</span>
                            </div>
                        </div>

                        <div className="setting-item-row">
                             <div className="setting-info">
                                <label>Language</label>
                             </div>
                             <select className="setting-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="English">English</option>
                                <option value="Thai">Thai</option>
                             </select>
                        </div>
                    </div>
                )}

                {/* TAB: Audio */}
                {activeTab === 'audio' && (
                    <div className="tab-content fade-in">
                        <h3>Audio Settings</h3>
                        <div className="setting-item-stack">
                            <label>Master Volume</label>
                            <div className="slider-wrapper">
                                <input type="range" className="green-slider" min="0" max="100" value={masterVolume} onChange={(e) => setMasterVolume(e.target.value)} />
                                <span>{masterVolume}%</span>
                            </div>
                        </div>
                        <div className="setting-item-stack">
                            <label>Music Volume</label>
                            <div className="slider-wrapper">
                                <input type="range" className="green-slider" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(e.target.value)} />
                                <span>{musicVolume}%</span>
                            </div>
                        </div>
                        <div className="setting-item-row">
                            <div className="setting-info">
                                <label>Mute All Sounds</label>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={isMuted} onChange={() => setIsMuted(!isMuted)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* TAB: Accessibility */}
                {activeTab === 'access' && (
                    <div className="tab-content fade-in">
                        <h3>Accessibility</h3>
                        <div className="setting-item-row">
                            <div className="setting-info">
                                <label>Colorblind Mode</label>
                                <p>Enhance color contrast for better visibility.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={isColorBlind} onChange={() => setIsColorBlind(!isColorBlind)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* TAB: Help */}
                {activeTab === 'help' && (
                     <div className="tab-content fade-in">
                        <h3>Help & Information</h3>
                        <div className="help-box">
                            <div className="setting-info">
                                <label>User Manual / Guidelines</label>
                                <p>Read the full guide to play the game.</p>
                            </div>
                            <button className="btn-open-manual">📖 Open Manual</button>
                        </div>
                     </div>
                )}

                {/* Footer Save Button (Show on all tabs except help) */}
                {activeTab !== 'help' && (
                    <div className="settings-footer">
                        <button className="btn-save-changes">Save Changes</button>
                    </div>
                )}

            </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;