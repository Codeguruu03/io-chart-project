import { Component, Input, OnChanges } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ChartOptions, ChartSeries } from './chart.models';

@Component({
    selector: 'io-chart',
    standalone: true,
    imports: [NgIf, NgFor],
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges {

    @Input() chartOptions!: ChartOptions;

    maxValue: number = 0;
    totalValue: number = 0;

    ngOnChanges() {
        if (this.chartOptions?.series?.length) {
            this.maxValue = Math.max(...this.chartOptions.series.map(s => s.value));
            this.totalValue = this.chartOptions.series.reduce((a, b) => a + b.value, 0);
        }
    }

    // ── Column Chart ──────────────────────────────────────────────
    getBarHeight(value: number): number {
        if (this.maxValue === 0) return 0;
        return (value / this.maxValue) * 200;
    }

    getBarPercent(value: number): string {
        if (this.totalValue === 0) return '0%';
        return ((value / this.totalValue) * 100).toFixed(1) + '%';
    }

    // ── Line Chart ────────────────────────────────────────────────
    readonly svgWidth = 420;
    readonly svgHeight = 280;
    readonly padLeft = 50;
    readonly padBottom = 40;
    readonly padTop = 20;
    readonly padRight = 30;

    activeIndex: number = -1;

    get chartWidth(): number {
        return this.svgWidth - this.padLeft - this.padRight;
    }

    get chartHeight(): number {
        return this.svgHeight - this.padTop - this.padBottom;
    }

    getDotX(index: number): number {
        const count = this.chartOptions.series.length;
        if (count === 1) return this.padLeft + this.chartWidth / 2;
        return this.padLeft + (index / (count - 1)) * this.chartWidth;
    }

    getDotY(value: number): number {
        if (this.maxValue === 0) return this.padTop + this.chartHeight;
        return this.padTop + this.chartHeight - (value / this.maxValue) * this.chartHeight;
    }

    getLinePoints(): string {
        return this.chartOptions.series
            .map((s, i) => `${this.getDotX(i)},${this.getDotY(s.value)}`)
            .join(' ');
    }

    /** Smooth cubic bezier path through all data points */
    getSmoothPath(): string {
        const pts = this.chartOptions.series.map((s, i) => ({
            x: this.getDotX(i),
            y: this.getDotY(s.value)
        }));
        if (pts.length < 2) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpX = (prev.x + curr.x) / 2;
            d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        return d;
    }

    /** Closed area path for gradient fill under the line */
    getAreaPath(): string {
        const smooth = this.getSmoothPath();
        if (!smooth) return '';
        const last = this.chartOptions.series.length - 1;
        const baseY = this.padTop + this.chartHeight;
        return `${smooth} L ${this.getDotX(last)} ${baseY} L ${this.getDotX(0)} ${baseY} Z`;
    }

    getYTicks(): number[] {
        const steps = 5;
        return Array.from({ length: steps + 1 }, (_, i) =>
            Math.round((this.maxValue / steps) * i)
        );
    }

    // ── Pie Chart ─────────────────────────────────────────────────
    readonly cx = 150;
    readonly cy = 150;
    readonly r = 100;
    readonly innerR = 55; // donut hole radius

    activePieIndex: number = -1;

    getPieSlices(): Array<{
        path: string;
        hoverPath: string;
        color: string;
        name: string;
        percent: string;
        labelX: number;
        labelY: number;
    }> {
        if (!this.chartOptions?.series?.length || this.totalValue === 0) return [];

        const slices: ReturnType<typeof this.getPieSlices> = [];
        let startAngle = -Math.PI / 2; // start from top

        for (const item of this.chartOptions.series) {
            const fraction = item.value / this.totalValue;
            const endAngle = startAngle + fraction * 2 * Math.PI;

            slices.push({
                path: this.arcPath(startAngle, endAngle, this.r),
                hoverPath: this.arcPath(startAngle, endAngle, this.r + 8),
                color: item.color,
                name: item.name,
                percent: (fraction * 100).toFixed(1) + '%',
                labelX: this.cx + Math.cos((startAngle + endAngle) / 2) * (this.r * 0.65),
                labelY: this.cy + Math.sin((startAngle + endAngle) / 2) * (this.r * 0.65),
            });

            startAngle = endAngle;
        }
        return slices;
    }

    private arcPath(startAngle: number, endAngle: number, radius: number): string {
        const x1 = this.cx + Math.cos(startAngle) * radius;
        const y1 = this.cy + Math.sin(startAngle) * radius;
        const x2 = this.cx + Math.cos(endAngle) * radius;
        const y2 = this.cy + Math.sin(endAngle) * radius;
        const x1i = this.cx + Math.cos(startAngle) * this.innerR;
        const y1i = this.cy + Math.sin(startAngle) * this.innerR;
        const x2i = this.cx + Math.cos(endAngle) * this.innerR;
        const y2i = this.cy + Math.sin(endAngle) * this.innerR;
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x2i} ${y2i}`,
            `A ${this.innerR} ${this.innerR} 0 ${largeArc} 0 ${x1i} ${y1i}`,
            'Z'
        ].join(' ');
    }

    getPiePercent(value: number): string {
        if (this.totalValue === 0) return '0%';
        return ((value / this.totalValue) * 100).toFixed(1) + '%';
    }
}

