/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { MONTH_PER_YEAR } from './Constants'
import { type BudgetData, type ChartData } from './DataProcessor'

const colorPalettes = [
  '#edae49',
  '#d1495b',
  '#00798c',
  '#30638e',
  '#003d5b',
  '#408e9a',
  '#80ded9',
  '#aeecef',
  '#bdadea',
  '#edae49',
  '#d1495b',
  '#00798c'
]
type RenderItem = any
type RenderGroupItem = any

export class ChartRenders {
  budgetNames: string[]
  totalBudget: number
  TOTAL_X: number
  TOTAL_Y: number
  lowestY: number

  numberFormatter: (number: number) => string
  monthLabelGetter: (month: number) => string
  constructor (budgetNames: string[], totalBudget: number, TOTAL_X: number, TOTAL_Y: number, lowestY: number, numberFormatter: (number: number) => string, monthLabelGetter: (month: number) => string) {
    this.budgetNames = budgetNames
    this.totalBudget = totalBudget
    this.TOTAL_X = TOTAL_X
    this.TOTAL_Y = TOTAL_Y
    this.lowestY = lowestY
    this.numberFormatter = numberFormatter
    this.monthLabelGetter = monthLabelGetter
  }

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
    return {
      type: 'text',
      x: start[0] + size[0] / 2,
      y: api.coord([0, Math.floor(this.lowestY / 25) * 25])[1] + 30,
      rotation: -Math.PI / 2,
      style: {
        text: `${api.value('name')}`,
        textAlign: 'left',
        textVerticalAlign: 'middle'
      },
      blur: {
        style: {
          text: `${api.value('name')}`,
          textAlign: 'left',
          textVerticalAlign: 'middle',
          opacity: 1
        }
      }
    }
  }

  private readonly renderBudgetBlock = (params: any, api: any): RenderItem => {
    // TODO: Allow customise colorPalettes
    const fill = colorPalettes[this.budgetNames.indexOf(api.value('name')) % colorPalettes.length]
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const style: any = { fill }
    if (yValue < 0) {
      style.fill = 'rgba(0, 0, 0, 0)'
      style.decal = {
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
      style: api.style(Object.assign(style, { opacity: 0.3 })),
      emphasis: {
        style: api.style(Object.assign(style, { opacity: 0.4 }))
      },
      blur: {
        style: api.style(Object.assign(style, { opacity: 0.2 }))
      },
      focus: 'self',
      blurScope: 'series'
    }
  }

  private readonly renderMonthLegend = (params: any, api: any): RenderItem => {
    const month = api.value('month')
    const boxWidthPx = 30
    const boxHeightVal = this.TOTAL_Y / MONTH_PER_YEAR

    const monthSize = api.size([0, boxHeightVal])
    const monthStart = api.coord([0, boxHeightVal * (month + 1)])

    return {
      type: 'rect',
      id: `month-legend-${month}`,
      shape: {
        x: monthStart[0] - boxWidthPx,
        y: monthStart[1],
        width: boxWidthPx,
        height: monthSize[1]
      },
      style: { fill: '#444444', textFill: '#c7c7c7', fontWeight: '800', opacity: 0.8, text: `${this.monthLabelGetter(month)}` },
      emphasis: {
        style: { fill: '#444444', textFill: '#c7c7c7', fontWeight: '800', opacity: 1, text: `${this.monthLabelGetter(month)}` }
      },
      blur: {
        style: { fill: '#444444', textFill: '#ffffff', fontWeight: '800', opacity: 0.8, text: `${this.monthLabelGetter(month)}` }
      },
      focus: 'series',
      morph: false
    }
  }

  private readonly renderBreakdownBlock = (params: any, api: any): RenderItem => {
    const fill = colorPalettes[this.budgetNames.indexOf(api.value('name')) % colorPalettes.length]
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const style: any = { fill }
    if (yValue < 0) {
      style.fill = 'rgba(0, 0, 0, 0)'
      style.decal = {
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
      style,
      // emphasis: {
      //     style: style
      // },
      // blur: {
      //     style: style,
      // },
      focus: 'self'
      // blurScope: 'series',
    }
  }

  private readonly renderMonthlyAggregateBlock = (param: any, api: any): RenderItem => {
    const fill = '#321'
    const month = api.value('month')
    const yValue = api.value('yLength')
    const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart')
    const start = api.coord([api.value('xStart'), y])
    const size = api.size([api.value('xLength'), Math.abs(yValue)])

    const style: any = { fill }
    if (yValue < 0) {
      style.fill = 'rgba(0, 0, 0, 0)'
      style.decal = {
        symbol: 'rect',
        dashArrayX: [2, 0],
        dashArrayY: [3, 5],
        rotation: -Math.PI / 4,
        color: fill
      }
    }
    if (yValue === 0) {
      return
    }
    return {
      type: 'rect',
      shape: {
        x: start[0],
        y: start[1],
        width: size[0],
        height: size[1]
      },
      style: { fill: '#444444', textFill: '#c7c7c7', fontWeight: '800', opacity: 0.8, text: `${this.monthLabelGetter(month)}` },
      emphasis: {
        style: { fill: '#444444', textFill: '#c7c7c7', opacity: 1, text: `${this.monthLabelGetter(month)}` }
      },
      blur: {
        style: { fill: '#444444', textFill: '#ffffff', opacity: 0.8, text: `${this.monthLabelGetter(month)}` }
      },
      focus: 'self',
      blurScope: 'global'
    }
  }

  renderMonthlyAggregate = (param: any, api: any): RenderGroupItem => {
    if (api.value('type') === 'aggregate') {
      return {
        type: 'group',
        children: [
          this.renderMonthLegend(param, api),
          this.renderMonthlyAggregateBlock(param, api)
        ].filter(element => { return element !== undefined && element !== null })
      }
    }
  }

  renderMonthlyBreakdown = (param: any, api: any): RenderItem => {
    if (api.value('type') === 'aggregate') {
      return this.renderMonthLegend(param, api)
    }

    return this.renderBreakdownBlock(param, api)
  }

  // TODO: use this renderLine in Chart
  renderHorizontalLine = (valueFunction: (api: any) => number, param: any, api: any): any => {
    const h = valueFunction(api) / this.totalBudget * this.TOTAL_Y
    const start = api.coord([0, h])
    const end = api.coord([this.TOTAL_X, h])
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
