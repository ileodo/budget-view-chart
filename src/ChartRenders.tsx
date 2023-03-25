import {monthLabels} from "./Constants";


const colorPalettes = [
    "#edae49",
    "#d1495b",
    "#00798c",
    "#30638e",
    "#003d5b",
    "#408e9a",
    "#80ded9",
    "#aeecef",
    "#bdadea",
    "#edae49",
    "#d1495b",
    "#00798c",
];

export class ChartRenders {
    budgetNames: string[];
    totalBudget: number;
    TOTAL_X: number;
    TOTAL_Y: number;
    lowestY: number;
    constructor(budgetNames: string[], totalBudget: number, TOTAL_X: number, TOTAL_Y: number, lowestY: number) {
        this.budgetNames = budgetNames;
        this.totalBudget = totalBudget;
        this.TOTAL_X = TOTAL_X;
        this.TOTAL_Y = TOTAL_Y;
        this.lowestY = lowestY
    }

    renderBudgetLabel = (params: any, api: any) => {

        return {
            type: 'group',
            children: [
                this.renderBudgetBlock(params, api),
                this.renderBudgetText(params, api)
            ],

            focus: 'self',
            blurScope: 'series',
        }
    }

    renderBudgetText = (params: any, api: any) => {
        const start = api.coord([api.value('xStart'), 0]);
        const size = api.size([api.value('xLength'), 0]);
        return {
            type: 'text',
            x: start[0] + size[0] / 2,
            y:api.coord([0, Math.floor(this.lowestY / 25)*25])[1] + 30 ,
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
                    opacity: 1,
                }
            },
        }
    }

    renderBudgetBlock = (params: any, api: any) => {
        let fill = colorPalettes[this.budgetNames.indexOf(api.value('name'))%colorPalettes.length];
        const yValue = api.value('yLength');
        const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart');
        const start = api.coord([api.value('xStart'), y]);
        const size = api.size([api.value('xLength'), Math.abs(yValue)]);

        let style: any = { fill: fill };
        if (yValue < 0) {
            style.fill = 'rgba(0, 0, 0, 0)'
            style.decal = {
                symbol: 'rect',
                dashArrayX: [2, 0],
                dashArrayY: [3, 5],
                rotation: -Math.PI / 4,
                color: fill,
            };
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
            blurScope: 'series',
        }
    }

    renderMonthLegend = (params: any, api: any) => {
        const month = api.value('month');
        const boxWidthPx = 30;
        const boxHeightVal = this.TOTAL_Y / 12;

        let monthSize = api.size([0, boxHeightVal]);
        let monthStart = api.coord([0, boxHeightVal * (month + 1)]);


        return {
            type: 'rect',
            id: `month-legend-${month}`,
            shape: {
                x: monthStart[0] - boxWidthPx,
                y: monthStart[1],
                width: boxWidthPx,
                height: monthSize[1]
            },
            style: { fill: '#444444', textFill: "#c7c7c7", fontWeight: "800", opacity: 0.8, text: `${monthLabels[month]}` },
            emphasis: {
                style: { fill: '#444444', textFill: "#c7c7c7", fontWeight: "800", opacity: 1, text: `${monthLabels[month]}` }
            },
            blur: {
                style: { fill: '#444444', textFill: "#ffffff", fontWeight: "800", opacity: 0.8, text: `${monthLabels[month]}` }
            },
            focus: 'series',
            morph: false,
        };
    }


    renderBlock = (params: any, api: any) => {

        let fill = colorPalettes[this.budgetNames.indexOf(api.value('name'))%colorPalettes.length];
        const yValue = api.value('yLength');
        const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart');
        const start = api.coord([api.value('xStart'), y]);
        const size = api.size([api.value('xLength'), Math.abs(yValue)]);

        let style: any = { fill: fill };
        if (yValue < 0) {
            style.fill = 'rgba(0, 0, 0, 0)';
            style.decal = {
                symbol: 'rect',
                dashArrayX: [2, 0],
                dashArrayY: [3, 5],
                rotation: -Math.PI / 4,
                color: fill,
            };
        }
        return {
            type: 'rect',
            shape: {
                x: start[0],
                y: start[1],
                width: size[0],
                height: size[1]
            },
            style: style,
            // emphasis: {
            //     style: style
            // },
            // blur: {
            //     style: style,
            // },
            focus: 'self',
            // blurScope: 'series',
        }
    }

    renderMonthlyBlockHelper = (param: any, api: any) => {
        let fill = '#321';
        const month = api.value('month');
        const yValue = api.value('yLength');
        const y = yValue < 0 ? api.value('yStart') : yValue + api.value('yStart');
        const start = api.coord([api.value('xStart'), y]);
        const size = api.size([api.value('xLength'), Math.abs(yValue)]);

        let style: any = { fill: fill };
        if (yValue < 0) {
            style.fill = 'rgba(0, 0, 0, 0)';
            style.decal = {
                symbol: 'rect',
                dashArrayX: [2, 0],
                dashArrayY: [3, 5],
                rotation: -Math.PI / 4,
                color: fill,
            };
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
            style: { fill: '#444444', textFill: "#c7c7c7", fontWeight: "800", opacity: 0.8, text: `${monthLabels[month]}` },
            emphasis: {
                style: { fill: '#444444', textFill: "#c7c7c7", opacity: 1, text: `${monthLabels[month]}` }
            },
            blur: {
                style: { fill: '#444444', textFill: "#ffffff", opacity: 0.8, text: `${monthLabels[month]}` }
            },
            focus: 'self',
            blurScope: 'global',
        }
    }

    renderMonthlyBlock = (param: any, api: any) => {
        if (api.value('name') === "") {
            return {
                type: 'group',
                children: [
                    this.renderMonthLegend(param, api),
                    this.renderMonthlyBlockHelper(param, api)
                ],
            }

        }

    }

    renderItemFunc = (param: any, api: any) => {

        if (api.value('name') === "") {
            return this.renderMonthLegend(param, api);
        }

        return this.renderBlock(param, api)

    }

    renderLine = (param: any, api: any) => {
        const h = api.value(0) / this.totalBudget * this.TOTAL_Y;
        const start = api.coord([0, h]);
        const end = api.coord([this.TOTAL_X, h]);
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
                stroke: api.visual('color'),
                lineWidth: 2
            },
        }
    }

}
