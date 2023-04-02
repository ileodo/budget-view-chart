import React, { useRef, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { type BudgetRecord } from './data.interface'
import { DataProcessor, BudgetData, ChartData } from './DataProcessor'
import { ChartRenders } from './ChartRenders'
import { MONTH_PER_YEAR } from './Constants'

// DEFINE
const FULL_WIDTH = 100
const FULL_HEIGHT = 100

// TYPES:
export interface BudgetChartConfig {
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

function round (number: number, precision: number): number {
  const level = 10 ** precision
  return Math.round((number + Number.EPSILON) * level) / level
}

export const BudgetChart: React.FC<BudgetChartProps> = (props) => {
  const instance = useRef<ReactECharts>(null)

  const config: BudgetChartConfig = props.config
  const budgetBreakdowns: BudgetRecord[] = props.value

  const dataProcessor = new DataProcessor(budgetBreakdowns, FULL_WIDTH, FULL_HEIGHT)

  const totalBudget = dataProcessor.totalBudget
  const totalAmount = dataProcessor.totalAmount
  const highestY = Math.max(FULL_HEIGHT, dataProcessor.getHighestY())
  const lowestY = Math.min(0, dataProcessor.getLowestY())

  const budgetNames = dataProcessor.budgetNames
  const chartRender = new ChartRenders(budgetNames, totalBudget, FULL_WIDTH, FULL_HEIGHT, lowestY, config.locale, config.currency)

  /* DATASETS */
  // Index 0: Budget
  const budgetDataSet = [
    {
      id: 'budgets',
      dimensions: BudgetData.EChartsDataSetDimensions,
      source: dataProcessor.getBudgetData()
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
      y: ['yStart', 'yLength']
    },
    tooltip: {
      formatter: function (params: { value: BudgetData }, ticket: string, callback: any) {
        return chartRender.budgetDataTooltipFormatter(params.value)
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
        itemGroupId: 'month'
      },
      tooltip: {
        formatter: function (params: { value: ChartData }, ticket: string, callback: any) {
          return chartRender.chartDataTooltipFormatter(params.value)
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
        itemGroupId: 'month'
      },
      tooltip: {
        formatter: function (params: { value: ChartData }, ticket: string, callback: any) {
          return chartRender.chartDataTooltipFormatter(params.value)
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
    renderItem: chartRender.renderHorizontalLine.bind(chartRender, (api) => api.value(0)),
    zLevel: 40,
    z: 40,
    tooltip: {
      formatter: function (params: any, ticket: string, callback: any) {
        return chartRender.totalLineTooltipFormatter(params.value[0], params.value[1])
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
      renderItem: chartRender.renderHorizontalLine.bind(chartRender, (api) => api.value(0)),
      zLevel: 40,
      z: 40,
      tooltip: {
        formatter: function (params: any, ticket: string, callback: any) {
          return chartRender.currentMonthEndLineTooltipFormatter(params.value[0], params.value[1])
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
      max: FULL_WIDTH,
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
        interval: FULL_HEIGHT / MONTH_PER_YEAR,
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
        interval: FULL_HEIGHT / MONTH_PER_YEAR,
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

  return <ReactECharts ref={instance} option={option} style={{ height: '100%' }}/>
}
