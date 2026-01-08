// src/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // อ่านค่าเดิมจาก LocalStorage ถ้าไม่มีให้เป็น 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // ✅ บรรทัดนี้สำคัญที่สุด: สั่งเปลี่ยน Class ที่ <body> จริงๆ
    document.body.className = theme; 
  }, [theme]);

  const toggleTheme = (mode) => {
    setTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);