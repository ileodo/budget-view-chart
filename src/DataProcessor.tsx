import { type BudgetRecord } from './data.interface'

/**
 * Data structure representing a budget item
 */
export class BudgetData {
  name: string
  description: string
  monthlyBudget: number
  amount: number
  // chart info
  xStart: number
  xLength: number
  yStart: number
  yLength: number
  static EChartsDataSetDimensions = [
    { name: 'name', type: 'ordinal' },
    { name: 'description', type: 'ordinal' },
    { name: 'monthlyBudget', type: 'float' },
    { name: 'amount', type: 'float' },
    { name: 'xStart', type: 'float' },
    { name: 'xLength', type: 'float' },
    { name: 'yStart', type: 'float' },
    { name: 'yLength', type: 'float' }
  ]

  // TODO: Move to Render
  static getEChartsTooltipFormatter = (data: BudgetData, numberFormatter: (number: number) => string): string => {
    return `
            <b>${data.name}</b> 
            <p>${data.description}</p> 
            <hr/>
            <div style="display: block">Annual Budget: <b style="float: right; margin-left:10px">${numberFormatter(data.monthlyBudget * 12)}</b></div>
            <div style="display: block">Annual Amount: <b style="float: right; margin-left:10px">${numberFormatter(data.amount)}</b></div>
            <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${numberFormatter(data.monthlyBudget * 12 - data.amount)}</b></div>
        `
  }
}

/**
 * Data structure representing a block on the chart
 */
export class ChartData {
  type: 'breakdown' | 'aggregate'
  name: string
  description: string
  monthlyBudget: number
  month: number
  amount: number
  // chart
  xStart: number
  xLength: number
  yStart: number
  yLength: number

  static EChartsDataSetDimensions = [
    { name: 'type', type: 'ordinal' },
    { name: 'name', type: 'ordinal' },
    { name: 'description', type: 'ordinal' },
    { name: 'monthlyBudget', type: 'float' },
    { name: 'xStart', type: 'float' },
    { name: 'xLength', type: 'float' },
    { name: 'month', type: 'ordinal' },
    { name: 'amount', type: 'float' },
    { name: 'yStart', type: 'float' },
    { name: 'yLength', type: 'float' }
  ]

  // TODO: Move to Render
  static getEChartsTooltipFormatter = (data: ChartData, numberFormatter: (number: number) => string, monthLabelGetter: (month: number) => string): string => {
    if (data.type === 'aggregate') {
      return `
                <b>${monthLabelGetter(data.month)}</b>  <hr/>
                <div style="display: block">Monthly Total Budget: <b style="float: right; margin-left:10px">${numberFormatter(data.monthlyBudget)}</b></div>
                <div style="display: block">Monthly Total Amount: <b style="float: right; margin-left:10px">${numberFormatter(data.amount)}</b></div>
            `
    } else if (data.type === 'breakdown') {
      return `
                <b>${data.name}</b> <br/>
                <b>${monthLabelGetter(data.month)}</b> <hr/>
                <div style="display: block">Monthly Budget: <b style="float: right; margin-left:10px">${numberFormatter(data.monthlyBudget)}</b></div>
                <div style="display: block">Monthly Amount: <b style="float: right; margin-left:10px">${numberFormatter(data.amount)}</b></div>
            `
    } else {
      throw new Error('Unknown type')
    }
  }
}

export class DataProcessor {
  budgetRecords: BudgetRecord[]
  TOTAL_X: number
  TOTAL_Y: number
  totalBudget: number
  totalAmount: number
  budgetNames: string[]

  /**
   * Construct a DataProcessor
   * @param {BudgetRecord[]} budgetRecords
   * @param {number} TOTAL_X
   * @param {number} TOTAL_Y
   */
  constructor (budgetRecords: BudgetRecord[], TOTAL_X: number, TOTAL_Y: number) {
    this.budgetRecords = budgetRecords
    // TODO: Validate BudgetRecord
    this.TOTAL_X = TOTAL_X
    this.TOTAL_Y = TOTAL_Y

    this.totalBudget = this.budgetRecords.reduce((acc: number, cur: BudgetRecord) => {
      return acc + cur.monthlyBudget * 12
    }, 0)

    this.totalAmount = this.budgetRecords.reduce((acc: number, cur: BudgetRecord) => {
      return acc + cur.monthlyAmount.reduce((acc: number, cur: number) => {
        return acc + cur
      }, 0)
    }, 0)

    this.budgetNames = this.budgetRecords.reduce((acc: string[], cur: BudgetRecord) => {
      if (!acc.includes(cur.name)) {
        acc.push(cur.name)
      }
      return acc
    }, [])
  }

