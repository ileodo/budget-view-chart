# budget-view-chart

[![Deploy Github Page](https://github.com/ileodo/budget-view-chart/actions/workflows/static.yml/badge.svg)](https://github.com/ileodo/budget-view-chart/actions/workflows/static.yml)


![npm type definitions](https://img.shields.io/npm/types/budget-view-chart)
![NPM](https://img.shields.io/npm/l/budget-view-chart)
[![npm](https://img.shields.io/npm/v/budget-view-chart)](https://www.npmjs.com/package/budget-view-chart)
![npm](https://img.shields.io/npm/dw/budget-view-chart)


<a href="https://www.buymeacoffee.com/Ileodo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

A react Chart component specialising in display budget for personal finance.

> This component is built based on [echarts](https://echarts.apache.org/en/index.html).

[![Demo Button Icon]][Demo Link]

[Demo Link]: https://ileodo.github.io/budget-view-chart/
[Demo Button Icon]: https://img.shields.io/badge/Demo-EF2D?style=for-the-badge&logoColor=white


<p style="text-align:center;"><img src="./examples/1.png" width="800" alt="example"/></p>

# Get Started

```bash
npm install budget-view-chart
```

```react
<BudgetChart config={{
  showMonthEndLine: null,
  showAggregate: false,
  locale: 'en-GB',
  currency: 'GBP'}} value={dataset}/>

```
Example `dataset` can be find in [demo/src/data/](demo/src/data/)


# Visualisation

Breakdown View
<p style="text-align:center;"><img src="./examples/1.png" width="800" alt="example1"/></p>

Highlight on Budget Item
<p style="text-align:center;"><img src="./examples/2.png" width="800" alt="example2"/></p>

Highlight on Spending in a Whole Month
<p style="text-align:center;"><img src="./examples/3.png" width="800" alt="example3"/></p>

Highlight on Spending
<p style="text-align:center;"><img src="./examples/4.png" width="800" alt="example4"/></p>

Negative Spending (Income)
<p style="text-align:center;"><img src="./examples/5.png" width="800" alt="example5"/></p>

Aggregate View
<p style="text-align:center;"><img src="./examples/6.png" width="800" alt="example6"/></p>

Over Spending
<p style="text-align:center;"><img src="./examples/7.png" width="800" alt="example7"/></p>

Current Line
<p style="text-align:center;"><img src="./examples/8.png" width="800" alt="example8"/></p>


# Contribution

All contributions are welcomed, especially the following aspects:

- Standardise the repo
- Standardise the build/test/linting process
- Support custom styling
- Performance improvements
