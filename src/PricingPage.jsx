import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DecisionPage.css";
import "./PricingPage.css";

import {
  Banknote, Bed, Users, Check,
  PieChart, Tag, Megaphone, Wrench,
  Plus, Minus, TrendingUp, TrendingDown,
} from "lucide-react";

const TOTAL_BUDGET = 10_000_000;
const STORAGE_KEY_BUDGETS = "hbs_round1_decision_budgets";
const STORAGE_KEY_PRICING = "hbs_round1_pricing_rooms";

const DEFAULT_ROOMS = [
  {
    id: 1,
    name: "ห้องมาตรฐาน A (Standard A)",
    price: 800,
    prevPrice: 800,
    min: 500,
    max: 1100,
    step: 50,
    count: 40,
  },
  {
    id: 2,
    name: "ห้องมาตรฐาน B วิวภูเขา (Standard B Mountain)",
    price: 1200,
    prevPrice: 1200,
    min: 800,
    max: 1600,
    step: 50,
    count: 30,
  },
  {
    id: 3,
    name: "ห้องดีลักซ์ (Deluxe)",
    price: 2500,
    prevPrice: 2500,
    min: 1800,
    max: 3200,
    step: 100,
    count: 20,
  },
  {
    id: 4,
    name: "ห้องสวีท (Suite)",
    price: 4500,
    prevPrice: 4500,
    min: 3200,
    max: 5800,
    step: 100,
    count: 10,
  },
  {
    id: 5,
    name: "ห้องสวีทแบบครอบครัว (Family Suite)",
    price: 6000,
    prevPrice: 6000,
    min: 4200,
    max: 7800,
    step: 100,
    count: 10,
  },
];

const formatMoney = (num) => (Number(num) || 0).toLocaleString();

const getChangePercent = (current, prev) => {
  if (!prev) return current === 0 ? 0 : 100;
  return ((current - prev) / prev) * 100;
};

