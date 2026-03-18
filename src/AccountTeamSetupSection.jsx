import React from "react";

function AccountTeamSetupSection({
    isJoined,
    teamSetupModeLabel,
    isTeamSetupReadOnly,
    inviteView,
    teamName,
    setTeamName,
    canOk,
    handleOkClick,
    okLabel,
    isHost,
    openExitModal,
    openLeaveConfirm,
    isAcceptedInvite,
    teamLimit,
    isTeamSetupLocked,
    children,
}) {
    return (
        <>
            <div className="team-setup-header-tag">
                Team Setup {isJoined ? `: ${teamSetupModeLabel || ""}` : ""}
            </div>

            <div className="form-group">
                <label>Team name</label>
                <input
                    type="text"
                    placeholder="กรุณาใส่ชื่อทีม"
                    className="form-input teamname-input"
                    value={isTeamSetupReadOnly ? (inviteView?.teamName || teamName || "") : teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={!isJoined || isTeamSetupReadOnly}
                />
            </div>

            <div className="member-grid-header">
                <div>Members</div>
                <div>Role</div>
                <div>Action</div>
            </div>

            {children}
            <div className="team-bottom-bar">
                <button
                    className="team-exit-btn"
                    type="button"
                    onClick={() => {
                        if (isHost) openExitModal("delete");
                        else openLeaveConfirm();
                    }}
                    disabled={isHost ? (!isJoined || isTeamSetupReadOnly) : (!isJoined && !isAcceptedInvite)}
                >
                    {isHost ? "Delete Team" : "Leave Team"}
                </button>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <button
                        className={`footer-btn ok ${canOk ? "active" : "disabled"}`}
                        onClick={handleOkClick}
                        type="button"
                        disabled={!canOk || isTeamSetupReadOnly}
                    >
                        OK ({okLabel})
                    </button>

                    {teamLimit.type === "other" && (
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                            Min {teamLimit.minTotal} • Max {teamLimit.maxTotal} people
                        </div>
                    )}
                </div>
            </div>

            {isTeamSetupLocked && (
                <div className="team-setup-lock">
                    <div className="lock-card">
                        <div className="lock-icon">🔒</div>
                        <div className="lock-title">This section is Locked</div>
                        <div className="lock-desc">
                            Please enter <span className="lock-highlight">Game Code</span> to create team
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AccountTeamSetupSection;