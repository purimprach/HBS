import React, { useState, useEffect } from 'react';
import './AccountPage.css';
import { Link, useNavigate } from 'react-router-dom';

function AccountPage() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- States ---
  const [joinCode, setJoinCode] = useState('');
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [teamName, setTeamName] = useState('');
  
  // Emails (ค่าเริ่มต้นว่างไว้ เพื่อให้เห็น Placeholder)
  const [myEmail, setMyEmail] = useState('Janeza@gmail.com');
  const [member2Email, setMember2Email] = useState(''); 
  const [member3Email, setMember3Email] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Roles
  const [myRole, setMyRole] = useState('CEO');
  const [member2Role, setMember2Role] = useState('CFO');
  const [member3Role, setMember3Role] = useState('HR');
  const [newMemberRole, setNewMemberRole] = useState('CEO'); 

  // View All Announcement
  const [isAnnounceExpanded, setIsAnnounceExpanded] = useState(false);

  const roleOptions = ['CEO', 'CFO', 'CMO', 'HR'];

  const handleJoinClick = () => {
    if (joinCode.trim() !== '') {
        setShowTeamSetup(true);
        // ไม่ลบ joinCode เพื่อให้ตัวหนังสือค้างอยู่
    }
  };

  const handleTeamSetupOk = () => {
      navigate('/waiting-list');
  };

  // Mock Data
  const gameHistory = [
    { id: 1, name: 'Grand Coastal Resort', detail: 'Chiang Mai Series', info: '2nd Place of 8 players', turns: '12/12 Turns', date: 'Nov 10, 2024', rankType: 'silver' },
    { id: 2, name: 'Metropolis Business Hotel', detail: 'Bangkok League 2023', info: '1st Place of 6 players', turns: '10/10 Turns', date: 'Oct 25, 2024', rankType: 'gold' },
    { id: 3, name: 'Sunset Beach Resort', detail: 'Coastal Challenge', info: '5th Place of 10 players', turns: '8/8 Turns', date: 'Oct 5, 2024', rankType: 'trophy' },
  ];

  const announcements = [
    { id: 1, title: 'Important: Read Case Study Before Turn 3', desc: 'All teams must review the industry analysis case study...', author: 'Dr. Somchai', date: 'Nov 10, 2024', tag: 'Admin', type: 'important' },
    { id: 2, title: 'Maintenance Notice', desc: 'System maintenance this Sunday...', author: 'Admin', date: 'Nov 13, 2024', tag: 'System', type: 'normal' },
    { id: 3, title: 'Week 2 Ranking Released', desc: 'Check out the leaderboard...', author: 'Game Master', date: 'Nov 14, 2024', tag: 'Game', type: 'normal' },
    { id: 4, title: 'New Feature: Market Analysis', desc: 'You can now view competitor pricing...', author: 'Dev Team', date: 'Nov 15, 2024', tag: 'Update', type: 'normal' }
  ];

  const displayedAnnouncements = isAnnounceExpanded ? announcements : announcements.slice(0, 2);

  return (
    <div className="account-container">
      {/* Header */}
      <nav className="account-header">
        <div className="header-left">
          <span className="logo-icon">🏨</span>
          <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="lang-btn">🌐 EN</button>
          <Link to="/settings" className="settings-btn">⚙️ Settings</Link>
          <Link to="/login" className="logout-btn">↪️ Log Out</Link>
        </div>
      </nav>

      {/* Content */}
      <main className="main-content">
        <div className="welcome-section">
          <div className="user-avatar-large">👤</div>
          <h1>Hello, Jane !</h1>
        </div>

        <div className="dashboard-grid">
          
          {/* Left Column */}
          <div className="left-column">
            <div className="card join-game-card">
              <h3>Join Game</h3>
              <div className="join-input-group">
                <input 
                  type="text" 
                  placeholder="Enter code (e.g. AX063)" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  disabled={showTeamSetup}
                />
              </div>
              <p className="helper-text">If you don't have a game access code, <a href="#click">click here.</a></p>
              <button 
                className={`join-confirm-btn ${joinCode.trim() !== '' && !showTeamSetup ? 'active' : ''}`}
                disabled={joinCode.trim() === '' || showTeamSetup}
                onClick={handleJoinClick}
              >
                {showTeamSetup ? 'Joined' : 'Join'}
              </button>
            </div>

            <div className="card join-team-card">
              <h3>Join Team</h3>
              <div className="team-invite-box"></div>
              <div className="join-team-actions">
                <button className="btn-deny">Deny</button>
                <button className="btn-accept">Accept</button>
              </div>
            </div>

            <div className="history-section">
              <div className="history-header">
                <h3>🕒 History</h3>
                <span className="badge-count">3</span>
              </div>
              <div className="history-list">
                {gameHistory.map(game => (
                  <div key={game.id} className="history-card">
                    <div className="history-top">
                      <div>
                        <h4>{game.name}</h4>
                        <p className="sub-text">{game.detail}</p>
                        <p className="sub-text">{game.info}</p>
                      </div>
                      <div className="rank-icon">
                        {game.rankType === 'silver' && '🥈'} {game.rankType === 'gold' && '🥇'} {game.rankType === 'trophy' && '🏆'}
                      </div>
                    </div>
                    <div className="history-bottom">
                      <span>{game.turns}</span>
                      <span>📅 {game.date}</span>
                    </div>
                    <div className="history-action"><a href="#report">View Report &gt;</a></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            
            {/* Announcements Card */}
            <div className="card announcements-card">
              <div className="announcement-header">
                <h3>📢 Announcements <span className="badge-count-gray">{announcements.length}</span></h3>
              </div>
              <div className="announcement-list-container">
                {displayedAnnouncements.map(item => (
                  <div key={item.id} className={`announcement-item-classic ${item.type === 'important' ? 'item-important' : ''}`}>
                    <h4 className="ann-title-classic">{item.title}</h4>
                    {item.tag === 'Admin' && <span className="tag-admin-classic">Admin</span>}
                    <p className="ann-desc-classic">{item.desc}</p>
                    <div className="ann-footer-classic"><span>👤 {item.author}</span><span>📅 {item.date}</span></div>
                  </div>
                ))}
              </div>
              <div className="announcement-footer-action">
                  <button className="btn-view-all-classic" onClick={() => setIsAnnounceExpanded(!isAnnounceExpanded)}>
                    {isAnnounceExpanded ? 'View Less ▴' : 'View All ▸'}
                  </button>
              </div>
            </div>

            {/* Team Setup Card */}
            {showTeamSetup && (
                <div className="card team-setup-card">
                <div className="card-header-tag">
                    <h3>Team Setup : Team mode</h3>
                </div>
                
                <div className="team-form">
                    <div className="form-group">
                        <label>Team name</label>
                        <div className="input-minimal">
                            <input type="text" placeholder="Enter Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Team member</label>
                        
                        {/* Row 1: You */}
                        <div className="member-row">
                            <div className="col-label">You</div>
                            <div className="input-minimal">
                                <input type="text" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} placeholder="Enter email for member" />
                            </div>
                            <div className="role-col">
                                <div className="role-header-group">
                                    <span className="role-main-label">Role Selection</span>
                                    <span className="role-sub-label">What is Role Selection?</span>
                                </div>
                                <select className="role-select purple" value={myRole} onChange={(e) => setMyRole(e.target.value)}>
                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div></div><div></div>
                        </div>

                        {/* Row 2: Other */}
                        <div className="member-row">
                            <div className="col-label">Other</div>
                            <div className="input-minimal">
                                <input type="text" value={member2Email} onChange={(e) => setMember2Email(e.target.value)} placeholder="Enter email for member" />
                            </div>
                            <div className="role-col">
                                <select className="role-select purple" value={member2Role} onChange={(e) => setMember2Role(e.target.value)}>
                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button className={`btn-send-small ${member2Email.trim() !== '' ? 'active' : ''}`}>Send</button>
                            <button className="btn-share">Share 🔗</button>
                        </div>

                        {/* Row 3: Other */}
                        <div className="member-row">
                            <div className="col-label"></div>
                            <div className="input-minimal">
                                <input type="text" value={member3Email} onChange={(e) => setMember3Email(e.target.value)} placeholder="Enter email for member" />
                            </div>
                            <div className="role-col">
                                <select className="role-select purple" value={member3Role} onChange={(e) => setMember3Role(e.target.value)}>
                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button className={`btn-send-small ${member3Email.trim() !== '' ? 'active' : ''}`}>Send</button>
                            <button className="btn-share">Share 🔗</button>
                        </div>

                        {/* Row 4: Other */}
                        <div className="member-row">
                            <div className="col-label"></div>
                            <div className="input-minimal">
                                <input type="text" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Enter email for member" />
                            </div>
                            <div className="role-col">
                                <select className="role-select purple" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}>
                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button className={`btn-send-small ${newMemberEmail.trim() !== '' ? 'active' : ''}`}>Send</button>
                            <button className="btn-share">Share 🔗</button>
                        </div>

                        <div className="form-footer-actions">
                            <button className="btn-edit-gray">Edit</button>
                            <button className="btn-ok-green" onClick={handleTeamSetupOk}>OK</button>
                        </div>
                    </div>
                </div>
                </div>
            )}
          </div> 
        </div>
      </main>
    </div>
  );
}

export default AccountPage;