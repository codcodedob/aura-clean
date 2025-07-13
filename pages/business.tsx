// pages/business.tsx
import React from "react";

type BusinessOption = {
  key: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  button: string;
  formFields: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }[];
};

const businessOptions: BusinessOption[] = [
  {
    key: "basic",
    name: "Basic Plan",
    price: 99,
    description: "Basic business setup",
    features: ["Feature A", "Feature B"],
    button: "Select Basic",
    formFields: [
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email" },
    ],
  },
  {
    key: "pro",
    name: "Pro Plan",
    price: 199,
    description: "Advanced business plan",
    features: ["Feature A", "Feature B", "Feature C"],
    button: "Select Pro",
    formFields: [
      { name: "companyName", label: "Company Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email" },
      { name: "taxId", label: "Tax ID", type: "text" },
    ],
  },
];

export default function BusinessPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Choose Your Business Plan</h1>
      <div style={{ display: "flex", gap: 20 }}>
        {businessOptions.map((option) => (
          <div
            key={option.key}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              width: 300,
            }}
          >
            <h2>{option.name}</h2>
            <p>{option.description}</p>
            <p>
              <strong>${option.price}</strong>
            </p>
            <ul>
              {option.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button>{option.button}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
