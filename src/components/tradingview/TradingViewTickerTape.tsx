import { useEffect, useRef } from 'react'

interface TradingViewTickerTapeProps {
  className?: string
  isTransparent?: boolean
}

export default function TradingViewTickerTape({
  className = '',
  isTransparent = true,
}: TradingViewTickerTapeProps) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'NSE:NIFTY', title: 'NIFTY 50' },
        { proName: 'NSE:BANKNIFTY', title: 'BANK NIFTY' },
        { proName: 'BSE:SENSEX', title: 'SENSEX' },
        { proName: 'NSE:FINNIFTY', title: 'FIN NIFTY' },
        { proName: 'NSE:MIDCPNIFTY', title: 'MIDCAP NIFTY' },
        { proName: 'NSE:INDIAVIX', title: 'INDIA VIX' },
        { proName: 'NSE:RELIANCE', title: 'RELIANCE' },
        { proName: 'NSE:HDFCBANK', title: 'HDFC BANK' },
        { proName: 'NSE:ICICIBANK', title: 'ICICI BANK' },
        { proName: 'NSE:TCS', title: 'TCS' },
        { proName: 'NSE:INFY', title: 'INFOSYS' },
        { proName: 'NSE:TATAMOTORS', title: 'TATA MOTORS' },
        { proName: 'NSE:SBIN', title: 'SBI' },
        { proName: 'NSE:BHARTIARTL', title: 'BHARTI AIRTEL' },
        { proName: 'NSE:LT', title: 'L&T' },
        { proName: 'NSE:ITC', title: 'ITC' },
      ],
      showSymbolLogo: true,
      isTransparent,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    })

    container.appendChild(script)

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [isTransparent])

  return (
    <div className={`tradingview-widget-container w-full overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
