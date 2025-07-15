import React, { useEffect, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";

// Helper to generate fake play counts
const generateFakePlays = (weekDays: Date[]) => {
  const counts: Record<string, number> = {};
  for (const d of weekDays) {
    const dateStr = format(d, "yyyy-MM-dd");
    counts[dateStr] = Math.floor(Math.random() * 50); // 0–49 plays
  }
  return counts;
};

export default function DoBeMosaic() {
  const [mode, setMode] = useState<"timewave" | "soundwave" | "xibit">("soundwave");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [playsData, setPlaysData] = useState<Record<string, number>>({});

  // Recalculate week on date change
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  }, [selectedDate]);

  // Load fake placeholder data
  useEffect(() => {
    if (weekDays.length) {
      const fakeData = generateFakePlays(weekDays);
      setPlaysData(fakeData);
    }
  }, [weekDays]);

  return (
    <div
      style={{
        background: "#111",
        color: "#eee",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Exchange Cards Table */}
      <div
        style={{
          width: "100%",
          height: "40vh",
          overflowY: "auto",
          borderBottom: "2px solid #333",
          paddingTop: 20,
        }}
      >
        {["Soundwave Exchange", "Timewave Exchange", "Xibit Exchange"].map((ex, i) => (
          <div
            key={i}
            style={{
              background: "#222",
              border: "1px solid #444",
              borderRadius: 12,
              padding: "18px 24px",
              margin: "12px auto",
              maxWidth: 640,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>{ex}</div>
            <div style={{ fontSize: 14, color: "#aaa" }}>
              Example payout or exchange shown here
            </div>
          </div>
        ))}
      </div>

      {/* Mode Toggle Switch */}
      <div
        style={{
          width: "100%",
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "2px solid #333",
        }}
      >
        {(["timewave", "soundwave", "xibit"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "10px 20px",
              margin: "0 6px",
              background: mode === m ? "#2563eb" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Bottom Calendar + Stats */}
      <div
        style={{
          flex: 1,
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Date Picker */}
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #555",
            background: "#222",
            color: "#eee",
            fontSize: 15,
            marginBottom: 16,
          }}
        />

        {/* Daily Stats Rows */}
        {weekDays.map((d) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const plays = playsData[dateStr] || 0;
          const revenue = plays * 11;
          return (
            <div
              key={dateStr}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 18,
                background: "#222",
                padding: "10px 16px",
                borderRadius: 8,
                width: "90%",
                maxWidth: 600,
              }}
            >
              {/* Left: Plays */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{plays}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>Plays</div>
              </div>

              {/* Center: Date Button */}
              <button
                style={{
                  flex: 1,
                  background: "#333",
                  border: "none",
                  borderRadius: 6,
                  color: "#eee",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                {format(d, "MMM dd")}
              </button>

              {/* Right: Revenue */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>${revenue.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>Revenue</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
