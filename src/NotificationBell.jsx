// src/NotificationBell.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./NotificationBell.css";
import {
  getNotificationsForEmail,
  getUnreadCountForEmail,
  markAllReadForEmail,
  markReadForEmail,
} from "./notifications";
import { Bell } from "lucide-react";

function formatDateTime(iso) {
  try {
    const d = new Date(iso);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.floor((today - target) / 86400000);

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    if (diffDays === 0) {
      return `Today, ${hh}:${mm}`;
    }

    if (diffDays === 1) {
      return `Yesterday, ${hh}:${mm}`;
    }

    // format: 12 Feb 2026, 09:00
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${datePart}, ${hh}:${mm}`;
  } catch {
    return "";
  }
}

export default function NotificationBell({ email }) {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const ref = useRef(null);

  const list = useMemo(() => getNotificationsForEmail(email), [email, tick]);
  const unread = useMemo(() => getUnreadCountForEmail(email), [email, tick]);

  useEffect(() => {
    const onChanged = () => setTick((t) => t + 1);
    const onStorage = (e) => {
      if (e?.key === "hbs_notifications_v1") onChanged();
    };

    window.addEventListener("hbs_notifications_changed", onChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("hbs_notifications_changed", onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // click outside to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="noti-wrap" ref={ref}>
      <button
        className="noti-bellBtn"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && <span className="noti-badge">{unread}</span>}
      </button>

      {open && (
        <div className="noti-pop">
          <div className="noti-head">
            <div className="noti-title">Notification</div>
            <button className="noti-close" onClick={() => setOpen(false)} type="button">
              ✕
            </button>
          </div>

          <button
            className="noti-markall"
            type="button"
            onClick={() => markAllReadForEmail(email)}
            disabled={list.length === 0}
            title="Mark all read"
          >
            Mark all read
          </button>

          <div className="noti-body">
            {list.length === 0 ? (
              <div className="noti-empty">No notifications</div>
            ) : (
              list.map((n) => (
                <button
                  key={n.id}
                  className={`noti-item ${n.type || "info"} ${n.read ? "read" : "unread"}`}
                  type="button"
                  onClick={() => markReadForEmail(email, n.id)}
                  title="Click to mark read"
                >
                  <div className="noti-msg">
                    {n.message}
                    {n.gameCode ? <span className="noti-game"> [{n.gameCode}]</span> : null}
                  </div>

                  <div className="noti-meta">
                    <span className="noti-time">{formatDateTime(n.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
