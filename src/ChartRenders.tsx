/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { defaultColorPalettes, MONTH_PER_YEAR, monthLabels } from './Constants'
import { type BudgetData, type ChartData } from './DataProcessor'

type RenderItem = Record<string, any>
type RenderGroupItem = Record<string, any>

function hexToRGB (hex: string, alpha: number | null): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  if (alpha !== null) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }
}

export class ChartRenders {
  budgetNames: string[]
  totalBudget: number
  fullWidth: number
  fullHeight: number
  lowestY: number

  numberFormatter: (number: number) => string
  monthLabelGetter: (month: number) => string
  budgetColorGetter: (budgetName: string) => string

  constructor (
    budgetNames: string[],
    totalBudget: number,
    fullWidth: number,
    fullHeight: number,
    lowestY: number,
    locale: string,
    currency: string
  ) {
    this.budgetNames = budgetNames
    this.totalBudget = totalBudget
    this.fullWidth = fullWidth
    this.fullHeight = fullHeight
    this.lowestY = lowestY
    this.numberFormatter = (amount: number): string => {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
      })

      return formatter.format(amount)
    }
    this.monthLabelGetter = (month: number): string => {
      return monthLabels[month]
    }
    this.budgetColorGetter = (budgetName: string): string => {
      return defaultColorPalettes[this.budgetNames.indexOf(budgetName) % defaultColorPalettes.length]
    }
  }

  /* Budget */
  renderBudgetLabel = (params: any, api: any): RenderGroupItem => {
    return {
      type: 'group',
      children: [
        this.renderBudgetBlock(params, api),
        this.renderBudgetText(params, api)
      ],
      focus: 'self',
      blurScope: 'series'
    }
  }

  private readonly renderBudgetText = (params: any, api: any): RenderItem => {
    const start = api.coord([api.value('xStart'), 0])
    const size = api.size([api.value('xLength'), 0])

    const baseStyle = {
      text: `${api.value('name')}`,
      textAlign: 'left',
      textVerticalAlign: 'middle',
      opacity: 1
    }
    return {
      type: 'text',
      x: start[0] + size[0] / 2,
      y: api.coord([0, Math.floor(this.lowestY / 25) * 25])[1] + 30,
      rotation: -Math.PI / 2,
      style: baseStyle,
      emphasis: {
        style: {
          ...baseStyle,
          fontWeight: 600
        }
      },
      blur: {
        style: {
          ...baseStyle,
          opacity: 0.3
        }
      }
    }
  }

  private readonly renderBudgetBlock = (params: any, api: any): RenderItem => {
    const fill = this.budgetColorGetter(api.value('name'))
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const baseStyle: Record<string, any> = {
      fill,
      opacity: 0.3
    }
    if (yValue < 0) {
      baseStyle.fill = 'rgba(0, 0, 0, 0)'
      baseStyle.decal = {
        symbol: 'rect',
        dashArrayX: [2, 0],
        dashArrayY: [3, 5],
        rotation: -Math.PI / 4,
        color: fill
      }
    }
    return {
      type: 'rect',
      shape: {
        x: start[0],
        y: start[1],
        width: size[0],
        height: size[1]
      },
      style: baseStyle,
      emphasis: {
        // FIXME: doesn't work
        ...baseStyle,
        opacity: 0.8
      },
      blur: {
        // FIXME: doesn't work
        ...baseStyle,
        opacity: 0.3
      },
      morph: true
    }
  }

  /* Spending - Breakdown */
  renderMonthlyBreakdown = (param: any, api: any): RenderItem => {
    if (api.value('type') === 'aggregate') {
      return this.renderMonthLegend(param, api)
    }

    return this.renderBreakdownBlock(param, api)
  }

  /* Spending - Aggregate */
  renderMonthlyAggregate = (param: any, api: any): RenderGroupItem => {
    return {
      type: 'group',
      ignore: api.value('type') !== 'aggregate',
      children: [
        this.renderMonthLegend(param, api),
        this.renderMonthlyAggregateBlock(param, api)
      ]
    }
  }

  private readonly renderMonthLegend = (params: any, api: any): RenderItem => {
    const month = api.value('month')
    const boxWidthPx = 30
    const boxHeightVal = this.fullHeight / MONTH_PER_YEAR

    const monthSize = api.size([0, boxHeightVal])
    const monthStart = api.coord([0, boxHeightVal * (month + 1)])

    const baseBoxStyle: Record<string, any> = {
      fill: '#444444',
      opacity: 0.8
    }
    const baseTextStyle: Record<string, any> = {
      fill: '#c7c7c7',
      text: `${this.monthLabelGetter(month)}`
    }
    return {
      type: 'rect',
      id: `month-legend-${month}`,
      shape: {
        x: monthStart[0] - boxWidthPx,
        y: monthStart[1],
        width: boxWidthPx,
        height: monthSize[1]
      },
      style: baseBoxStyle,
      emphasis: {
        style: {
          opacity: 1
        }
      },
      blur: {
        style: {
          opacity: 0.8
        }
      },
      textConfig: {
        position: 'inside',
        inside: true
      },
      textContent: {
        style: baseTextStyle,
        emphasis: {
          style: {
            fontWeight: '600',
            fill: '#ffffff'
          }
        }
      },
      focus: 'series',
      blurScope: 'global',
      morph: false
    }
  }

  private readonly renderBreakdownBlock = (params: any, api: any): RenderItem => {
    const fill = this.budgetColorGetter(api.value('name'))
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const baseBoxStyle: Record<string, any> = {
      fill
    }
    if (yValue < 0) {
      baseBoxStyle.fill = 'rgba(0, 0, 0, 0)'
      baseBoxStyle.decal = {
        symbol: 'rect',
        dashArrayX: [2, 0],
        dashArrayY: [3, 5],
        rotation: -Math.PI / 4,
        color: fill
      }
    }
    return {
      type: 'rect',
      shape: {
        x: start[0],
        y: start[1],
        width: size[0],
        height: size[1]
      },
      style: baseBoxStyle,
      emphasis: {
        style: {
          stroke: '#000',
          lineWidth: 1
        }
      },
      blur: {
        style: {
          opacity: 0.3
        }
      },
      focus: 'self',
      blurScope: 'global'
    }
  }

  private readonly renderMonthlyAggregateBlock = (param: any, api: any): RenderItem => {
    const month = api.value('month')
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const baseBoxStyle: Record<string, any> = {
      fill: '#444444',
      opacity: 0.8
    }
    const baseTextStyle: Record<string, any> = {
      fill: '#c7c7c7',
      text: `${this.monthLabelGetter(month)}`
    }
    if (yValue < 0) {
      baseBoxStyle.fill = 'rgba(0, 0, 0, 0)'
      baseBoxStyle.decal = {
        symbol: 'rect',
        dashArrayX: [2, 0],
        dashArrayY: [3, 5],
        rotation: -Math.PI / 4,
        color: '#444444'
      }
    }

    return {
      type: 'rect',
      shape: {
        x: start[0],
        y: start[1],
        width: size[0],
        height: size[1]
      },
      style: baseBoxStyle,
      emphasis: {
        style: {
          opacity: 1
        }
      },
      blur: {
        style: {
          opacity: 0.8
        }
      },
      textConfig: {
        position: 'inside',
        inside: true
      },
      textContent: {
        style: baseTextStyle,
        emphasis: {
          style: {
            fontWeight: '600',
            fill: '#ffffff'
          }
        }
      },
      ignore: yValue === 0
    }
  }

  renderHorizontalLine = (valueFunction: (api: any) => number, param: any, api: any): any => {
    const h = valueFunction(api) / this.totalBudget * this.fullHeight
    const start = api.coord([0, h])
    const end = api.coord([this.fullWidth, h])
    return {
      type: 'line',
      transition: ['shape'],
      shape: {
        x1: start[0],
        x2: end[0],
        y1: start[1],
        y2: end[1]
      },
      style: {
        fill: null,
        stroke: '#e43',
        lineWidth: 2
      }
    }
  }

  budgetDataTooltipFormatter = (data: BudgetData): string => {
    return `
        <b>${data.name}</b> 
        <p>${data.description}</p> 
        <hr/>
        <div style="display: block">Annual Budget: <b style="float: right; margin-left:10px">${this.numberFormatter(data.monthlyBudget * MONTH_PER_YEAR)}</b></div>
        <div style="display: block">Annual Amount: <b style="float: right; margin-left:10px">${this.numberFormatter(data.amount)}</b></div>
        <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${this.numberFormatter(data.monthlyBudget * MONTH_PER_YEAR - data.amount)}</b></div>
    `
  }

  chartDataTooltipFormatter = (data: ChartData): string => {
    if (data.type === 'aggregate') {
      return `
          <b>${this.monthLabelGetter(data.month)}</b>  <hr/>
          <div style="display: block">Monthly Total Budget: <b style="float: right; margin-left:10px">${this.numberFormatter(data.monthlyBudget)}</b></div>
          <div style="display: block">Monthly Total Amount: <b style="float: right; margin-left:10px">${this.numberFormatter(data.amount)}</b></div>
      `
    } else if (data.type === 'breakdown') {
      return `
          <b>${data.name}</b> <br/>
          <b>${this.monthLabelGetter(data.month)}</b> <hr/>
          <div style="display: block">Monthly Budget: <b style="float: right; margin-left:10px">${this.numberFormatter(data.monthlyBudget)}</b></div>
          <div style="display: block">Monthly Amount: <b style="float: right; margin-left:10px">${this.numberFormatter(data.amount)}</b></div>
      `
    } else {
      throw new Error('Unknown type')
    }
  }

  totalLineTooltipFormatter = (totalBudget: number, totalAmount: number): string => {
    return `
        <b>Total</b> <hr/>
        <div style="display: block">Annual Budget: <b style="float: right; margin-left:10px">${this.numberFormatter(totalBudget)}</b></div>
        <div style="display: block">Annual Amount: <b style="float: right; margin-left:10px">${this.numberFormatter(totalAmount)}</b></div>
        <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${this.numberFormatter(totalBudget - totalAmount)}</b></div>
    `
  }

  currentMonthEndLineTooltipFormatter = (budgetToMonthEnd: number, amountToMonthEnd: number): string => {
    return `
        <b>Current</b> <hr/>
        <div style="display: block">Current Budget: <b style="float: right; margin-left:10px">${this.numberFormatter(budgetToMonthEnd)}</b></div>
        <div style="display: block">Current Amount: <b style="float: right; margin-left:10px">${this.numberFormatter(amountToMonthEnd)}</b></div>
        <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${this.numberFormatter(budgetToMonthEnd - amountToMonthEnd)}</b></div>
    `
  }
}
