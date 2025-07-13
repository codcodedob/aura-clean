import React from "react"
import Link from "next/link"

interface ActivityItem {
  id: string
  title: string
  status: "pending" | "done" | "future"
  link?: string
}

interface ActivityWidgetProps {
  activities: ActivityItem[]
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({ activities }) => (
  <div
    role="region"
    aria-live="polite"
    aria-label="Activity Center"
    style={{
      position: "fixed",
      right: 24,
      bottom: 24,
      width: 340,
      background: "#222",
      borderRadius: 12,
      boxShadow: "0 4px 24px #000a",
      padding: 16,
      zIndex: 1000,
      maxWidth: "90vw", // responsive width
      fontFamily: 'system-ui, sans-serif',
    }}
  >
    <h3 style={{ color: "#0af", margin: 0, marginBottom: 10 }}>Activity Center</h3>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {activities.map((a) => (
        <li
          key={a.id}
          style={{
            background: a.status === "pending" ? "#333" : "#222",
            borderLeft: a.status === "pending" ? "4px solid #0af" : "4px solid transparent",
            padding: "10px 12px",
            marginBottom: 8,
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {a.link ? (
            <Link href={a.link} passHref>
              <a
                style={{
                  color: "#0af",
                  cursor: "pointer",
                  textDecoration: "none",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {a.title}
              </a>
            </Link>
          ) : (
            <span style={{ color: "#ccc" }}>{a.title}</span>
          )}

          <span
            style={{
              marginLeft: 12,
              whiteSpace: "nowrap",
              color:
                a.status === "done" ? "#2ecc40" : a.status === "pending" ? "#ffb800" : "#888",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {a.status === "pending" ? "Pending" : a.status === "done" ? "Done" : "Future"}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

export default ActivityWidget
