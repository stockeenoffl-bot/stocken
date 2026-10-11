export interface ZoneDefinition {
  from: number
  to: number
  color?: string
  label?: string
}

export type DrawingType = 'line' | 'hline' | 'zone' | 'text'

/** A chart annotation. Times are real unix seconds (UTC), prices are index points. */
export interface ChartDrawing {
  id: string
  type: DrawingType
  time1: number
  price1: number
  time2: number
  price2: number
  text?: string
}
