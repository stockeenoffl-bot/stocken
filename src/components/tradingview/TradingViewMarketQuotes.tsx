import { useEffect, useRef } from 'react'

interface TradingViewMarketQuotesProps {
  height?: number | string
  className?: string
}

export default function TradingViewMarketQuotes({
  height = 520,
  className = '',
}: TradingViewMarketQuotesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    container.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: typeof height === 'number' ? height : 520,
      symbolsGroups: [
        {
          name: 'Indian Indices',
          originalName: 'Indices',
          symbols: [
            { name: 'NSE:NIFTY', displayName: 'NIFTY 50' },
            { name: 'BSE:SENSEX', displayName: 'BSE SENSEX' },
            { name: 'NSE:BANKNIFTY', displayName: 'NIFTY BANK' },
            { name: 'NSE:FINNIFTY', displayName: 'NIFTY FINANCIAL' },
            { name: 'NSE:MIDCPNIFTY', displayName: 'NIFTY MIDCAP' },
            { name: 'NSE:INDIAVIX', displayName: 'INDIA VIX' },
          ],
        },
        {
          name: 'Banking & Financials',
          symbols: [
            { name: 'NSE:HDFCBANK', displayName: 'HDFC Bank' },
            { name: 'NSE:ICICIBANK', displayName: 'ICICI Bank' },
            { name: 'NSE:SBIN', displayName: 'State Bank of India' },
            { name: 'NSE:KOTAKBANK', displayName: 'Kotak Mahindra' },
            { name: 'NSE:AXISBANK', displayName: 'Axis Bank' },
            { name: 'NSE:BAJFINANCE', displayName: 'Bajaj Finance' },
          ],
        },
        {
          name: 'IT & Software',
          symbols: [
            { name: 'NSE:TCS', displayName: 'Tata Consultancy' },
            { name: 'NSE:INFY', displayName: 'Infosys' },
            { name: 'NSE:HCLTECH', displayName: 'HCL Technologies' },
            { name: 'NSE:WIPRO', displayName: 'Wipro' },
            { name: 'NSE:TECHM', displayName: 'Tech Mahindra' },
          ],
        },
        {
          name: 'Bluechips & Auto',
          symbols: [
            { name: 'NSE:RELIANCE', displayName: 'Reliance Ind.' },
            { name: 'NSE:TATAMOTORS', displayName: 'Tata Motors' },
            { name: 'NSE:LT', displayName: 'Larsen & Toubro' },
            { name: 'NSE:ITC', displayName: 'ITC Ltd' },
            { name: 'NSE:BHARTIARTL', displayName: 'Bharti Airtel' },
            { name: 'NSE:MARUTI', displayName: 'Maruti Suzuki' },
            { name: 'NSE:SUNPHARMA', displayName: 'Sun Pharma' },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: 'dark',
      locale: 'en',
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [height])

  return (
    <div
      className={`tradingview-widget-container rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] ${className}`}
    >
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  )
}
