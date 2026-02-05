// InvitePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GAMES_KEY = "hbs_games";
const PLAYER_SESSION_KEY = "hbs_current_player";

function safeJSONParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    // คืนค่า fallback (เช่น []) หากข้อมูลเป็น null เพื่อป้องกัน Error
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function normalizeEmail(s) {
  return (s || "").trim().toLowerCase();
}

export default function InvitePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const gameCode = (params.get("gameCode") || "").trim();
  const teamId = (params.get("teamId") || "").trim();
  const inviteEmailFromUrl = normalizeEmail(params.get("email") || "");

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [inviteInfo, setInviteInfo] = useState(null); 
  const [error, setError] = useState("");

  // 1) Guard: ตรวจสอบการ Login
  useEffect(() => {
    const p = safeJSONParse(localStorage.getItem(PLAYER_SESSION_KEY), null);
    
    if (!p?.id) {
      // 🚩 กรณีไม่พบ Session: ดึง hostEmail และเตรียมข้อมูล Redirect ไปหน้า Login
      const hostEmail = params.get("hostEmail") || "";
      const currentPath = location.pathname + location.search;
      const encodeRedirect = encodeURIComponent(currentPath);
      
      navigate(`/login?redirect=${encodeRedirect}&hostEmail=${encodeURIComponent(hostEmail)}`, { replace: true });
    } else {
      // ✅ พบ Session: ตั้งค่า Player เพื่อเริ่มโหลดข้อมูลใน Step ถัดไป
      setCurrentPlayer(p);
    }
  }, [location.pathname, location.search, navigate, params]);

  // 2) เมื่อ Login แล้ว -> โหลดข้อมูล Invite จาก Storage
  useEffect(() => {
    // ต้อง Login สำเร็จก่อนถึงจะรันส่วนนี้
    if (!currentPlayer?.id) return;
    setError("");

    if (!gameCode || !teamId) {
      setError("ลิงก์เชิญไม่ครบ (ต้องมี gameCode และ teamId)");
      return;
    }

    const games = safeJSONParse(localStorage.getItem(GAMES_KEY), []);
    const game = games.find((g) => g.code === gameCode);
    if (!game) {
      setError("ไม่พบเกมนี้ในระบบ");
      return;
    }

    const team = (game.teams || []).find((t) => t.id === teamId);
    if (!team) {
      setError("ไม่พบทีมนี้ในเกม");
      return;
    }

    const myEmail = normalizeEmail(currentPlayer.email);
    const targetEmail = inviteEmailFromUrl || myEmail;

    const inv = (team.invites || []).find(
      (x) => normalizeEmail(x.email) === targetEmail
    );

    setInviteInfo({ game, team, invite: inv || null, targetEmail });
  }, [currentPlayer, gameCode, teamId, inviteEmailFromUrl]);

  const handleAccept = () => {
    if (!currentPlayer?.id || !inviteInfo?.game || !inviteInfo?.team) return;

    const games = safeJSONParse(localStorage.getItem(GAMES_KEY), []);
    const gi = games.findIndex((g) => g.code === gameCode);
    if (gi === -1) return;

    const game = games[gi];
    const team = (game.teams || []).find((t) => t.id === teamId);
    if (!team) return;

    const myEmail = normalizeEmail(currentPlayer.email);
    const targetEmail = inviteEmailFromUrl || myEmail;

    team.invites = team.invites || [];
    const inv = team.invites.find((x) => normalizeEmail(x.email) === targetEmail);
    if (inv) {
      inv.status = "accepted";
      inv.acceptedAt = new Date().toISOString();
    }

    game.players = game.players || [];
    let p = game.players.find((pp) => pp.playerId === currentPlayer.id);
    if (!p) {
      p = {
        playerId: currentPlayer.id,
        name: currentPlayer.name || "Player",
        email: currentPlayer.email || "",
        teamId: team.id,
        ready: false,
        joinedAt: new Date().toISOString(),
      };
      game.players.push(p);
    } else {
      p.teamId = team.id;
    }

    team.members = team.members || [];
    if (!team.members.includes(currentPlayer.id)) {
      team.members.push(currentPlayer.id);
    }

    games[gi] = game;
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));

    navigate("/waiting-room", { state: { gameCode: game.code } });
  };

  const handleDeny = () => {
    if (!currentPlayer?.id || !inviteInfo?.game || !inviteInfo?.team) return;

    const games = safeJSONParse(localStorage.getItem(GAMES_KEY), []);
    const gi = games.findIndex((g) => g.code === gameCode);
    if (gi === -1) return;

    const game = games[gi];
    const team = (game.teams || []).find((t) => t.id === teamId);
    if (!team) return;

    const myEmail = normalizeEmail(currentPlayer.email);
    const targetEmail = inviteEmailFromUrl || myEmail;

    team.invites = team.invites || [];
    const inv = team.invites.find((x) => normalizeEmail(x.email) === targetEmail);
    if (inv) {
      inv.status = "denied";
      inv.deniedAt = new Date().toISOString();
    }

    games[gi] = game;
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));

    navigate("/account", { replace: true });
  };

  // ระหว่างที่ระบบกำลังพาไปหน้า Login ไม่ต้องแสดงผล UI
  if (!currentPlayer?.id) return null;

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "#f9fafb" }}>
      <h1 style={{ textAlign: "center", marginBottom: 18, fontWeight: 700 }}>คำเชิญเข้าทีม</h1>

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          background: "#fff",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}
      >
        {error ? (
          <div style={{ color: "#dc2626", textAlign: "center", fontWeight: 600 }}>{error}</div>
        ) : (
          <>
            <div style={{ lineHeight: 2, fontSize: "0.95rem", color: "#374151" }}>
              <div>
                <strong>Game:</strong> {inviteInfo?.game?.name} ({inviteInfo?.game?.code})
              </div>
              <div>
                <strong>Team:</strong> {inviteInfo?.team?.name || "Draft Team"}
              </div>
              <div>
                <strong>Role:</strong> <span style={{ color: "#7c3aed", fontWeight: 700 }}>{inviteInfo?.invite?.role || "-"}</span>
              </div>
              <div>
                <strong>Status:</strong> <span style={{ textTransform: "capitalize" }}>{inviteInfo?.invite?.status || "pending"}</span>
              </div>
              <div>
                <strong>For email:</strong> {inviteInfo?.targetEmail}
              </div>

              {!inviteInfo?.invite && (
                <div style={{ marginTop: 12, padding: 12, background: "#fffbeb", borderRadius: 8, color: "#92400e", fontSize: "0.85rem" }}>
                  ⚠️ ไม่พบรายการเชิญของอีเมลนี้ในระบบ (กรุณาตรวจสอบอีเมลที่ใช้ Login ให้ตรงกับลิงก์เชิญ)
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center" }}>
              <button
                onClick={handleDeny}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Deny
              </button>

              <button
                onClick={handleAccept}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}