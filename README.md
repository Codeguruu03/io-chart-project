# io-chart

> A custom, reusable Angular chart component — built with **zero external charting libraries**.

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![SVG](https://img.shields.io/badge/Charts-SVG%20%2B%20CSS-orange)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

`io-chart` is a standalone Angular component (`<io-chart>`) that renders three chart types — **Column**, **Line**, and **Pie** — using only HTML, CSS, and SVG. It accepts a single `[chartOptions]` input and handles all rendering internally.

---

## Screenshots

| Column Chart | Line Chart | Pie Chart |
|---|---|---|
| *(run `ng serve` to view)* | *(run `ng serve` to view)* | *(run `ng serve` to view)* |

> Open `http://localhost:4200` and use the chart type switcher to see all three chart types.

---

## Features

- ✅ **3 chart types** — Column, Line, Pie (Donut)
- ✅ **Zero external libraries** — pure Angular + SVG + CSS
- ✅ **Reusable component** — single `[chartOptions]` input
- ✅ **Hover tooltips** — on bars, line dots, and pie slices
- ✅ **Animations** — bars grow up, line draws in, pie fades in
- ✅ **Color-coded legend** — name + value for each series
- ✅ **Responsive** — adapts to mobile screen sizes
- ✅ **Premium UI** — gradient accents, animated background, Inter font

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Angular CLI ≥ 21

```bash
npm install -g @angular/cli
```

### Install & Run

```bash
# Clone the repository
git clone https://github.com/Codeguruu03/io-chart-project.git
cd io-chart-project/io-chart-project

# Install dependencies
npm install

# Start the dev server
ng serve
```

Open your browser at **http://localhost:4200**

---

## Usage

Import and use the `<io-chart>` component anywhere in your Angular app:

```typescript
import { ChartComponent } from './chart/chart.component';
import { ChartOptions } from './chart/chart.models';

@Component({
  standalone: true,
  imports: [ChartComponent],
  template: `<io-chart [chartOptions]="myOptions"></io-chart>`
})
export class MyComponent {
  myOptions: ChartOptions = {
    type: 'column',
    title: 'Monthly Sales',
    series: [
      { name: 'Jan', value: 120, color: '#6366f1' },
      { name: 'Feb', value: 85,  color: '#a78bfa' },
      { name: 'Mar', value: 200, color: '#7c3aed' },
    ]
  };
}
```

---

## ChartOptions API

```typescript
interface ChartOptions {
  type:   'column' | 'line' | 'pie';  // Chart type
  title:  string;                      // Chart heading
  series: ChartSeries[];               // Data points
}

interface ChartSeries {
  name:  string;   // Label for this data point
  value: number;   // Numeric value
  color: string;   // CSS color (hex, rgb, hsl, etc.)
}
```

### Input

| Property | Type | Required | Description |
|---|---|---|---|
| `chartOptions` | `ChartOptions` | ✅ | All chart configuration |
| `chartOptions.type` | `'column' \| 'line' \| 'pie'` | ✅ | Which chart to render |
| `chartOptions.title` | `string` | ✅ | Title displayed above the chart |
| `chartOptions.series` | `ChartSeries[]` | ✅ | Array of data points |

---

## Chart Types

### Column Chart
Vertical bars scaled to the maximum value. Features:
- Animated bar grow on load
- Value label above each bar
- X-axis labels (series names)
- Y-axis with 6 scale ticks
- Dashed horizontal grid lines
- Hover tooltip + brightness effect

### Line Chart
SVG smooth bezier curve through all data points. Features:
- Smooth cubic bezier path (not jagged polyline)
- Gradient area fill under the line
- X and Y axes with labels
- Dashed grid lines
- Colored dots at each data point
- Hover: vertical indicator line + SVG tooltip

### Pie Chart (Donut)
SVG arc path donut chart. Features:
- Mathematically precise arc segments (no overlap)
- Donut hole with total value in center
- Hover: slice expands outward
- Percentage labels inside each slice (if ≥ 8%)
- Hover tooltip at bottom of chart

---

## Project Structure

```
io-chart-project/
└── src/
    ├── styles.scss                  # Global CSS variables & reset
    ├── main.ts                      # Bootstrap AppComponent
    └── app/
        ├── app.component.ts         # Root component + sample data
        ├── app.component.html       # App shell + chart switcher
        ├── app.component.scss       # App shell styles
        └── chart/
            ├── chart.component.ts   # Chart logic & SVG helpers
            ├── chart.component.html # Chart templates (column/line/pie)
            ├── chart.component.scss # Chart styles & animations
            └── chart.models.ts      # ChartOptions & ChartSeries interfaces
```

---

## Implementation Details

### No External Libraries
All chart rendering is done with:
- **HTML `<div>`** for the column chart bars
- **SVG `<path>`** with cubic bezier commands for the line chart
- **SVG `<path>`** with arc commands (`A`) for the pie chart
- **CSS animations** (`@keyframes`) for all transitions

### Key Algorithms

**Column bar height:**
```typescript
getBarHeight(value: number): number {
  return (value / this.maxValue) * 200; // 200px max height
}
```

**Smooth bezier line:**
```typescript
// Midpoint control points for smooth S-curve
const cpX = (prev.x + curr.x) / 2;
d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
```

**Pie arc path:**
```typescript
// SVG arc: M startX startY A radius radius 0 largeArc 1 endX endY
// Donut: close path through inner radius arc
```

---

## Evaluation Criteria Mapping

| Criterion | Points | Implementation |
|---|---|---|
| **Angular Usage** | 20 | Standalone components, `@Input`, `OnChanges`, `NgFor`, `NgIf`, `TitleCasePipe` |
| **Chart Logic** | 25 | All 3 types: correct bar scaling, bezier line, arc pie — pure SVG/HTML |
| **Reusability** | 20 | Single `<io-chart [chartOptions]="...">` API, typed interfaces |
| **UI/CSS** | 15 | Animations, hover effects, gradient accents, responsive, Inter font |
| **Code Quality** | 10 | TypeScript interfaces, private helpers, clean separation of concerns |
| **Documentation** | 10 | This README with API docs, usage examples, project structure |

---

## Built With

- [Angular 21](https://angular.dev) — Framework
- [TypeScript](https://www.typescriptlang.org) — Language
- SVG — Chart rendering
- CSS / SCSS — Styling & animations
- [Inter](https://fonts.google.com/specimen/Inter) — Typography

---

## Author

**Naman** — Frontend Intern Assignment Submission
