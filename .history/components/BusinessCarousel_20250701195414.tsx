import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CARDS = [
  {
    key: 'business',
    title: 'Business Options',
    desc: 'All your business suite tools and company departments.',
    img: '/bg/business-options.jpg',
    link: '/business',
  },
  {
    key: 'dobe',
    title: 'Dobe',
    desc: 'Brand innovation & creative launchpad.',
    img: '/bg/dobe-bg.jpg',
    link: '/business/dobe',
  },
  {
    key: 'agx',
    title: 'AGX',
    desc: 'Autonomous gig & workforce management.',
    img: '/bg/agx-bg.jpg',
    link: '/business/agx',
  },
  {
    key: 'comms',
    title: 'Communication',
    desc: 'Advanced messaging, collaboration, and group coordination.',
    img: '/bg/comms-bg.jpg',
    link: '/business/communication',
  },
]

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 180 : -180,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      type: "spring",
      stiffness: 160,
      damping: 30,
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 180 : -180,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.55 }
  }),
}

export default function BusinessCarousel() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const total = CARDS.length

  const paginate = (newIndex: number) => {
    setDirection(newIndex > index ? 1 : -1)
    setIndex((newIndex + total) % total)
  }

  return (
    <div style={{
      position: 'relative',
      height: 340,
      minWidth: 320,
      borderRadius: 22,
      overflow: 'hidden',
      boxShadow: '0 4px 24px #0af4',
      background: '#10142A',
      marginBottom: 30
    }}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.a
          key={CARDS[index].key}
          href={CARDS[index].link}
          target="_self"
          custom={direction}
          variants={variants}
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
            background: `linear-gradient(90deg,rgba(16,20,42,0.98) 65%,rgba(0,0,0,0.55) 100%), url(${CARDS[index].img}) center/cover no-repeat`,
            transition: 'background 0.5s cubic-bezier(.74,.07,.22,.93)'
          }} />
          <div style={{
            position: 'absolute', left: 32, bottom: 56, zIndex: 2, color: '#fff'
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5, textShadow: '0 2px 10px #000b' }}>
              {CARDS[index].title}
            </div>
            <div style={{ fontSize: 16, opacity: 0.85, marginBottom: 14, maxWidth: 320 }}>
              {CARDS[index].desc}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: 8,
                background: 'linear-gradient(90deg,#0af,#6dd5fa 80%)',
                color: '#111',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 2px 10px #0af7',
                cursor: 'pointer',
                marginTop: 3,
              }}
            >View</motion.div>
          </div>
        </motion.a>
      </AnimatePresence>
      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 10
      }}>
        {CARDS.map((_, i) => (
          <span key={i}
            onClick={() => paginate(i)}
            style={{
              display: 'inline-block',
              width: i === index ? 16 : 10,
              height: i === index ? 16 : 10,
              margin: '0 7px',
              borderRadius: '50%',
              background: i === index ? '#0af' : '#fff7',
              border: i === index ? '2px solid #fff' : 'none',
              cursor: 'pointer',
              transition: 'all .23s cubic-bezier(.83,.04,.19,.95)'
            }}
          />
        ))}
      </div>
      
      {/* Arrows */}
      
      <motion.button
        whileTap={{ scale: 0.96 }}{CARDS[index].info && (
  <div
    style={{
      position: 'absolute',
      top: 14,
      right: 20,
      zIndex: 5,
      background: '#111a',
      borderRadius: '50%',
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      cursor: 'pointer'
    }}
    title={CARDS[index].info}
    onClick={e => {
      e.preventDefault()
      window.location.href = '/contracts' // Or use router.push if you prefer
    }}
  >i</div>
)}

        aria-label="Prev"
        onClick={() => paginate(index - 1)}
        style={{
          position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)',
          background: 'rgba(8,24,40,0.64)', color: '#fff',
          border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 22, cursor: 'pointer', zIndex: 12
        }}
      >‹</motion.button>
      <motion.button
        whileTap={{ scale: 0.96 }}
        aria-label="Next"
        onClick={() => paginate(index + 1)}
        style={{
          position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)',
          background: 'rgba(8,24,40,0.64)', color: '#fff',
          border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 22, cursor: 'pointer', zIndex: 12
        }}
      >›</motion.button>
    </div>
  )
}