  getHighestY = (): number => {
    return this.budgetRecords.reduce((acc: number, cur: BudgetRecord) => {
      const budgetAmount = cur.monthlyAmount.reduce((acc: number, cur: number) => {
        return acc + cur
      }, 0)

      const budgetWidth = cur.monthlyBudget / (this.totalBudget / 12) * this.TOTAL_X
      const height = (budgetAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / budgetWidth

      if (height > acc) {
        return height
      } else {
        return acc
      }
    }, 0)
  }

  getLowestY = (): number => {
    return this.budgetRecords.reduce((acc: number, cur: BudgetRecord) => {
      const lowestAmount = cur.monthlyAmount.reduce((acc: number[], cur: any) => {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const currentAccumulatedAmount = acc[0] + cur
        if (currentAccumulatedAmount < acc[1]) {
          return [currentAccumulatedAmount, currentAccumulatedAmount]
        } else {
          return [currentAccumulatedAmount, acc[1]]
        }
      }, [0, 0])[1]

      const budgetWidth = cur.monthlyBudget / (this.totalBudget / 12) * this.TOTAL_X
      const height = (lowestAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / budgetWidth

      if (height < acc) {
        return height
      } else {
        return acc
      }
    }, 0)
  }

  getBudgetData = (): BudgetData[] => {
    const budgetData: BudgetData[] = []

    let xTrack = [0, 0] // [xStart, xLength]
    this.budgetRecords.forEach((element: BudgetRecord) => {
      // assert(element.monthlyBudget.amount>=0);
      const data = new BudgetData()
      data.name = element.name
      data.description = element.description
      data.monthlyBudget = element.monthlyBudget

      data.xStart = xTrack[0] + xTrack[1]
      data.xLength = element.monthlyBudget / (this.totalBudget / 12) * this.TOTAL_X
      data.amount = element.monthlyAmount.reduce((acc: number, cur: number) => acc + cur, 0)

      data.yStart = 0
      data.yLength = this.TOTAL_Y
      budgetData.push(Object.assign({}, data))
      xTrack = [data.xStart, data.xLength]
    })
    return budgetData
  }

  /**
   *
   * @returns {ChartData[]}
   */
  getChartData = (): ChartData[] => {
    const chartData: ChartData[] = []

    let xTrack = [0, 0] // [xStart, xLength]
    this.budgetRecords.forEach((budgetRecord: BudgetRecord) => {
      // assert(element.monthlyBudget.amount>=0);
      const breakdownData = new ChartData()
      breakdownData.type = 'breakdown'
      breakdownData.name = budgetRecord.name
      breakdownData.description = budgetRecord.description
      breakdownData.monthlyBudget = budgetRecord.monthlyBudget

      breakdownData.xStart = xTrack[0] + xTrack[1]
      breakdownData.xLength = budgetRecord.monthlyBudget / (this.totalBudget / 12) * this.TOTAL_X
      xTrack = [breakdownData.xStart, breakdownData.xLength]
      let yTrack = [0, 0] // [yStart, yLength]
      for (let month = 0; month < budgetRecord.monthlyAmount.length; month++) {
        const monthlyAmount = budgetRecord.monthlyAmount[month]

        breakdownData.month = month
        breakdownData.amount = monthlyAmount

        breakdownData.yStart = yTrack[0] + yTrack[1]
        breakdownData.yLength = (monthlyAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / breakdownData.xLength
        yTrack = [breakdownData.yStart, breakdownData.yLength]
        chartData.push(Object.assign({}, breakdownData))
      }
    })
    return chartData
  }

  getMonthlyAggregatedChartData = (): ChartData[][] => {
    const groupByMonth = this.getChartData().reduce((aggPerMonth: ChartData[][], breakdownData: ChartData) => {
      aggPerMonth[breakdownData.month].push(breakdownData)
      return aggPerMonth
    }, Array.from(Array(12), () => new Array(0)))

    let yTrack = [0, 0] // [yStart, yLength]

    return groupByMonth.map((monthlyBreakdownDataArray: ChartData[], index: number) => {
      const month = index
      const monthTotalBudget = monthlyBreakdownDataArray.reduce((acc: number, cur: ChartData) => acc + cur.monthlyBudget, 0)
      const monthTotalAmount = monthlyBreakdownDataArray.reduce((acc: number, cur: ChartData) => acc + cur.amount, 0)
      const monthlyAggregateData = new ChartData()
      monthlyAggregateData.name = ''
      monthlyAggregateData.type = 'aggregate'
      monthlyAggregateData.description = ''
      monthlyAggregateData.monthlyBudget = monthTotalBudget
      monthlyAggregateData.xStart = 0
      monthlyAggregateData.xLength = this.TOTAL_X
      monthlyAggregateData.month = month
      monthlyAggregateData.amount = monthTotalAmount
      monthlyAggregateData.yStart = yTrack[0] + yTrack[1]
      monthlyAggregateData.yLength = (monthTotalAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / monthlyAggregateData.xLength
      yTrack = [monthlyAggregateData.yStart, monthlyAggregateData.yLength]
      return monthlyBreakdownDataArray.concat([Object.assign({}, monthlyAggregateData)])
    })
  }
}
