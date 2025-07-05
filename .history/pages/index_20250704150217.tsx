import React, { useState } from "react";
import { useRouter } from "next/router";

// Demo step states (replace with actual logic)
const steps = [
  { label: "Create a Profile", complete: true },
  { label: "Set Up Notifications", complete: false },
  { label: "Explore Features", complete: false },
  { label: "Upgrade Plan", complete: false },
];

export default function OnboardingHome() {
  const [activeStep, setActiveStep] = useState(1);
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        borderRadius: 28,
        background: "#fff",
        boxShadow: "0 8px 32px rgba(60,70,100,0.10)",
        padding: 40,
        display: "flex",
        gap: 36,
        minWidth: 720,
        minHeight: 420,
        alignItems: "flex-start"
      }}>
        {/* Sidebar Steps */}
        <div style={{
          width: 210,
          background: "#f2f4f7",
          borderRadius: 18,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "0 1px 8px #c0e7fc22"
        }}>
          <div style={{
            fontWeight: 600,
            color: "#456",
            marginBottom: 8,
            fontSize: 15,
            letterSpacing: "0.02em"
          }}>
            <span style={{
              background: "#e6ecfa",
              borderRadius: 8,
              padding: "3px 13px",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.01em"
            }}>ONBOARDING</span>
          </div>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
                position: "relative"
              }}
            >
              {/* Step Indicator */}
              <span style={{
                display: "inline-block",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: step.complete ? "#34d399" : (i === activeStep ? "#60a5fa" : "#e0e7ef"),
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: "22px",
                textAlign: "center",
                marginRight: 13,
                boxShadow: i === activeStep ? "0 0 0 4px #e3edfc" : undefined
              }}>
                {step.complete ? "✔" : i + 1}
              </span>
              <button
                onClick={() => setActiveStep(i)}
                style={{
                  border: "none",
                  background: "none",
                  fontWeight: i === activeStep ? 700 : 500,
                  fontSize: 17,
                  color: i === activeStep ? "#2563eb" : "#222f3f",
                  cursor: "pointer",
                  outline: "none",
                  position: "relative",
                  transition: "color 0.16s"
                }}
              >
                {step.label}
                {/* Blue highlight and arrow if active */}
                {i === activeStep && (
                  <span style={{
                    display: "inline-block",
                    marginLeft: 7,
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: 18,
                    verticalAlign: "middle"
                  }}>→</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28
        }}>
          <div style={{
            borderRadius: 18,
            background: "#f6f9fc",
            padding: 36,
            minWidth: 340,
            marginBottom: 0,
            marginTop: 10,
            boxShadow: "0 1px 12px #b0d7ee12"
          }}>
            <h1 style={{
              fontSize: 38,
              margin: 0,
              fontWeight: 800,
              color: "#27366a",
              letterSpacing: "-0.03em"
            }}>
              Welcome!
            </h1>
            <p style={{
              fontSize: 18,
              color: "#3d4967",
              marginTop: 18,
              marginBottom: 0,
              lineHeight: 1.45,
              maxWidth: 480,
            }}>
              We’re glad to have you here.<br />
              You can <b>create a profile</b>, <b>set up notifications</b>, and explore features to get the most out of our platform.
            </p>
          </div>
          {/* Help tiles */}
          <div style={{
            display: "flex",
            gap: 18,
            marginTop: 18
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 14,
              padding: "22px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              boxShadow: "0 2px 10px #d2f7fd18"
            }}>
              <span style={{
                background: "#ff7d42",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 8
              }}>💬</span>
              <span style={{
                fontWeight: 600,
                fontSize: 17,
                color: "#1d273e"
              }}>Live Support</span>
            </div>
            <div style={{
              background: "#f1f6ff",
              borderRadius: 14,
              padding: "22px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              boxShadow: "0 2px 10px #c2e9fa18"
            }}>
              <span style={{
                background: "#2d9cfd",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 8
              }}>?</span>
              <span style={{
                fontWeight: 600,
                fontSize: 17,
                color: "#1d273e"
              }}>FAQs</span>
            </div>
            <div style={{
              background: "#fff7f3",
              borderRadius: 14,
              padding: "22px 30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              boxShadow: "0 2px 10px #faeedc1a"
            }}>
              <span style={{
                background: "#f16a57",
                color: "#fff",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 8
              }}>▶</span>
              <span style={{
                fontWeight: 600,
                fontSize: 17,
                color: "#1d273e"
              }}>Tutorial Videos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