export default function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getBudgetFromStorage = (id) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.budgets?.find((b) => b.id === id)?.value || 0;
      }
    } catch (e) {
      console.error("Error loading budget", e);
    }
    return 0;
  };

  const [isSaved, setIsSaved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRICING);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!parsed.isSaved;
      } catch (e) {}
    }
    return false;
  });

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRICING);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.rooms)) return parsed.rooms;
      } catch (e) {}
    }
    return DEFAULT_ROOMS;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_PRICING,
      JSON.stringify({ rooms, isSaved })
    );
  }, [rooms, isSaved]);

  const adjustPrice = (id, amount) => {
    if (isSaved) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== id) return room;
        const next = (room.price || 0) + amount;
        const clamped = Math.min(room.max, Math.max(room.min, next));
        return { ...room, price: clamped };
      })
    );
  };

  const setPriceExact = (id, value) => {
    if (isSaved) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== id) return room;
        const num = Number(value) || 0;
        const clamped = Math.min(room.max, Math.max(room.min, num));
        return { ...room, price: clamped };
      })
    );
  };

  const handleSave = () => {
    if (isSaved) return;
    if (window.confirm("ยืนยันการบันทึกราคาห้องพัก?")) setIsSaved(true);
  };

  const commonState = {
    ceoCash: location.state?.ceoCash ?? TOTAL_BUDGET,
    ceoMarketSharePrev: location.state?.ceoMarketSharePrev ?? 12,
    ceoSatisfaction: location.state?.ceoSatisfaction ?? 3.5,
    ceoAssetHealth: location.state?.ceoAssetHealth ?? 95,
  };

  return (
    <div className="decision-page pricing-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">จำนวนห้องที่ใช้งานได้</span>
            <div className="stat-icon-box">
              <Bed size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-value">110</div>
          <div className="stat-sub">สภาพห้อง : 100%</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ผู้เข้าพักเฉลี่ยไตรมาสที่แล้ว</span>
            <div className="stat-icon-box">
              <Users size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-value">72%</div>
          <div className="stat-sub">อยู่ในเกณฑ์ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">รายได้ไตรมาสที่แล้ว</span>
            <div className="stat-icon-box">
              <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>฿</span>
            </div>
          </div>
          <div className="stat-value">4,816,800</div>
          <div className="stat-sub">สถานะ : ดี</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ความต้องการในการตลาด</span>
            <div className="stat-icon-box">
              <Megaphone size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.6rem" }}>
            ระดับกลาง
          </div>
          <div className="stat-sub">ในช่วงไตรมาสที่ 1</div>
        </div>
      </div>

      <div className="decision-tabs">
        <button className="tab-btn" onClick={() => navigate("/decision")}>
          <PieChart size={15} /> <span>การจัดสรรเงิน</span>
        </button>

        <button className="tab-btn active">
          <Tag size={15} /> <span>การกำหนดราคาห้องพัก</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/marketing", {
              state: {
                ...commonState,
                ceoMarketingBudget: mktBudget,
                ceoHRBudget: hrBudget,
              },
            });
          }}
        >
          <Megaphone size={15} /> <span>การลงทุนด้านการตลาด</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => {
            const mktBudget = getBudgetFromStorage(1);
            const hrBudget = getBudgetFromStorage(2);
            navigate("/personnel", {
              state: {
                ...commonState,
                ceoHRBudget: hrBudget,
                ceoMarketingBudget: mktBudget,
              },
            });
          }}
        >
          <Users size={15} /> <span>การลงทุนด้านบุคลากร</span>
        </button>

        <button className="tab-btn" onClick={() => navigate("/maintenance")}>
          <Wrench size={15} /> <span>การลงทุนด้านการบำรุงรักษา</span>
        </button>

        <button className={`tab-btn ${location.pathname === '/other' ? 'active' : ''}`} onClick={() => navigate('/other')}>
          <Banknote size={15} /> <span>การลงทุนด้านอื่นๆ</span>
        </button>
      </div>

      <div className="decision-content">
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="pricing-page-header">
            <h3>ตั้งราคาห้องพัก</h3>
          </div>

          <div className="price-overview-card">
            {rooms.map((room) => {
              const pct = getChangePercent(room.price, room.prevPrice);
              const isDown = pct < 0;
              const isUp = pct > 0;

              const range = room.max - room.min;
              const progress = range ? ((room.price - room.min) / range) * 100 : 0;
              const markerLeft = Math.max(0, Math.min(100, progress));

              const title = isUp
                ? "ราคาเพิ่มขึ้น"
                : isDown
                ? "ราคาลดลง"
                : "ราคาเท่าเดิม";

              return (
                <div key={room.id} className="price-row">
                  {/* LEFT SECTION */}
                  <div className="price-left">
                    <div className="price-room-head">
                      <div>
                        <span className="price-room-title">{room.name}</span>
                      </div>
                      <span className="price-pill">{room.count} ห้อง</span>
                    </div>

                    <div className="price-track-wrap">
                      <div className="price-slider-group">
                        <div className="price-track-labels">
                          <span>{formatMoney(room.min)}</span>
                          <span>{formatMoney(room.max)}</span>
                        </div>

                        {/* ✅ FIX: เอา .price-track ซ้อนออก เหลือรางเดียว */}
                        <div className="price-track">
                          <div
                            className="price-track-fill"
                            style={{ "--p": markerLeft / 100 }}
                          />

                          <div
                            className="price-marker"
                            style={{ "--p": markerLeft / 100 }}
                          >
                            <div className="price-marker-dot" />
                            <div className="price-marker-badge">
                              {formatMoney(room.price)}
                            </div>
                          </div>

                          <input
                            className="price-range"
                            type="range"
                            min={room.min}
                            max={room.max}
                            step={room.step}
                            value={room.price}
                            disabled={isSaved}
                            onChange={(e) =>
                              setPriceExact(room.id, Number(e.target.value))
                            }
                          />
                        </div>
                      </div>

                      <div className="price-controls-inline">
                        <button
                          className="price-mini-btn"
                          onClick={() => adjustPrice(room.id, -room.step)}
                          disabled={isSaved || room.price <= room.min}
                          title={`ลดครั้งละ ${room.step}`}
                        >
                          <Minus size={18} />
                        </button>
                        <button
                          className="price-mini-btn"
                          onClick={() => adjustPrice(room.id, room.step)}
                          disabled={isSaved || room.price >= room.max}
                          title={`เพิ่มครั้งละ ${room.step}`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION (Graph) */}
                  <div className="price-right">
                    <div className="price-right-top">
                      <div
                        className={`price-pct price-pct-2line ${isDown ? "down" : ""}`}
                      >
                        <div className="pct-title">{title}</div>
                        <div className="pct-value">
                          <span className="pct-icon" aria-hidden="true">
                            {isUp ? (
                              <TrendingUp size={16} />
                            ) : isDown ? (
                              <TrendingDown size={16} />
                            ) : null}
                          </span>
                          <span className="pct-number">
                            {pct > 0 ? "+" : ""}
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const baseMax =
                        room.max || Math.max(room.prevPrice, room.price) || 1;

                      const prevH = Math.max(
                        8,
                        Math.min(100, (room.prevPrice / baseMax) * 100)
                      );
                      const currH = Math.max(
                        8,
                        Math.min(100, (room.price / baseMax) * 100)
                      );

                      return (
                        <div className="price-bar-figma">
                          <div className="bars-figma">
                            <div
                              className="bar-figma prev"
                              style={{ height: `${prevH}%` }}
                            >
                              <div className="bar-num">
                                {formatMoney(room.prevPrice)}
                              </div>
                            </div>
                            <div
                              className="bar-figma curr"
                              style={{ height: `${currH}%` }}
                            >
                              <div className="bar-num">
                                {formatMoney(room.price)}
                              </div>
                            </div>

                            <div className="bar-baseline" />
                          </div>

                          <div className="bar-labels-figma">
                            <div>ราคาปัจจุบัน</div>
                            <div>ราคาใหม่</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bottom-action-bar">
        <div className="break-even-section">
          <div className="be-title">
            คาดการณ์รายได้ (เฉลี่ย) โดยคิดแค่ 60% ของจำนวนห้องพัก
          </div>
          <div className="be-value">
            {formatMoney(
              rooms.reduce((acc, r) => acc + r.price * r.count * 30 * 0.6, 0)
            )}{" "}
            บาท
          </div>
        </div>

        <div className="action-section">
          <button className="confirm-btn-large" onClick={handleSave} disabled={isSaved}>
            <div className="btn-icon-circle">
              <Check size={16} strokeWidth={3} />
            </div>
            {isSaved ? "บันทึกเรียบร้อย" : "บันทึกราคาห้องพัก"}
          </button>
          <div className="action-remark">* หากบันทึกแล้วจะไม่สามารถแก้ไขได้</div>
        </div>
      </div>

      <footer className="decision-footer">
        <div className="footer-text">
          © 2026 Hotel Business Simulation Game. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
