import { type BudgetRecord } from './data.interface'

export class BudgetData {
  name: string
  description: string
  monthlyBudget: number
  amount: number
  // chart
  xStart: number
  xLength: number
  yStart: number
  yLength: number
}

export class ChartData {
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
}

export class DataProcessor {
  budgetRecords: BudgetRecord[]
  TOTAL_X: number
  TOTAL_Y: number
  totalBudget: number
  totalAmount: number
  budgetNames: string[]

  constructor (budgetBreakdowns: BudgetRecord[], TOTAL_X: number, TOTAL_Y: number) {
    this.budgetRecords = budgetBreakdowns
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
    this.budgetRecords.forEach((element: BudgetRecord) => {
      // assert(element.monthlyBudget.amount>=0);
      const data = new ChartData()
      data.name = element.name
      data.description = element.description
      data.monthlyBudget = element.monthlyBudget

      data.xStart = xTrack[0] + xTrack[1]
      data.xLength = element.monthlyBudget / (this.totalBudget / 12) * this.TOTAL_X
      xTrack = [data.xStart, data.xLength]
      let yTrack = [0, 0] // [yStart, yLength]
      for (let month = 0; month < element.monthlyAmount.length; month++) {
        const monthlyAmount = element.monthlyAmount[month]

        data.month = month
        data.amount = monthlyAmount

        data.yStart = yTrack[0] + yTrack[1]
        data.yLength = (monthlyAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / data.xLength
        yTrack = [data.yStart, data.yLength]
        chartData.push(Object.assign({}, data))
      }
    })
    return chartData
  }

  getMonthlyAggregatedChartData = (): ChartData[][] => {
    const groupByMonth = this.getChartData().reduce((aggPerMonth: ChartData[][], cur: ChartData) => {
      aggPerMonth[cur.month].push(cur)
      return aggPerMonth
    }, Array.from(Array(12), () => new Array(0)))

    let yTrack = [0, 0] // [yStart, yLength]

    return groupByMonth.map((element: ChartData[], month: number) => {
      const monthTotalBudget = element.reduce((acc: number, cur: ChartData) => acc + cur.monthlyBudget, 0)
      const monthTotalAmount = element.reduce((acc: number, cur: ChartData) => acc + cur.amount, 0)
      const monthTotalData = new ChartData()
      monthTotalData.name = ''
      monthTotalData.description = ''
      monthTotalData.monthlyBudget = monthTotalBudget
      monthTotalData.xStart = 0
      monthTotalData.xLength = this.TOTAL_X
      monthTotalData.month = month
      monthTotalData.amount = monthTotalAmount
      monthTotalData.yStart = yTrack[0] + yTrack[1]
      monthTotalData.yLength = (monthTotalAmount / this.totalBudget) * (this.TOTAL_X * this.TOTAL_Y) / monthTotalData.xLength
      yTrack = [monthTotalData.yStart, monthTotalData.yLength]
      return element.concat([Object.assign({}, monthTotalData)])
    })
  }
}
