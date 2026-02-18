import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    inject,
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ChartOptions } from './chart.models';

/**
 * `<io-chart>` — A reusable, standalone Angular chart component.
 *
 * Renders Column, Line, or Pie charts from a single `[chartOptions]` input.
 * Built with pure HTML, CSS, and SVG — no external charting libraries.
 *
 * @example
 * ```html
 * <io-chart [chartOptions]="{ type: 'column', title: 'Sales', series: [...] }"></io-chart>
 * ```
 */
@Component({
    selector: 'io-chart',
    standalone: true,
    imports: [NgIf, NgFor],
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnChanges {

    private readonly cdr = inject(ChangeDetectorRef);

    /** Chart configuration: type, title, and data series. */
    @Input() chartOptions!: ChartOptions;

    /** Maximum value across all series — used for scaling. */
    maxValue = 0;

    /** Sum of all series values — used for pie percentages. */
    totalValue = 0;

    /** Cached Y-axis tick values, recalculated on input change. */
    yTicks: number[] = [];

    /** Cached pie slice descriptors, recalculated on input change. */
    pieSlices: PieSlice[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chartOptions'] && this.chartOptions?.series?.length) {
            this.maxValue = Math.max(...this.chartOptions.series.map(s => s.value));
            this.totalValue = this.chartOptions.series.reduce((sum, s) => sum + s.value, 0);
            this.yTicks = this.computeYTicks();
            this.pieSlices = this.computePieSlices();
        }
    }

    // ── Column Chart ──────────────────────────────────────────────────────────

    /** Returns the pixel height for a bar, scaled to the max value. */
    getBarHeight(value: number): number {
        if (this.maxValue === 0) return 0;
        return (value / this.maxValue) * 200;
    }

    // ── Line Chart ────────────────────────────────────────────────────────────

    readonly svgWidth = 420;
    readonly svgHeight = 280;
    readonly padLeft = 50;
    readonly padBottom = 40;
    readonly padTop = 20;
    readonly padRight = 30;

    /** Index of the currently hovered data point (-1 = none). */
    private _activeIndex = -1;
    get activeIndex(): number { return this._activeIndex; }
    setActiveIndex(i: number): void { this._activeIndex = i; this.cdr.markForCheck(); }

    get chartWidth(): number { return this.svgWidth - this.padLeft - this.padRight; }
    get chartHeight(): number { return this.svgHeight - this.padTop - this.padBottom; }

    /** Returns the SVG X coordinate for a data point by index. */
    getDotX(index: number): number {
        const count = this.chartOptions.series.length;
        if (count === 1) return this.padLeft + this.chartWidth / 2;
        return this.padLeft + (index / (count - 1)) * this.chartWidth;
    }

    /** Returns the SVG Y coordinate for a data point by value. */
    getDotY(value: number): number {
        if (this.maxValue === 0) return this.padTop + this.chartHeight;
        return this.padTop + this.chartHeight - (value / this.maxValue) * this.chartHeight;
    }

    /**
     * Builds a smooth cubic bezier SVG path through all data points.
     * Uses midpoint control points for a natural S-curve appearance.
     */
    getSmoothPath(): string {
        const pts = this.chartOptions.series.map((s, i) => ({
            x: this.getDotX(i),
            y: this.getDotY(s.value),
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

    /** Returns a closed SVG path for the gradient area fill under the line. */
    getAreaPath(): string {
        const smooth = this.getSmoothPath();
        if (!smooth) return '';
        const last = this.chartOptions.series.length - 1;
        const baseY = this.padTop + this.chartHeight;
        return `${smooth} L ${this.getDotX(last)} ${baseY} L ${this.getDotX(0)} ${baseY} Z`;
    }

    // ── Pie Chart ─────────────────────────────────────────────────────────────

    readonly cx = 150;
    readonly cy = 150;
    readonly r = 100;
    readonly innerR = 55;

    /** Index of the currently hovered pie slice (-1 = none). */
    private _activePieIndex = -1;
    get activePieIndex(): number { return this._activePieIndex; }
    setActivePieIndex(i: number): void { this._activePieIndex = i; this.cdr.markForCheck(); }

    /**
     * Computes all pie slice descriptors from the current series data.
     * Called once in ngOnChanges and cached in `pieSlices`.
     */
    private computePieSlices(): PieSlice[] {
        if (!this.chartOptions?.series?.length || this.totalValue === 0) return [];

        const slices: PieSlice[] = [];
        let startAngle = -Math.PI / 2; // start from 12 o'clock

        for (const item of this.chartOptions.series) {
            const fraction = item.value / this.totalValue;
            const endAngle = startAngle + fraction * 2 * Math.PI;
            const midAngle = (startAngle + endAngle) / 2;

            slices.push({
                path: this.arcPath(startAngle, endAngle, this.r),
                hoverPath: this.arcPath(startAngle, endAngle, this.r + 8),
                color: item.color,
                name: item.name,
                value: item.value,
                percent: (fraction * 100).toFixed(1) + '%',
                labelX: this.cx + Math.cos(midAngle) * (this.r * 0.65),
                labelY: this.cy + Math.sin(midAngle) * (this.r * 0.65),
            });

            startAngle = endAngle;
        }
        return slices;
    }

    /**
     * Builds a donut arc SVG path between two angles.
     * The path traces the outer arc, then the inner arc in reverse to form a ring segment.
     */
    private arcPath(startAngle: number, endAngle: number, radius: number): string {
        const cos1 = Math.cos(startAngle), sin1 = Math.sin(startAngle);
        const cos2 = Math.cos(endAngle), sin2 = Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return [
            `M ${this.cx + cos1 * radius} ${this.cy + sin1 * radius}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${this.cx + cos2 * radius} ${this.cy + sin2 * radius}`,
            `L ${this.cx + cos2 * this.innerR} ${this.cy + sin2 * this.innerR}`,
            `A ${this.innerR} ${this.innerR} 0 ${largeArc} 0 ${this.cx + cos1 * this.innerR} ${this.cy + sin1 * this.innerR}`,
            'Z',
        ].join(' ');
    }

    // ── Shared Helpers ────────────────────────────────────────────────────────

    /** Computes 6 evenly-spaced Y-axis tick values from 0 to maxValue. */
    private computeYTicks(): number[] {
        const steps = 5;
        return Array.from({ length: steps + 1 }, (_, i) =>
            Math.round((this.maxValue / steps) * i)
        );
    }
}

/** Descriptor for a single pie/donut chart slice. */
export interface PieSlice {
    path: string;
    hoverPath: string;
    color: string;
    name: string;
    value: number;
    percent: string;
    labelX: number;
    labelY: number;
}
