import React from 'react'
import Link from 'next/link'

export default function WidgetPanel({ cartItems = [], nowPlaying, alerts = [], unreadMessages = 0 }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24, right: 24,
      width: 320, background: '#181825ee',
      borderRadius: 20, boxShadow: '0 2px 32px #0008',
      color: '#fff', zIndex: 9999,
      padding: 18, display: 'flex', flexDirection: 'column', gap: 18
    }}>
      {/* Now Playing (music/video/announcement) */}
      {nowPlaying && (
        <div>
          <b>Now Playing:</b> {nowPlaying.title}
          <audio src={nowPlaying.audioUrl} controls style={{ width: '100%' }} />
        </div>
      )}

      {/* Cart quick view */}
      <div>
        <b>Cart:</b> {cartItems.length} item(s)
        {cartItems.length > 0 && (
          <Link href="/cart">
            <button style={{ marginLeft: 8, background: '#0af', color: '#000', borderRadius: 8, padding: '4px 14px', fontWeight: 700 }}>
              View Cart
            </button>
          </Link>
        )}
      </div>

      {/* Messaging/alerts */}
      <div>
        <b>Inbox:</b> <span style={{ color: '#0af', fontWeight: 700 }}>{unreadMessages}</span> new
        <Link href="/inbox"><button style={{ marginLeft: 12 }}>Open Inbox</button></Link>
      </div>

      {/* General alerts */}
      {alerts.length > 0 && (
        <div>
          <b>Alerts:</b>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {alerts.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
