
import React, { useRef, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { type BudgetRecord } from './data.interface'
import { DataProcessor, BudgetData, ChartData } from './DataProcessor'
import { ChartRenders } from './ChartRenders'
import { monthLabels } from './Constants'

// DEFINE
const TOTAL_X = 100
const TOTAL_Y = 100

const MONTH_PER_YEAR = 12

// TYPES:
export interface BudgetChartConfig {
  year: number
  showMonthEndLine: number | null
  showAggregate: boolean
  locale: string
  currency: string
}

export interface BudgetChartProps {
  config: BudgetChartConfig
  value: BudgetRecord[]
}

type Series = Record<string, any>

export const BudgetChart: React.FC<BudgetChartProps> = (props) => {
  const instance = useRef<ReactECharts>(null)

  const config: BudgetChartConfig = props.config
  const budgetBreakdowns: BudgetRecord[] = props.value

  const dataProcessor = new DataProcessor(budgetBreakdowns, TOTAL_X, TOTAL_Y)

  function round (number: number, precision: number): number {
    const level = 10 ** precision
    return Math.round((number + Number.EPSILON) * level) / level
  }

  function displayAmount (amount: number): string {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency
    })

    return formatter.format(amount)
  }

  /**
   * Get label for a given month
   * @param {number} month in [0,11]
   * @returns {string}
   */
  function getMonthLabel (month: number): string {
    return monthLabels[month]
  }

  const totalBudget = dataProcessor.totalBudget
  const totalAmount = dataProcessor.totalAmount
  const highestY = Math.max(TOTAL_Y, dataProcessor.getHighestY())
  const lowestY = Math.min(0, dataProcessor.getLowestY())

  const budgetNames = dataProcessor.budgetNames

  const budgetData: BudgetData[] = dataProcessor.getBudgetData()

  const chartRender = new ChartRenders(budgetNames, totalBudget, TOTAL_X, TOTAL_Y, lowestY)

  /* DATASETS */
  // Index 0: Budget
  const budgetDataSet = [
    {
      id: 'budgets',
      dimensions: BudgetData.EChartsDataSetDimensions,
      source: budgetData
    }
  ]
  const _chartDataGroupByMonth: ChartData[][] = dataProcessor.getMonthlyAggregatedChartData()

  // Index [1,12]: Breakdown month 1-12
  const spendingBreakdownDataSet = _chartDataGroupByMonth.map((element: any, index: number) => {
    return {
      id: `spending-breakdown-month-${index}`, // [0,11]
      dimensions: ChartData.EChartsDataSetDimensions,
      source: element
    }
  })

  // Index [13,24]: Aggregate month 1-12
  const spendingAggregateDataSet = _chartDataGroupByMonth.map((element: ChartData[], index: number) => {
    return {
      id: `spending-aggregate-month-${index}`, // [0,11]
      dimensions: ChartData.EChartsDataSetDimensions,
      source: element.filter((element: ChartData) => element.type === 'aggregate')
    }
  })

  /* Series */

  // DataSetIndex 0: Budget
  const seriesBudgetLabels: Series = {
    type: 'custom',
    name: 'budgetLabels',
    id: 'budgetLabels',
    renderItem: chartRender.renderBudgetLabel,
    encode: {
      x: ['xStart', 'xLength'],
      y: ['yStart', 'yLength'],
      tooltip: ['name'],
      itemName: ['name']
    },
    tooltip: {
      formatter: function (params: { value: BudgetData }, ticket: string, callback: any) {
        return BudgetData.getEChartsTooltipFormatter(params.value, displayAmount)
      },
      textStyle: {
        align: 'left'
      }
    },
    datasetIndex: 0,
    zLevel: 10,
    z: 10
  }

  // DataSetIndex [1,12]: Breakdown month 1-12
  const seriesBreakdown: Series[] = spendingBreakdownDataSet.map((element: any, index: number) => {
    return {
      name: `breakdown-month-${index}`,
      id: `${index}`,
      type: 'custom',
      renderItem: chartRender.renderMonthlyBreakdown,
      encode: {
        itemId: 'month',
        x: ['xStart', 'xLength'],
        y: ['yStart', 'yLength'],
        tooltip: ['name', 'month', 'amount'],
        itemName: ['name', 'month'],
        itemGroupId: 'month'
      },
      tooltip: {
        formatter: function (params: { value: ChartData }, ticket: string, callback: any) {
          return ChartData.getEChartsTooltipFormatter(params.value, displayAmount, getMonthLabel)
        },
        textStyle: {
          align: 'left'
        }
      },
      datasetIndex: index + 1,
      zLevel: 20,
      z: 20,
      universalTransition: {
        enabled: true,
        delay: function (idx: any, count: any) {
          return 100 + (index + 1) * 100
        },
        divideShape: 'clone'
      }
    }
  })

  // DataSetIndex [13,24]: Aggregate month 13-24
  const seriesAggregate: Series[] = spendingAggregateDataSet.map((element: any, index: number) => {
    return {
      name: `aggregate-month-${index}`,
      id: `${index}`,
      type: 'custom',
      renderItem: chartRender.renderMonthlyAggregate,
      encode: {
        itemId: 'month',
        x: ['xStart', 'xLength'],
        y: ['yStart', 'yLength'],
        tooltip: ['name', 'month', 'amount'],
        itemName: ['name', 'month'],
        itemGroupId: 'month'
      },
      tooltip: {
        formatter: function (params: { value: ChartData }, ticket: string, callback: any) {
          return ChartData.getEChartsTooltipFormatter(params.value, displayAmount, getMonthLabel)
        },
        textStyle: {
          align: 'left'
        }
      },
      datasetIndex: index + MONTH_PER_YEAR + 1,
      zLevel: 30,
      z: 30,
      universalTransition: {
        enabled: true,
        delay: function (idx: any, count: any) {
          return 100 + (index + 1) * 100
        },
        divideShape: 'clone'
      }
    }
  })

  // Series: Total
  const seriesTotal: Series = {
    type: 'custom',
    name: 'total',
    id: 'total',
    renderItem: function (param: any, api: any) {
      const h = api.value(0) / totalBudget * TOTAL_Y
      const start = api.coord([0, h])
      const end = api.coord([TOTAL_X, h])
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
    },
    zLevel: 40,
    z: 40,
    tooltip: {
      formatter: function (params: any, ticket: string, callback: any) {
        return `
                        <b>Total</b> <hr/>
                        <div style="display: block">Annual Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value[0])}</b></div>
                        <div style="display: block">Annual Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value[1])}</b></div>
                        <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${displayAmount(params.value[0] - params.value[1])}</b></div>
                    `
      },
      textStyle: {
        align: 'left'
      }
    },
    data: [[totalBudget, totalAmount]]
  }

  // Series: Total
  const seriesCurrent = (currentMonth: number): Series => {
    return {
      type: 'custom',
      name: 'current',
      id: 'current',
      renderItem: function (param: any, api: any) {
        const h = api.value(0) / totalBudget * TOTAL_Y
        const start = api.coord([0, h])
        const end = api.coord([TOTAL_X, h])
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
            stroke: '#e71',
            lineWidth: 2
          }
        }
      },
      zLevel: 40,
      z: 40,
      tooltip: {
        formatter: function (params: any, ticket: string, callback: any) {
          return `
                            <b>Current</b> <hr/>
                            <div style="display: block">Current Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value[0])}</b></div>
                            <div style="display: block">Current Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value[1])}</b></div>
                            <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${displayAmount(params.value[0] - params.value[1])}</b></div>
                        `
        },
        textStyle: {
          align: 'left'
        }
      },
      data: [[totalBudget / MONTH_PER_YEAR * (currentMonth + 1), totalAmount]]
    }
  }

  function getSeries (aggregate: boolean, current: number | null): Series[] {
    const series: Series[][] = [[seriesBudgetLabels], [seriesTotal]]
    if (aggregate) {
      series.push(seriesAggregate)
    } else {
      series.push(seriesBreakdown)
    }
    if (current !== null && current >= 0 && current < MONTH_PER_YEAR) {
      series.push([seriesCurrent(current)])
    }
    return series.flat()
  }

  const series = getSeries(config.showAggregate, config.showMonthEndLine)
  const option = {
    title: {
      show: false
    },
    grid: {
      left: 30,
      right: 0,
      top: 10,
      bottom: 140,
      containLabel: true
    },
    aria: {
      enabled: true,
      decal: {
        show: true
      }
    },
    tooltip: {
      trigger: 'item'
    },
    dataset: [budgetDataSet, spendingBreakdownDataSet, spendingAggregateDataSet].flat(),
    xAxis: {
      min: 0,
      max: TOTAL_X,
      show: true,
      splitNumber: 5,
      axisLabel: {
        show: true,
        formatter: function (value: any, index: any) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return `${value}%`
        }
      },
      axisLine: {
        show: true
      }
    },
    yAxis: [
      {
        min: Math.floor(lowestY / 25) * 25,
        max: Math.ceil(highestY / 25) * 25,
        interval: TOTAL_Y / MONTH_PER_YEAR,
        splitNumber: MONTH_PER_YEAR,
        position: 'left',
        axisLabel: {
          show: false
        },
        axisLine: {
          lineStyle: {}
        },
        axisTick: {
          show: false
        }
      },
      {
        min: Math.floor(lowestY / 25) * 25,
        max: Math.ceil(highestY / 25) * 25,
        interval: TOTAL_Y / MONTH_PER_YEAR,
        splitNumber: MONTH_PER_YEAR,
        position: 'right',
        axisLabel: {
          show: true,
          formatter: function (value: number, index: any) {
            const rounded = round(value, 2)
            if (rounded % 25 !== 0) {
              return ''
            }
            // return [''].concat(monthLabels)[index];
            return `${round(value, 2)}%`
          }
        },
        axisLine: {
          lineStyle: {}
        },
        axisTick: {
          inside: false
        }
      }],
    series
  }

  useEffect(() => {
    const ins = instance.current?.getEchartsInstance()
    if (ins == null) return
    const series = getSeries(config.showAggregate, config.showMonthEndLine)
    ins.setOption({
      series: series.flat()
    }, {
      replaceMerge: ['series']
    })
  }, [config.showAggregate, config.showMonthEndLine])

  return <ReactECharts ref={instance} option={option} style={{ height: '100%' }} />
}
