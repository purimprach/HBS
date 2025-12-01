import React, { useState } from 'react';
import './SettingsPage.css';
import { Link } from 'react-router-dom';

function SettingsPage() {
  // State จัดการค่าต่างๆ
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
    <div className="settings-container">
      
      {/* --- Navbar (Standard Style) --- */}
      <nav className="account-header">
        <div className="header-left">
          <span className="logo-icon">🏨</span>
          <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="lang-btn">🌐 EN</button>
          {/* ปุ่ม Settings สีเขียว (Active) */}
          <button className="settings-btn active">⚙️ Settings</button>
          <Link to="/login" className="logout-btn">↪️ Log Out</Link>
        </div>
      </nav>

      <main className="settings-content">
        <h1>Settings</h1>

        {/* 1. Profile Settings */}
        <div className="card settings-card">
          <h3>Profile Settings</h3>
          <div className="profile-layout">
            <div className="profile-inputs">
                <div className="form-group">
                    <label>Username</label>
                    <div className="input-minimal">
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <div className="input-minimal">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-minimal">
                            <input type="password" placeholder="Enter new password" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="input-minimal">
                            <input type="password" placeholder="Confirm new password" />
                        </div>
                    </div>
                </div>
                <button className="btn-save-gray">Ok</button>
            </div>
            
            <div className="profile-picture-section">
                <div className="profile-img-circle">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80" alt="Profile" />
                </div>
                <button className="btn-change-profile">Change Profile</button>
            </div>
          </div>
        </div>

        {/* 2. Display Settings */}
        <div className="card settings-card">
          <h3>Display Settings</h3>
          <div className="setting-row">
            <div className="setting-label">
                <h4>Application Theme</h4>
                <p>Switch between light and dark mode.</p>
            </div>
            <div className="theme-toggle">
                <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀ Light</button>
                <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>☾ Dark</button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-label full-width">
                <h4>Font Size</h4>
                <p>Adjust the application's font size for better readability.</p>
                <div className="slider-container">
                    <span>Small</span>
                    <input type="range" min="0" max="100" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="green-slider" />
                    <span>Large</span>
                </div>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-label">
                <h4>Language</h4>
                <p>Choose the application language.</p>
            </div>
            <div className="language-select-wrapper">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="lang-select">
                    <option value="English">English</option>
                    <option value="Thai">Thai</option>
                </select>
            </div>
          </div>
        </div>

        {/* 3. Audio Settings */}
        <div className="card settings-card">
          <h3>Audio Settings</h3>
          <div className="setting-slider-row">
             <h4>Master Volume</h4>
             <p>Adjust the overall game volume.</p>
             <input type="range" min="0" max="100" value={masterVolume} onChange={(e) => setMasterVolume(e.target.value)} className="green-slider" />
          </div>
          <div className="setting-slider-row">
             <h4>Music Volume</h4>
             <p>Adjust the background music volume.</p>
             <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(e.target.value)} className="green-slider" />
          </div>
          <div className="setting-row">
            <div className="setting-label">
                <h4>Mute all sounds</h4>
                <p>Instantly disable all in-game audio.</p>
            </div>
            <div className="toggle-switch-container">
                <label className="switch">
                    <input type="checkbox" checked={isMuted} onChange={() => setIsMuted(!isMuted)} />
                    <span className="slider round"></span>
                </label>
            </div>
          </div>
        </div>

        {/* 4. Accessibility Settings */}
        <div className="card settings-card">
          <h3>Accessibility Settings</h3>
          <div className="setting-row">
            <div className="setting-label">
                <h4>Colorblind Mode</h4>
                <p>Adjusts colors to be more distinct for various types of color vision deficiency.</p>
            </div>
            <div className="toggle-switch-container">
                <label className="switch">
                    <input type="checkbox" checked={isColorBlind} onChange={() => setIsColorBlind(!isColorBlind)} />
                    <span className="slider round"></span>
                </label>
            </div>
          </div>
        </div>

        {/* 5. Help & Information */}
        <div className="card settings-card">
          <h3>Help & Information</h3>
          <div className="setting-row">
            <div className="setting-label">
                <h4>Guideline / User Manual</h4>
                <p>Access the comprehensive in-game user manual for detailed guidance.</p>
            </div>
            <button className="btn-open-manual">📖 Open Manual</button>
          </div>
        </div>

        {/* --- Footer Actions (New) --- */}
        <div className="settings-footer-actions">
            <Link to="/account" className="btn-back-lobby">Back to Lobby</Link>
            <button className="btn-save-change">Save Change</button>
        </div>

      </main>
    </div>
  );
}

export default SettingsPage;