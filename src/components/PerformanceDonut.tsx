import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface DonutData {
  name: string
  value: number
  color: string
}

interface PerformanceDonutProps {
  data: DonutData[]
  total: number
  label: string
}

export default function PerformanceDonut({ data, total, label }: PerformanceDonutProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={48}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{total}</span>
          <span className="text-[8px] uppercase" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
