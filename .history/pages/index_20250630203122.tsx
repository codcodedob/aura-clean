// pages/index.tsx
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// --- ANIMATED BACKGROUND (GSAP gradient + minimal particles) ---
import gsap from 'gsap'

function AnimatedBG() {
  const bgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!bgRef.current) return
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(bgRef.current, {
      background:
        'linear-gradient(120deg,#0f2027,#2c5364 45%,#005c97 90%)',
      duration: 6,
      ease: 'power2.inOut',
    })
    tl.to(
      bgRef.current,
      {
        background:
          'linear-gradient(120deg,#3a7bd5 10%,#3a6073 55%,#e96443 90%)',
        duration: 8,
        ease: 'power2.inOut',
      },
      '+=0'
    )
    tl.to(
      bgRef.current,
      {
        background:
          'linear-gradient(120deg,#373B44 10%,#4286f4 70%,#e96443 100%)',
        duration: 7,
        ease: 'power2.inOut',
      },
      '+=0'
    )
    return () => tl.kill()
  }, [])
  return (
    <div
      ref={bgRef}
      style={{
        position: 'fixed',
        zIndex: -2,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(120deg,#0f2027,#2c5364 55%,#005c97 100%)',
        transition: 'background 1.2s cubic-bezier(0.77,0,0.175,1)',
      }}
    />
  )
}

// --- PARTICLE OVERLAY BACKGROUND ---
function ParticlesBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    let particles = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.2,
    }))

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, 2 * Math.PI)
        ctx!.fillStyle = '#0af9'
        ctx!.fill()
      }
    }
    function animate() {
      for (const p of particles) {
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > w) p.dx *= -1
        if (p.y < 0 || p.y > h) p.dy *= -1
      }
      draw()
      requestAnimationFrame(animate)
    }
    animate()
    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}

// --- ABOUT HOVER BUTTON ---
function AboutHover({ message, link }: { message: string; link?: string }) {
  const [hover, setHover] = React.useState(false)
  return (
    <span style={{ position: 'relative', marginLeft: 10 }}>
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: '#222',
          borderRadius: '50%',
          color: '#0af',
          border: '1px solid #0af7',
          width: 28,
          height: 28,
          fontWeight: 700,
          fontSize: 18,
          padding: 0,
          cursor: 'pointer',
        }}
        aria-label="About"
      >
        ?
      </button>
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: 38,
            top: -10,
            background: '#16161e',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: 9,
            width: 285,
            boxShadow: '0 4px 24px #0007',
            zIndex: 88,
            fontSize: 15,
          }}
        >
          {message}
          {link && (
            <>
              <br />
              <Link href={link} style={{ color: '#0af', fontWeight: 600 }}>
                Contracts & Consulting
              </Link>
            </>
          )}
        </div>
      )}
    </span>
  )
}

// ---- MAIN ----
export default function Home() {
  const router = useRouter()
  // -- Panel data as before --
  const departments = [
    {
      label: 'Art',
      path: '/business/art',
      desc: 'Art, AGX, Onboarding, Wallet',
      about: `The art of contracts, consulting, finance, communication, and planning and organization, all the important stuff artfully done all in one place for you.`,
      link: '/contracts',
    },
    {
      label: 'Entertainment',
      path: '/business/entertainment',
      desc: 'Live Shows, Music, Venues',
      about: `The best in live shows, music, and creative venues. Connect, create, perform.`,
    },
    {
      label: 'Cuisine',
      path: '/business/cuisine',
      desc: 'Restaurants, Food Delivery, Catering',
      about: `Savor, discover, and deliver culinary experiences. From pop-ups to meal plans.`,
    },
    {
      label: 'Fashion',
      path: '/business/fashion',
      desc: 'Design, Modeling, Retail',
      about: `Trendsetting design, modeling, and retail for creators, brands, and consumers.`,
    },
    {
      label: 'Health & Fitness',
      path: '/business/health',
      desc: 'Health, Wellness, Fitness',
      about: `All things wellness, health, and fitness — your life, optimized.`,
    },
    {
      label: 'Science & Tech',
      path: '/business/science',
      desc: 'Tech, R&D, Consulting',
      about: `Cutting edge research, consulting, and technology launchpad.`,
    },
    {
      label: 'Community Clipboard',
      path: '/business/community',
      desc: 'Volunteer, Events, Forum',
      about: `Organize, volunteer, and lead in your community. Events and ideas start here.`,
    },
  ]

  // ...the rest of your panels/cards/etc

  return (
    <div>
      {/* BACKGROUNDS */}
      <AnimatedBG />
      <ParticlesBG />

      {/* MAIN LAYOUT */}
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          height: '100vh',
        }}
      >
        {/* LEFT PANEL — coins etc (not included for brevity) */}
        <div style={{ flex: 1, padding: 24 }}>
          {/* ... */}
        </div>
        {/* CENTER PANEL — profile etc (not included for brevity) */}
        <div style={{ flex: 1.1, padding: 24 }}>
          {/* ... */}
        </div>
        {/* RIGHT PANEL — Company Suite */}
        <div style={{ flex: 1, padding: 24, minWidth: 300 }}>
          <h2 style={{ marginBottom: 14 }}>Company Suite</h2>
          <div>
            {departments.map((dept, i) => (
              <div
                key={dept.label}
                onClick={() => router.push(dept.path)}
                style={{
                  marginBottom: 16,
                  padding: 20,
                  background: '#eee',
                  borderRadius: 13,
                  cursor: 'pointer',
                  boxShadow: '0 1px 8px #0af2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 19, color: '#181825', fontWeight: 800 }}>
                    {dept.label}
                  </h3>
                  <div style={{ color: '#222', marginTop: 2, fontWeight: 500, fontSize: 15 }}>
                    {dept.desc}
                  </div>
                </div>
                {/* About hover for every card; Art dept gets link */}
                <AboutHover message={dept.about} link={dept.label === 'Art' ? dept.link : undefined} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Extra styles for tooltips (optional) */}
      <style>{`
        @media (max-width: 1000px) {
          div[style*="display: flex"][style*="min-height: 100vh"] {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  )
}
