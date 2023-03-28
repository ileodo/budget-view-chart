
import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {BudgetRecord } from './data.interface'
import {DataProcessor, BudgetData, ChartData} from "./DataProcessor";
import {ChartRenders} from "./ChartRenders";
import {monthLabels} from "./Constants";

// DEFINE
const TOTAL_X = 100;
const TOTAL_Y = 100;


// HELPERS:


export interface BudgetChartConfig {
    year: number,
    month: number,
    showCurrentLine?: boolean,
    showAggregate: boolean,
}

export interface BudgetChartProps {
    config: BudgetChartConfig,
    value: BudgetRecord[]
}



export const BudgetChart: React.FC<BudgetChartProps> = (props) => {
    const instance = useRef<ReactECharts>(null);

    const config: BudgetChartConfig = props.config
    const budgetBreakdowns: BudgetRecord[] = props.value;

    const month: number = config.month;

    const dataProcessor = new DataProcessor(budgetBreakdowns, TOTAL_X, TOTAL_Y);
    const locala = "en-GB"
    const currency = "GBP"

    function round(number: number, precision: number) {
        const level = 10 ** precision;
        return Math.round((number + Number.EPSILON) * level) / level;
    }

    function displayAmount(amount: number) {
        let formatter = new Intl.NumberFormat(locala, {
            style: 'currency',
            currency: currency,
        });

        return formatter.format(amount);
    }
    const totalBudget = dataProcessor.totalBudget;
    const totalAmount = dataProcessor.totalAmount;
    const highestY = Math.max(TOTAL_Y, dataProcessor.getHighestY());
    const lowestY = Math.min(0, dataProcessor.getLowestY());

    const budgetNames = dataProcessor.budgetNames;

    const budgetData: BudgetData[] = dataProcessor.getBudgetData();

    const chartRender = new ChartRenders(budgetNames, totalBudget, TOTAL_X, TOTAL_Y, lowestY);


    // DATASETS
    const budgetDataSet = [
        {
            id: 24,
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'description', type: 'ordinal' },
                { name: 'monthlyBudget', type: 'float' },
                { name: 'amount', type: 'float' },
                { name: 'xStart', type: 'float' },
                { name: 'xLength', type: 'float' },
                { name: 'yStart', type: 'float' },
                { name: 'yLength', type: 'float' },
            ],
            source: budgetData
        }
    ];
    const chartDataGroupByMonth:ChartData[][] = dataProcessor.getMonthlyAggregatedChartData();

    const spendingDataSet = chartDataGroupByMonth.map((element: any, index: number) => {
        return {
            id: `breakdown-month-${index}`, //[0,11]
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'description', type: 'ordinal' },
                { name: 'monthlyBudget', type: 'float' },
                { name: 'xStart', type: 'float' },
                { name: 'xLength', type: 'float' },
                { name: 'month', type: 'ordinal' },
                { name: 'amount', type: 'float' },
                { name: 'yStart', type: 'float' },
                { name: 'yLength', type: 'float' },
            ],
            source: element
        }
    });

    const spendingAggregateDataSet = chartDataGroupByMonth.map((element: any, index: number) => {
        return {
            id: `aggregate-month-${index}`, //[0,11]
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'description', type: 'ordinal' },
                { name: 'monthlyBudget', type: 'float' },
                { name: 'xStart', type: 'float' },
                { name: 'xLength', type: 'float' },
                { name: 'month', type: 'ordinal' },
                { name: 'amount', type: 'float' },
                { name: 'yStart', type: 'float' },
                { name: 'yLength', type: 'float' },
            ],
            source: element.filter((element: any) => element.name === "")
        }
    });

    const seriesData = spendingDataSet.map((element: any, index: number) => {
        return {
            name: `${monthLabels[index]}`,
            id: `${monthLabels[index]}`,
            type: 'custom',
            renderItem: chartRender.renderItemFunc,
            encode: {
                itemId: 'month',
                x: ['xStart', 'xLength'],
                y: ['yStart', 'yLength'],
                tooltip: ['name', 'month', 'amount'],
                itemName: ['name', 'month'],
                itemGroupId: 'month',
            },
            tooltip: {
                formatter: function (params: any, ticket: string, callback: any) {
                    if (params.value.name === "") {
                        return `
                                <b>${monthLabels[params.value.month]}</b>  <hr/>
                                <div style="display: block">Monthly Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value.monthlyBudget)}</b></div>
                                <div style="display: block">Monthly Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value.amount)}</b></div>
                            `
                    } else {
                        return `
                                <b>${params.value.name}</b> <br/>
                                <b>${monthLabels[params.value.month]}</b> <hr/>
                                <div style="display: block">Monthly Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value.monthlyBudget)}</b></div>
                                <div style="display: block">Monthly Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value.amount)}</b></div>
                            `
                    }
                },
                textStyle: {
                    align: 'left',
                },
            },
            datasetIndex: index,
            zLevel: 20,
            z: 20,
            universalTransition: {
                enabled: true,
                delay: function (idx: any, count: any) {
                    return 100 + (index + 1) * 100;
                },
                divideShape: 'clone',
            },
        };
    })


    const seriesTotalBox = spendingAggregateDataSet.map((element: any, index: number) => {
        return {
            name: `${monthLabels[index]}`,
            id: `${monthLabels[index]}`,
            type: 'custom',
            renderItem: chartRender.renderMonthlyBlock,
            encode: {
                itemId: 'month',
                x: ['xStart', 'xLength'],
                y: ['yStart', 'yLength'],
                tooltip: ['name', 'month', 'amount'],
                itemName: ['name', 'month'],
                itemGroupId: 'month',
            },
            tooltip: {
                formatter: function (params: any, ticket: string, callback: any) {
                    if (params.value.name === "") {
                        return `
                                <b>${monthLabels[params.value.month]}</b>  <hr/>
                                <div style="display: block">Monthly Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value.monthlyBudget)}</b></div>
                                <div style="display: block">Monthly Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value.amount)}</b></div>
                            `
                    } else {
                    }
                },
                textStyle: {
                    align: 'left',
                },
            },
            datasetIndex: index + 12,
            zLevel: 30,
            z: 30,
            universalTransition: {
                enabled: true,
                delay: function (idx: any, count: any) {
                    return 100 + (index + 1) * 100;
                },
                divideShape: 'clone',
            }
        };
    })


    // Series: Total
    const seriesTotal = [{
        type: 'custom',
        name: 'total',
        id: 'total',
        renderItem: function (param: any, api: any) {
            const h = api.value(0) / totalBudget * TOTAL_Y;
            const start = api.coord([0, h]);
            const end = api.coord([TOTAL_X, h]);
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
                    stroke: "#e43",
                    lineWidth: 2
                },
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
                align: 'left',
            },
        },
        data: [[totalBudget, totalAmount]],
    }];

    // Series: Total
    const seriesCurrent = [{
        type: 'custom',
        name: 'current',
        id: 'current',
        renderItem: function (param: any, api: any) {
            const h = api.value(0) / totalBudget * TOTAL_Y;
            const start = api.coord([0, h]);
            const end = api.coord([TOTAL_X, h]);
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
                    stroke: "#e71",
                    lineWidth: 2
                },
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
                align: 'left',
            },
        },
        data: [[totalBudget / 12 * (month + 1), totalAmount]],
    }];


    const seriesBudgetLabels = [{
        type: 'custom',
        name: 'budgetLabels',
        id: 'budgetLabels',
        renderItem: chartRender.renderBudgetLabel,
        encode: {
            x: ['xStart', 'xLength'],
            y: ['amount'],
            tooltip: ['name'],
            itemName: ['name']
        },
        tooltip: {
            formatter: function (params: any, ticket: string, callback: any) {
                return `
                            <b>${params.value.name}</b> 
                            <b>${params.value.description}</b> 
                            <hr/>
                            <div style="display: block">Annual Budget: <b style="float: right; margin-left:10px">${displayAmount(params.value.monthlyBudget * 12)}</b></div>
                            <div style="display: block">Annual Amount: <b style="float: right; margin-left:10px">${displayAmount(params.value.amount)}</b></div>
                            <div style="display: block">Left to Spend: <b style="float: right; margin-left:10px">${displayAmount(params.value.monthlyBudget * 12 - params.value.amount)}</b></div>
                        `
            },
            textStyle: {
                align: 'left',
            },
        },
        datasetIndex: 24,
        zLevel: 10,
        z: 10
    }]


    function getSeries(aggregate: boolean, current: boolean) {
        let series: any[] = [seriesBudgetLabels, seriesTotal];
        if (aggregate) {
            series.push(seriesTotalBox)
        } else {
            series.push(seriesData);

        }
        if (current) {
            series.push(seriesCurrent)
        }
        return series;
    }


    let series = getSeries(config.showAggregate, config.showCurrentLine as boolean);
    const option = {
        title: {
            show: false,
        },
        grid: {
            left: 30,
            right: 0,
            top: 10,
            bottom: 140,
            containLabel: true,
        },
        aria: {
            enabled: true,
            decal: {
                show: true
            }
        },
        tooltip: {
            trigger: 'item',
        },
        dataset: [spendingDataSet, spendingAggregateDataSet, budgetDataSet].flat(),
        xAxis: {
            min: 0,
            max: TOTAL_X,
            show: true,
            splitNumber: 5,
            axisLabel: {
                show: true,
                formatter: function (value:any, index:any) {
                    return `${value}%`;
                },
            },
            axisLine: {
                show: true,
            },
        },
        yAxis: [
            {
                min: Math.floor(lowestY / 25) * 25,
                max: Math.ceil(highestY / 25) * 25,
                interval: TOTAL_Y / 12,
                splitNumber: 12,
                position: 'left',
                axisLabel: {
                    show: false,
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
                interval: TOTAL_Y / 12,
                splitNumber: 12,
                position: 'right',
                axisLabel: {
                    show: true,// @ts-ignore
                    formatter: function (value, index) {
                        const rounded = round(value, 2);
                        if (rounded % 25 !== 0) {
                            return ``;
                        }
                        // return [''].concat(monthLabels)[index];
                        return `${round(value, 2)}%`;
                    },
                },
                axisLine: {
                    lineStyle: {}
                },
                axisTick: {
                    inside: false,
                }
            }],
        series: series.flat(),
    };

    useEffect(() => {
        let ins = instance.current?.getEchartsInstance();
        if(!ins) return;
        let series = getSeries(config.showAggregate, config.showCurrentLine as boolean);
        ins.setOption({
            series: series.flat(),
        }, {
            replaceMerge: ['series'],
        });
    }, [config.showAggregate, config.showCurrentLine])

    return <ReactECharts ref={instance} option={option} style={{ height: "100%" }} />;

}


