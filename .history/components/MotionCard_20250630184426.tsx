import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function MotionCard({ title, children }: { title: string, children?: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
  }, []);

  return (
    <div
      className="motion-card"
      ref={cardRef}
      style={{
        maxWidth: '500px',
        width: '90%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <h2>{title}</h2>
      {children}
    </div>
  );
}
