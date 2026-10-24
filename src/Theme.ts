import { defaultColorPalettes } from './Constants'

export type BudgetChartTheme = 'dark' | 'light' | 'auto'

export interface ChartColors {
  background: string
  text: string
  axis: string
  splitLine: string
  legend: string
  legendText: string
  legendHighlightText: string
  line: string
  tooltipBackground: string
  tooltipBorder: string
  tooltipText: string
}

export type BudgetChartThemeColors = Partial<Record<'dark' | 'light', Partial<ChartColors> & {
  /** Budget item colors. Colors repeat when there are more items than colors. */
  colorPalette?: string[]
}>>

export const defaultThemeColors: Record<'dark' | 'light', ChartColors & { colorPalette: string[] }> = {
  dark: {
    colorPalette: defaultColorPalettes,
    background: 'transparent',
    text: '#e5e7eb',
    axis: '#9ca3af',
    splitLine: '#374151',
    legend: '#444444',
    legendText: '#c7c7c7',
    legendHighlightText: '#ffffff',
    line: '#ff6b57',
    tooltipBackground: '#1f2937',
    tooltipBorder: '#4b5563',
    tooltipText: '#f9fafb'
  },
  light: {
    colorPalette: defaultColorPalettes,
    background: 'transparent',
    text: '#374151',
    axis: '#6b7280',
    splitLine: '#e5e7eb',
    legend: '#e5e7eb',
    legendText: '#374151',
    legendHighlightText: '#111827',
    line: '#e43',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#d1d5db',
    tooltipText: '#111827'
  }
}
