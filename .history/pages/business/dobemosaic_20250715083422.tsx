// pages/business/dobemosaic.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { startOfWeek, addDays, format, parseISO } from "date-fns";

export default function DoBeMosaic() {
  const [mode, setMode] = useState<"timewave" | "soundwave" | "xibit">("soundwave");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [playsData, setPlaysData] = useState<Record<string, number>>({});

  // Compute current week dates
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  }, [selectedDate]);

  // Load plays data for the week
  const loadData = async () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = addDays(start, 7);

    const { data: plays, error } = await supabase
      .from("plays")
      .select("id, created_at, artists");

    if (error) {
      console.error("Error fetching plays:", error);
      return;
    }

    const counts: Record<string, number> = {};
    for (const d of weekDays) {
      const dateStr = format(d, "yyyy-MM-dd");
      counts[dateStr] = 0;
    }

    plays?.forEach((play) => {
      const playDate = parseISO(play.created_at);
      const dateStr = format(playDate, "yyyy-MM-dd");
      if (counts[dateStr] !== undefined) {
        counts[dateStr] += 1;
      }
    });

    setPlaysData(counts);
  };

  // Fetch data initially
  useEffect(() => {
    if (weekDays.length) loadData();
  }, [weekDays]);

  // Subscribe to new plays in real time
  useEffect(() => {
    const subscription = supabase
      .from("plays")
      .on("INSERT", (payload) => {
        const playDate = parseISO(payload.new.created_at);
        const dateStr = format(playDate, "yyyy-MM-dd");
        if (playsData[dateStr] !== undefined) {
          setPlaysData((prev) => ({
            ...prev,
            [dateStr]: (prev[dateStr] || 0) + 1,
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [playsData]);

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
      {/* Exchange Table */}
      <div
        style={{
          width: "100%",
          height: "40vh",
          overflowY: "auto",
          borderBottom: "2px solid #333",
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
              maxWidth: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>{ex}</div>
            <div style={{ fontSize: 14, color: "#aaa" }}>Past & Scheduled Exchanges</div>
          </div>
        ))}
      </div>

      {/* Mode Toggle */}
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

      {/* Calendar View */}
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

        {/* 7 Days */}
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
              {/* Plays */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{plays}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>Plays</div>
