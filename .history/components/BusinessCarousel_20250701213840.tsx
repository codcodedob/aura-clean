// components/BusinessCarousel.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type CarouselCard = {
  id: string;
  title: string;
  desc?: string;
  img?: string;
  video?: string;
  link?: string;
  featured?: boolean;
  ai_score?: number;
};

type Props = {
  department: string; // e.g. "art", "comms"
  aiPick?: boolean;   // If true, highlight the highest AI score/featured item first
};

export default function BusinessCarousel({ department, aiPick = false }: Props) {
  const [cards, setCards] = useState<CarouselCard[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Fetch department media from Supabase
    supabase
      .from("department_media")
      .select("*")
      .eq("department", department)
      .then(({ data }) => {
        if (!data) return;
        // AI Pick: Sort by AI score or featured
        if (aiPick) {
          data.sort((a, b) =>
            (b.ai_score ?? 0) - (a.ai_score ?? 0) ||
            (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
          );
        }
        setCards(data);
      });
  }, [department, aiPick]);

  const total = cards.length;
  const paginate = (newIndex: number) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex((newIndex + total) % total);
  };

  if (!cards.length) return <div>Loading...</div>;

  return (
    <div style={{
      position: 'relative',
      height: 230,
      minWidth: 220,
      borderRadius: 18,
      overflow: 'hidden',
      background: '#10142A'
    }}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.a
          key={cards[index].id}
          href={cards[index].link}
          target="_self"
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            display: 'block',
            position: 'absolute',
            inset: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            background: cards[index].img
              ? `linear-gradient(90deg,rgba(16,20,42,0.93) 60%,rgba(0,0,0,0.45) 100%), url(${cards[index].img}) center/cover no-repeat`
              : '#111',
            transition: 'background 0.5s cubic-bezier(.74,.07,.22,.93)'
          }} />
          <div style={{
            position: 'absolute', left: 20, bottom: 24, zIndex: 2, color: '#fff'
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 5 }}>
              {cards[index].title}
            </div>
            <div style={{ fontSize: 13, opacity: 0.92, maxWidth: 210 }}>
              {cards[index].desc}
            </div>
            {cards[index].link && (
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: 7,
                  background: 'linear-gradient(90deg,#18ff78,#0af 80%)',
                  color: '#111',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 2px 10px #0af7',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >View</motion.div>
            )}
          </div>
        </motion.a>
      </AnimatePresence>
      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', zIndex: 10
      }}>
        {cards.map((_, i) => (
          <span key={i}
            onClick={() => paginate(i)}
            style={{
              display: 'inline-block',
              width: i === index ? 15 : 8,
              height: i === index ? 15 : 8,
              margin: '0 4px',
              borderRadius: '50%',
              background: i === index ? '#18ff78' : '#fff7',
              border: i === index ? '2px solid #fff' : 'none',
              cursor: 'pointer',
              transition: 'all .2s'
            }}
          />
        ))}
      </div>
      {/* Arrows */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        aria-label="Prev"
        onClick={e => { e.stopPropagation(); paginate(index - 1) }}
        style={{
          position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)',
          background: 'rgba(8,24,40,0.7)', color: '#fff',
          border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 17, cursor: 'pointer', zIndex: 12
        }}
      >‹</motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        aria-label="Next"
        onClick={e => { e.stopPropagation(); paginate(index + 1) }}
        style={{
          position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)',
          background: 'rgba(8,24,40,0.7)', color: '#fff',
          border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 17, cursor: 'pointer', zIndex: 12
        }}
      >›</motion.button>
    </div>
  );
}
