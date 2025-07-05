import React, { useEffect, useState } from "react";

export default function LogoRotator({
  images,
  size = 80,
  interval = 800
}: {
  images: string[],
  size?: number,
  interval?: number
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % images.length), interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);
  return (
    <img
      src={images[idx]}
      alt="Company Logo"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: 16,
        boxShadow: "0 2px 14px #2563eb30",
        marginBottom: 8,
        background: "#fff"
      }}
    />
  );
}
