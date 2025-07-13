import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MediaItem = {
  id: string;
  img_url?: string;
  video_url?: string;
  title?: string;
  description?: string;
  link_url?: string;
};

type Props = {
  department: string;
  aiPick?: boolean;
  media?: MediaItem[];
};

const BusinessCarousel = ({ department, aiPick = false, media = [] }: Props) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carouselRef.current) return;

    gsap.fromTo(
      carouselRef.current.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: carouselRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  return (
    <section style={{ padding: '2rem 1rem', background: '#0c0c0c' }}>
      <h2 style={{ color: '#fff', marginBottom: 16 }}>
        {aiPick ? 'AI Picks for' : 'Media for'} {department}
      </h2>

      <div
        ref={carouselRef}
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          paddingBottom: 12,
          scrollSnapType: 'x mandatory',
        }}
      >
        {media.length === 0 ? (
          <div style={{ color: '#bbb' }}>No media for {department}</div>
        ) : (
          media.map((m) => (
            <div
              key={m.id}
              style={{
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                minWidth: 260,
                background: '#191c24',
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,255,255,0.15)',
                padding: 12,
                transition: 'transform 0.3s ease',
              }}
            >
              {m.img_url && (
                <img
                  src={m.img_url}
                  alt={m.title}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    marginBottom: 8,
                    objectFit: 'cover',
                    maxHeight: 180,
                  }}
                />
              )}
              {m.video_url && (
                <video
                  src={m.video_url}
                  controls
                  style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <div style={{ fontWeight: 600, color: '#fff' }}>{m.title}</div>
              <div style={{ fontSize: 13, color: '#9ae6b4' }}>{m.description}</div>
              {m.link_url && (
                <a
                  href={m.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0af', fontSize: 14 }}
                >
                  Visit
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BusinessCarousel;
