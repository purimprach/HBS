import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1) สั่ง Window ให้เลื่อนขึ้น (เผื่อ Layout เปลี่ยนไปใช้ Window scroll)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // 2) ✅ เลื่อนกล่องเนื้อหาหลัก (ของคุณคือ .main-content-area)
    const mainContainer =
      document.querySelector(".main-content-area") ||
      document.querySelector(".dashboard-content") ||
      document.querySelector("main");

    if (mainContainer && typeof mainContainer.scrollTo === "function") {
      // ใช้ 'instant' เพื่อให้ดีดขึ้นทันที ไม่ต้องรอมันค่อยๆ เลื่อน
      mainContainer.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}