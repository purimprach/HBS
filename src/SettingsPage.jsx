import React, { useState } from 'react';
import './SettingsPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { User, Monitor, Volume2, Accessibility, HelpCircle, LogOut } from 'lucide-react'; //

function SettingsPage() {
  const navigate = useNavigate();
  
  // State ควบคุม Tab ปัจจุบัน (เริ่มต้นที่ profile)
  const [activeTab, setActiveTab] = useState('profile');

  // State เก็บข้อมูล Form (Mock Data)
  const [username, setUsername] = useState('Jane');
  const [email, setEmail] = useState('Janza1001@gmail.com');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(50);
  const [language, setLanguage] = useState('English');
  const [masterVolume, setMasterVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isColorBlind, setIsColorBlind] = useState(false);

  // ฟังก์ชันสำหรับ Render เนื้อหาตาม Tab ที่เลือก
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content fade-in">
            <h3>Profile Settings</h3>
            <div className="profile-layout-grid">
              <div className="profile-form">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="setting-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="setting-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>New Password</label>
                    <input type="password" class="setting-input" placeholder="Enter new password" />
                  </div>
                  <div className="form-group half">
                    <label>Confirm Password</label>
                    <input type="password" class="setting-input" placeholder="Confirm new password" />
                  </div>
                </div>
              </div>
              <div className="profile-avatar-section">
                <div className="avatar-preview">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80" alt="Profile" />
                </div>
                <button className="btn-change-photo">Change Profile Photo</button>
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
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

            <div className="setting-item-row">
                <div className="setting-info full">
                    <label>Font Size</label>
                    <p>Adjust the application's font size.</p>
                    <div className="slider-wrapper">
                        <span>Small</span>
                        <input type="range" min="0" max="100" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="green-slider" />
                        <span>Large</span>
                    </div>
                </div>
            </div>

            <div className="setting-item-row">
                <div className="setting-info">
                    <label>Language</label>
                    <p>Choose the application language.</p>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="setting-select">
                    <option value="English">English</option>
                    <option value="Thai">Thai</option>
                </select>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="tab-content fade-in">
            <h3>Audio Settings</h3>
            <div className="setting-item-stack">
                <label>Master Volume</label>
                <input type="range" min="0" max="100" value={masterVolume} onChange={(e) => setMasterVolume(e.target.value)} className="green-slider" />
            </div>
            <div className="setting-item-stack">
                <label>Music Volume</label>
                <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(e.target.value)} className="green-slider" />
            </div>
            <div className="setting-item-row">
                <div className="setting-info">
                    <label>Mute all sounds</label>
                    <p>Instantly disable all in-game audio.</p>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={isMuted} onChange={() => setIsMuted(!isMuted)} />
                    <span className="slider round"></span>
                </label>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="tab-content fade-in">
            <h3>Accessibility Settings</h3>
            <div className="setting-item-row">
                <div className="setting-info">
                    <label>Colorblind Mode</label>
                    <p>Adjusts colors to be more distinct.</p>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={isColorBlind} onChange={() => setIsColorBlind(!isColorBlind)} />
                    <span className="slider round"></span>
                </label>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="tab-content fade-in">
            <h3>Help & Information</h3>
            <div className="help-box">
                <div className="setting-info">
                    <label>Guideline / User Manual</label>
                    <p>Access the comprehensive in-game user manual.</p>
                </div>
                <button className="btn-open-manual">Open Manual</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page-wrapper">
      
      {/* Navbar ด้านบน */}
      <nav className="settings-navbar">
        <div className="nav-brand">
          <span className="logo-emoji">🏨</span>
          <span className="brand-text">Hotel Business Simulator</span>
        </div>
        <div className="nav-actions">
           <span className="lang-text">🌐 EN</span>
           
           {/* ปุ่มย้อนกลับไปหน้า Team Setting (AccountPage) */}
           <button className="btn-nav-back" onClick={() => navigate('/account')}>
              Back 
           </button>
           
           {/* ปุ่ม Logout */}
           <button className="btn-nav-logout" onClick={() => navigate('/login')}>
              <LogOut size={16}/> Log Out
           </button>
        </div>
      </nav>

      {/* Main Container แบ่งซ้ายขวา */}
      <div className="settings-main-container">
        
        <div className="settings-header-title">
            <h2>Settings</h2>
        </div>

        <div className="settings-layout">
            {/* Sidebar Menu ทางซ้าย */}
            <aside className="settings-sidebar">
                <ul>
                    <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <User size={18} /> Profile Settings
                    </li>
                    <li className={activeTab === 'display' ? 'active' : ''} onClick={() => setActiveTab('display')}>
                        <Monitor size={18} /> Display Settings
                    </li>
                    <li className={activeTab === 'audio' ? 'active' : ''} onClick={() => setActiveTab('audio')}>
                        <Volume2 size={18} /> Audio Settings
                    </li>
                    <li className={activeTab === 'accessibility' ? 'active' : ''} onClick={() => setActiveTab('accessibility')}>
                        <Accessibility size={18} /> Accessibility
                    </li>
                    <li className={activeTab === 'help' ? 'active' : ''} onClick={() => setActiveTab('help')}>
                        <HelpCircle size={18} /> Help & Info
                    </li>
                </ul>
            </aside>

            {/* Content Area ทางขวา */}
            <main className="settings-content-area">
                {renderContent()}

                {/* ปุ่ม Save Changes */}
                <div className="settings-footer">
                    <button className="btn-save-changes">Save Changes</button>
                </div>
            </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;