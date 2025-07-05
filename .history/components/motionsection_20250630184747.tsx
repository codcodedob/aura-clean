import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
        flexDirection: 'grid',
        alignItems: 'center', // Center the cards horizontally
        justifyContent: 'flex-start', // Stack from the top down
        gap: '2rem',
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0c0c0c, #1e1e1e)'
      }}
    >
      {children}
    </section>
  );
}
