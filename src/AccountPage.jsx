import React, { useState, useEffect } from 'react';
import './AccountPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Globe, User, Clock, ChevronRight, Megaphone, Building2, Share2, Edit3, ChevronDown } from 'lucide-react';

function AccountPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [joinCode, setJoinCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const ROLES = ['CEO', 'Finance', 'Marketing', 'HR'];

  const [teamRoles, setTeamRoles] = useState({
    you: 'CEO',
    member2: '',
    member3: '',
    member4: ''
  });

  const handleRoleChange = (currentMemberKey, newRole) => {
    setTeamRoles(prevRoles => {
      const memberHoldingThisRole = Object.keys(prevRoles).find(
        key => prevRoles[key] === newRole && key !== currentMemberKey
      );
      const oldRole = prevRoles[currentMemberKey];
      let newState = { ...prevRoles, [currentMemberKey]: newRole };
      
      if (memberHoldingThisRole) {
        newState[memberHoldingThisRole] = oldRole;
      }
      return newState;
    });
  };

  const handleJoinClick = () => {
      if (joinCode.trim() !== '') {
          setIsJoined(true);
          setShowTeamSetup(true);
      }
  };

  // Mock Data
  const gameHistory = [
    { id: 1, name: 'Grand Coastal Resort', detail: 'Chiang Mai Series', info: '2nd Place of 8 players', turns: '12/12 Turns', date: 'Nov 10, 2024', rankType: 'silver' },
    { id: 2, name: 'Metropolis Business Hotel', detail: 'Bangkok League 2023', info: '1st Place of 6 players', turns: '10/10 Turns', date: 'Oct 25, 2024', rankType: 'gold' },
    { id: 3, name: 'Sunset Beach Resort', detail: 'Coastal Challenge', info: '5th Place of 10 players', turns: '8/8 Turns', date: 'Oct 5, 2024', rankType: 'trophy' },
  ];

  const allAnnouncements = [
    { id: 1, type: 'important', title: 'Important: Read Case Study Before Turn 3', desc: 'All teams must review the industry analysis case study before making Turn 3 decisions.', author: 'Dr. Somchai', date: 'Nov 15, 2024', hasTag: true },
    { id: 2, type: 'normal', title: 'Maintenance Notice', desc: 'System maintenance scheduled.', author: 'Admin', date: 'Nov 13, 2024', hasTag: false },
    { id: 3, type: 'normal', title: 'Week 2 Ranking Released', desc: 'Leaderboard updated.', author: 'Game Master', date: 'Nov 12, 2024', hasTag: false },
    { id: 4, type: 'normal', title: 'New Feature: Market Analysis', desc: 'Competitor pricing view.', author: 'Dev Team', date: 'Nov 10, 2024', hasTag: false }
  ];

  const displayedAnnouncements = isExpanded ? allAnnouncements : allAnnouncements.slice(0, 2);

  return (
    <div className="account-container">
      {/* Header */}
      <nav className="account-header">
        <div className="header-left">
          <Building2 size={24} color="#1a1a1a" />
          <span className="header-title">Hotel Business Simulator</span>
        </div>
        <div className="header-right">
          <button className="lang-btn"><Globe size={18} /> EN</button>
          <Link to="/settings" className="header-btn settings-btn"><Settings size={16} /> Settings</Link>
          <Link to="/login" className="header-btn logout-btn"><LogOut size={16} /> Log Out</Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="welcome-section">
          <div className="user-avatar-circle"><User size={40} strokeWidth={1.5} color="#333" /></div>
          <h1>Hello, Jane !</h1>
        </div>

        <div className="dashboard-grid">
          
          <div className="left-column">
            <div className="card join-game-card">
              <h3>Join Game</h3>
              <input type="text" className="join-input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={isJoined ? "AX063" : ""} disabled={isJoined} />
              <p className="helper-text">If you don't have a game access code, <a href="#">click here.</a></p>
              <button className={`join-btn ${joinCode.trim() !== '' && !isJoined ? 'active' : ''}`} disabled={joinCode.trim() === '' || isJoined} onClick={handleJoinClick}>
                {isJoined ? 'Joined' : 'Join'}
              </button>
            </div>

            <div className="card join-team-card">
              <h3>Join Team</h3>
              <div className="team-invite-placeholder"></div>
              <div className="join-team-actions">
                <button className="btn-deny" disabled>Deny</button>
                <button className="btn-accept" disabled>Accept</button>
              </div>
            </div>

            <div className="card history-card-section">
              <div className="card-header-row">
                <div className="header-with-icon"><Clock size={20} className="icon-clock" /><h3>History</h3></div>
                <span className="badge-count">3</span>
              </div>
              <div className="history-list">
                {gameHistory.map(game => (
                  <div key={game.id} className="history-item">
                    <div className="history-top-row">
                        <h4>{game.name}</h4>
                        <div className="rank-icon">
                             {game.rankType === 'silver' && <span className="medal silver">🥈</span>}
                             {game.rankType === 'gold' && <span className="medal gold">🥇</span>}
                             {game.rankType === 'trophy' && <span className="medal trophy">🏆</span>}
                        </div>
                    </div>
                    <p className="sub-detail">{game.detail}</p>
                    <p className="sub-detail">{game.info}</p>
                    <div className="history-footer"><span>{game.turns}</span><span className="date-text">📅 {game.date}</span></div>
                    <div className="view-report-link"><a href="#">View Report <ChevronRight size={14}/></a></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="card announcements-card">
              <div className="card-header-row">
                 <div className="header-with-icon"><Megaphone size={20} className="icon-megaphone" /><h3>Announcements</h3></div>
                 <span className="badge-count">{allAnnouncements.length}</span>
              </div>
              <div className="announcement-list">
                {displayedAnnouncements.map((item) => (
                  <div key={item.id} className={`announcement-item ${item.type}`}>
                    {item.hasTag && <div className="admin-tag">Admin</div>}
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <div className="ann-meta"><span>👤 {item.author}</span><span>📅 {item.date}</span></div>
                  </div>
                ))}
              </div>
              <div className="view-all-ann">
                 <span className="view-all-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'View Less' : 'View All'} <ChevronRight size={14} style={{transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)', transition: '0.2s'}}/>
                 </span>
              </div>
            </div>

            {showTeamSetup && (
                <div className="team-setup-card-inline">
                    <div className="team-setup-header-tag">
                        Team Setup : Team mode
                    </div>
                    
                    <div className="team-form-body">
                        <div className="form-group">
                            <label>Team name</label>
                            <input type="text" placeholder="Enter Team name" className="form-input" />
                        </div>

                        <div className="form-group">
                            {/* หัวข้อหลัก */}
                            <label style={{marginBottom:'10px'}}>Team member</label>
                            
                            {/* ✅ ส่วนหัวตาราง Grid: แยกออกมาเพื่อจัดตำแหน่ง Role Selection ? */}
                            <div className="member-grid-header">
                                <div></div> {/* เว้นที่ Label */}
                                <div></div> {/* เว้นที่ Input */}
                                <div className="role-header-text">Role Selection <span className="q-mark">?</span></div>
                                <div></div> {/* เว้นที่ Actions */}
                            </div>

                            <div className="members-grid-container">
                                {/* Row 1: You */}
                                <div className="member-row">
                                    <div className="col-label">You</div>
                                    <div className="col-input">
                                         <input type="text" value="Janeza@gmail.com" readOnly className="form-input readonly" />
                                    </div>
                                    <div className="col-role">
                                        <div className={`select-wrapper ${teamRoles.you ? 'purple' : 'gray'}`}>
                                            <select className="role-select" value={teamRoles.you} onChange={(e) => handleRoleChange('you', e.target.value)}>
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="select-arrow" />
                                        </div>
                                    </div>
                                    <div className="col-action"></div>
                                </div>

                                {/* Row 2: Other */}
                                <div className="member-row">
                                    <div className="col-label">Other</div>
                                    <div className="col-input input-icon-wrapper">
                                         <input type="text" placeholder="ptest@gmail.com" className="form-input" />
                                         <Edit3 size={14} className="input-icon"/>
                                    </div>
                                    <div className="col-role">
                                        <div className={`select-wrapper ${teamRoles.member2 ? 'purple' : 'gray'}`}>
                                            <select className="role-select" value={teamRoles.member2} onChange={(e) => handleRoleChange('member2', e.target.value)}>
                                                <option value="" disabled>Select Role</option>
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="select-arrow" />
                                        </div>
                                    </div>
                                    <div className="col-action">
                                        <span className="status-pill waiting">Waiting</span>
                                        <button className="pill-btn share"><Share2 size={12}/> Share</button>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="member-row">
                                    <div className="col-label"></div>
                                    <div className="col-input">
                                        <input type="text" placeholder="John.D@gmail.com" className="form-input" />
                                    </div>
                                    <div className="col-role">
                                        <div className={`select-wrapper ${teamRoles.member3 ? 'purple' : 'gray'}`}>
                                            <select className="role-select" value={teamRoles.member3} onChange={(e) => handleRoleChange('member3', e.target.value)}>
                                                <option value="" disabled>Select Role</option>
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="select-arrow" />
                                        </div>
                                    </div>
                                    <div className="col-action">
                                        <span className="status-pill accepted">Accepted</span>
                                        <button className="pill-btn share"><Share2 size={12}/> Share</button>
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="member-row">
                                    <div className="col-label"></div>
                                    <div className="col-input">
                                        <input type="text" placeholder="san@gmail.com" className="form-input" />
                                    </div>
                                    <div className="col-role">
                                        <div className={`select-wrapper ${teamRoles.member4 ? 'purple' : 'gray'}`}>
                                            <select className="role-select" value={teamRoles.member4} onChange={(e) => handleRoleChange('member4', e.target.value)}>
                                                <option value="" disabled>Select Role</option>
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="select-arrow" />
                                        </div>
                                    </div>
                                    <div className="col-action">
                                        <button className="pill-btn send">Send</button>
                                        <button className="pill-btn share"><Share2 size={12}/> Share</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-footer">
                            <button className="footer-btn edit">Edit</button>
                            <button className="footer-btn ok" onClick={() => setShowTeamSetup(false)}>OK</button>
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