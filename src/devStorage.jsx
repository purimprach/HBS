// ⭐ DEV MULTI CLIENT STORAGE WRAPPER
export function makeScopedStorage(clientId) {
  const prefix = clientId ? `__${clientId}` : "";

  const scopedKey = (key) => `${key}${prefix}`;

  return {
    getItem(key) {
      return localStorage.getItem(scopedKey(key));
    },
    setItem(key, value) {
      localStorage.setItem(scopedKey(key), value);

      // ยิง event ให้ panel อื่น sync
      window.dispatchEvent(new Event("hbs:games"));
      window.dispatchEvent(new Event("hbs:teams"));
      window.dispatchEvent(new Event("hbs:noti"));
    },
    removeItem(key) {
      localStorage.removeItem(scopedKey(key));
    },
  };
}