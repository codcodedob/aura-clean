import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function IncomeGraph({ data }: { data: { month: string, amount: number }[] }) {
  return (
    <div style={{ width: '100%', height: 320, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px #ccc2' }}>
      <h3 style={{ marginBottom: 16 }}>Income (Year)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#0af" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
