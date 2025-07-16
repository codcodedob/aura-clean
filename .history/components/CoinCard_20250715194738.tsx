import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Coin {
  id: string;
  name: string;
  emoji?: string;
  price: number;
  cap: number;
  img_Url?: string;
  audio_Url?: string; // for the song
}

export default function CoinCard({
  coin,
  amount,
  onAmountChange,
  onBuy,
}: {
  coin: Coin;
  amount: number;
  onAmountChange: (id: string, amt: number) => void;
  onBuy: (id: string) => void;
}) {
  const [localAmount, setLocalAmount] = useState(amount.toFixed(2));
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setLocalAmount(amount.toFixed(2));
  }, [amount]);

  useEffect(() => {
    if (coin.audio_Url && waveformRef.current) {
      // Create WaveSurfer instance
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#aaa",
        progressColor: "#2563eb",
        height: 64,
        
        barWidth: 2,
      });

      wavesurferRef.current.load(coin.audio_Url);

      // Cleanup
      return () => {
        wavesurferRef.current?.destroy();
      };
    }
  }, [coin.audio_Url]);

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalAmount(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const newTimer = setTimeout(() => {
      const num = parseFloat(val);
      if (!isNaN(num)) onAmountChange(coin.id, num);
    }, 500);
    setDebounceTimer(newTimer);
  };

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
        margin: "1rem 0",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100%",
          height: 200,
          backgroundColor: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {coin.img_Url ? (
          <img
            src={coin.img_Url}
            alt={coin.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 72, color: "#fff" }}>
            {coin.emoji ?? "🪙"}
          </span>
        )}
      </div>

      {/* Waveform */}
      {coin.audio_Url && (
        <div
          style={{
            background: "#000",
            padding: "8px 12px",
          }}
        >
          <div ref={waveformRef} />
          <button
            onClick={togglePlayback}
            style={{
              marginTop: 6,
              padding: "6px 12px",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}

      {/* Bottom Info */}
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <strong style={{ fontSize: 20 }}>{coin.name}</strong>
        <span style={{ fontSize: 14, opacity: 0.85 }}>
          ${coin.price.toFixed(2)} · cap {coin.cap.toLocaleString()}
        </span>

        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          <input
            type="number"
            value={localAmount}
            min={0}
            step="0.01"
            onChange={handleChange}
            style={{
              padding: "6px 8px",
              width: 80,
              borderRadius: 6,
              border: "none",
              background: "rgba(255,255,255,0.9)",
              color: "#000",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
            }}
          />
          <button
            onClick={() => onBuy(coin.id)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
