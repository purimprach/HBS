import React from "react";

function AccountPageModals({
  showTeamNameWarning,
  setShowTeamNameWarning,
  roleNotice,
  setRoleNotice,
  markRoleNoticeSeen,
  hostNotice,
  setHostNotice,
  markHostNoticeSeen,
  systemNotice,
  setSystemNotice,
  markRemovedNoticeSeen,
  resetAllUIState,
  teamUpdateNotice,
  setTeamUpdateNotice,
  markTeamUpdateSeen,
  showRemoveModal,
  removeTarget,
  closeRemoveConfirm,
  confirmRemoveAccepted,
  showLeaveModal,
  closeLeaveConfirm,
  confirmLeaveTeam,
  inviteView,
  teamName,
  showExitModal,
  closeExitModal,
  exitMode,
  resetTeamAndGame_NoConfirm,
  leaveTeamAndNotifyHost,
}) {
  return (
    <>
      {showTeamNameWarning && (
        <div className="sysmodal-backdrop">
          <div className="sysmodal-card sysmodal-success">
            <div className="sysmodal-header">
              <div className="sysmodal-title">
                <span className="sysmodal-icon" aria-hidden="true">✅</span>
                กรุณาใส่ชื่อทีมก่อน
              </div>

              <button
                className="sysmodal-close"
                onClick={() => setShowTeamNameWarning(false)}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="sysmodal-body">
              <div className="sysmodal-message">
                โปรดกรอกชื่อทีมก่อนส่งคำเชิญผู้เล่น
              </div>
            </div>

            <div className="sysmodal-actions">
              <button
                className="sysmodal-btn sysmodal-btn-success"
                type="button"
                onClick={() => setShowTeamNameWarning(false)}
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
      {roleNotice && (
        <div className="rolemodal-backdrop">
          <div className="rolemodal-card">
            <div className="rolemodal-topbar">
              <div className="rolemodal-top-title">Your role was changed.</div>
            </div>

            <div className="rolemodal-body">
              <div className="rolemodal-compare">
                <div className="rolemodal-col">
                  <div className="rolemodal-label">Old role</div>
                  <div className="rolemodal-pill">{roleNotice.oldRole}</div>
                </div>

                <div className="rolemodal-arrow">→</div>

                <div className="rolemodal-col">
                  <div className="rolemodal-label new">New role</div>
                  <div className="rolemodal-pill new">{roleNotice.newRole}</div>
                </div>
              </div>

              <button
                className="rolemodal-closebtn"
                type="button"
                onClick={() => {
                  markRoleNoticeSeen(roleNotice);
                  setRoleNotice(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {hostNotice && (
        <div className="sysmodal-backdrop">
          <div className="sysmodal-card">
            <div className="sysmodal-header">
              <div className="sysmodal-title">
                <span className="sysmodal-icon" aria-hidden="true">👤</span>
                {hostNotice.title}
              </div>
              <button
                className="sysmodal-close"
                onClick={() => setHostNotice(null)}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="sysmodal-body">
              <div className="sysmodal-message">{hostNotice.message}</div>
            </div>

            <div className="sysmodal-actions">
              <button
                className="sysmodal-btn"
                type="button"
                onClick={() => {
                  markHostNoticeSeen(hostNotice);
                  setHostNotice(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {systemNotice && (
        <div className="sysmodal-backdrop">
          <div className="sysmodal-card">
            <div className="sysmodal-header">
              <div className="sysmodal-title">
                <span className="sysmodal-icon" aria-hidden="true">👤</span>
                {systemNotice.title || "Team Update"}
              </div>
              <button
                className="sysmodal-close"
                onClick={() => {
                  markRemovedNoticeSeen(systemNotice);
                  setSystemNotice(null);
                  resetAllUIState();
                }}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="sysmodal-body">
              <div className="sysmodal-message">
                {systemNotice.message}
              </div>
            </div>

            <div className="sysmodal-actions">
              <button
                className="sysmodal-btn"
                type="button"
                onClick={() => {
                  markRemovedNoticeSeen(systemNotice);
                  setSystemNotice(null);
                  resetAllUIState();
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {teamUpdateNotice && (
        <div className="sysmodal-backdrop">
          <div className="sysmodal-card">
            <div className="sysmodal-header">
              <div className="sysmodal-title">
                <span className="sysmodal-icon" aria-hidden="true">👤</span>
                {teamUpdateNotice.title}
              </div>
              <button
                className="sysmodal-close"
                onClick={() => {
                  markTeamUpdateSeen(teamUpdateNotice);
                  setTeamUpdateNotice(null);
                }}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="sysmodal-body">
              <div className="sysmodal-message">
                {teamUpdateNotice.message}
              </div>
            </div>

            <div className="sysmodal-actions">
              <button
                className="sysmodal-btn"
                type="button"
                onClick={() => {
                  markTeamUpdateSeen(teamUpdateNotice);
                  setTeamUpdateNotice(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showRemoveModal && removeTarget && (
        <div className="remmodal-backdrop">
          <div className="remmodal-card">
            <div className="remmodal-header">
              <div className="remmodal-title">
                <span className="remmodal-usericon" aria-hidden="true">👤</span>
                Confirm Remove Player
              </div>

              <button
                className="remmodal-close"
                onClick={closeRemoveConfirm}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="remmodal-body">
              <div className="remmodal-question">
                Are you sure you want to remove this player?
              </div>

              <div className="remmodal-player">
                <span className="remmodal-playericon" aria-hidden="true">👥</span>
                <span className="remmodal-email">{removeTarget.email}</span>
              </div>
            </div>

            <div className="remmodal-actions">
              <button
                className="remmodal-btn cancel"
                onClick={closeRemoveConfirm}
                type="button"
              >
                Cancel
              </button>

              <button
                className="remmodal-btn confirm"
                onClick={confirmRemoveAccepted}
                type="button"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {showLeaveModal && (
        <div className="remmodal-backdrop">
          <div className="remmodal-card">
            <div className="remmodal-header">
              <div className="remmodal-title">
                <span className="remmodal-usericon" aria-hidden="true">👤</span>
                Confirm Leave Team
              </div>

              <button
                className="remmodal-close"
                onClick={closeLeaveConfirm}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="remmodal-body">
              <div className="remmodal-question">
                Are you sure you want to leave team{" "}
                <b>"{(inviteView?.teamName || teamName || "this team").trim()}"</b>?
              </div>
            </div>

            <div className="remmodal-actions">
              <button
                className="remmodal-btn cancel"
                onClick={closeLeaveConfirm}
                type="button"
              >
                Cancel
              </button>

              <button
                className="remmodal-btn confirm"
                onClick={confirmLeaveTeam}
                type="button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showExitModal && (
        <div className="remmodal-backdrop">
          <div className="remmodal-card">
            <div className="remmodal-header">
              <div className="remmodal-title">
                <span className="remmodal-usericon" aria-hidden="true">👤</span>
                {exitMode === "delete" ? "Confirm Delete Team" : "Confirm Leave Team"}
              </div>

              <button
                className="remmodal-close"
                onClick={closeExitModal}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="remmodal-body">
              <div className="remmodal-question">
                {exitMode === "delete"
                  ? "Are you sure you want to delete this team? All draft/invites will be cleared."
                  : "Are you sure you want to leave this team?"}
              </div>
            </div>

            <div className="remmodal-actions">
              <button className="remmodal-btn cancel" onClick={closeExitModal} type="button">
                Cancel
              </button>

              <button
                className="remmodal-btn confirm"
                type="button"
                onClick={() => {
                  closeExitModal();
                  if (exitMode === "delete") resetTeamAndGame_NoConfirm();
                  else leaveTeamAndNotifyHost();
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AccountPageModals;