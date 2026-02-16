// src/notifications.js
const STORAGE_KEY = "hbs_notifications_v1";

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function normEmail(email) {
  return (email || "").trim().toLowerCase();
}

function readAll() {
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * noti: { type: "info"|"warning"|"danger", message, gameCode }
 */
export function pushNotification(email, noti) {
  const e = normEmail(email);
  if (!e) return;

  const list = readAll();

  const item = {
    id: `noti_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: e,
    type: noti?.type || "info",
    message: noti?.message || "",
    gameCode: noti?.gameCode || "",
    createdAt: new Date().toISOString(),
    read: false,
  };

  list.unshift(item);
  writeAll(list);

  // ✅ ให้หน้าเดียวกัน re-render ได้ด้วย (ไม่ใช่แค่ข้ามแท็บ)
  window.dispatchEvent(new Event("hbs_notifications_changed"));
}

export function getNotificationsForEmail(email) {
  const e = normEmail(email);
  const list = readAll();
  return list.filter((x) => normEmail(x.email) === e);
}

export function getUnreadCountForEmail(email) {
  return getNotificationsForEmail(email).filter((x) => !x.read).length;
}

export function markAllReadForEmail(email) {
  const e = normEmail(email);
  if (!e) return;

  const list = readAll().map((x) =>
    normEmail(x.email) === e ? { ...x, read: true } : x
  );

  writeAll(list);
  window.dispatchEvent(new Event("hbs_notifications_changed"));
}

export function markReadForEmail(email, id) {
  const e = normEmail(email);
  if (!e || !id) return;

  const list = readAll().map((x) =>
    normEmail(x.email) === e && x.id === id ? { ...x, read: true } : x
  );

  writeAll(list);
  window.dispatchEvent(new Event("hbs_notifications_changed"));
}
