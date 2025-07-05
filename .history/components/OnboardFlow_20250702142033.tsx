// components/OnboardFlow.tsx

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function MotionCard({ title, children }: { title: string, children?: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="motion-card" ref={cardRef} style={{ background: '#111', padding: '1rem 2rem', borderRadius: 12, boxShadow: '0 4px 16px #0007', color: '#fff' }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function MotionSection({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="motion-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '2rem',
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0c0c0c, #1e1e1e)',
        padding: '2rem 1rem'
      }}
    >
      {children}
    </section>
  );
}
