import { TrendingDown, TrendingUp } from 'lucide-react'
import { useLiveQuotes } from '@/hooks/useLiveQuotes'
import { fmtPrice } from '@/lib/candles'

interface Props {
  title: string
  symbols: string[]
  onSelect?: (symbol: string) => void
  selected?: string
}

/** Live watchlist table powered by Alice Blue quotes. */
export default function QuotesBoard({ title, symbols, onSelect, selected }: Props) {
  const { quotes, dirs, loaded } = useLiveQuotes(symbols)
  return (
    <div className="rounded-xl border border-[#1A2234] bg-[#0E1424] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1A2234] flex items-center justify-between">
        <h3 className="text-xs font-bold text-white">{title}</h3>
        <span className="text-[10px] text-slate-500">Alice Blue live</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase text-slate-500 border-b border-[#1A2234]">
              <th className="text-left px-4 py-2 font-semibold">Symbol</th>
              <th className="text-right px-3 py-2 font-semibold">LTP</th>
              <th className="text-right px-3 py-2 font-semibold">Chg</th>
              <th className="text-right px-3 py-2 font-semibold">%</th>
              <th className="text-right px-3 py-2 font-semibold hidden md:table-cell">High</th>
              <th className="text-right px-3 py-2 font-semibold hidden md:table-cell">Low</th>
            </tr>
          </thead>
          <tbody>
            {symbols.map((s) => {
              const q = quotes[s]
              const up = (q?.change ?? 0) >= 0
              return (
                <tr
                  key={s}
                  onClick={() => onSelect?.(s)}
                  className={`border-b border-[#131A2B] ${onSelect ? 'cursor-pointer hover:bg-[#141B2E]' : ''} ${selected === s ? 'bg-indigo-500/10' : ''}`}
                >
                  <td className="px-4 py-2 font-semibold text-slate-200">{q?.name && q.kind === 'equity' ? s : s}</td>
                  <td className={`px-3 py-2 text-right font-mono font-bold transition-colors ${dirs[s] === 'up' ? 'text-emerald-300' : dirs[s] === 'down' ? 'text-rose-300' : 'text-white'}`}>
                    {q ? fmtPrice(q.ltp) : loaded ? 'n/a' : '…'}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {q ? `${up ? '+' : ''}${fmtPrice(q.change)}` : ''}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {q ? (
                      <span className="inline-flex items-center gap-0.5">
                        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {up ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    ) : ''}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400 hidden md:table-cell">{q ? fmtPrice(q.high) : ''}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-400 hidden md:table-cell">{q ? fmtPrice(q.low) : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
