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
  <div style={{
    position: "fixed", right: 24, bottom: 24, width: 340, background: "#222", borderRadius: 12, boxShadow: "0 4px 24px #000a", padding: 16, zIndex: 1000
  }}>
    <h3 style={{ color: "#0af", margin: 0, marginBottom: 10 }}>Activity Center</h3>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {activities.map(a => (
        <li key={a.id} style={{
          background: a.status === "pending" ? "#333" : "#222",
          borderLeft: a.status === "pending" ? "4px solid #0af" : "4px solid transparent",
          padding: "10px 12px", marginBottom: 8, borderRadius: 6
        }}>
          {a.link
            ? <Link href={a.link}><span style={{ color: "#0af", cursor: "pointer" }}>{a.title}</span></Link>
            : <span>{a.title}</span>
          }
          <span style={{
            float: "right", color: a.status === "done" ? "#2ecc40" : a.status === "pending" ? "#ffb800" : "#888"
          }}>
            {a.status === "pending" ? "Pending" : a.status === "done" ? "Done" : "Future"}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

export default ActivityWidget
