/**
 * Data model for the `<io-chart>` component.
 *
 * @example
 * ```typescript
 * const options: ChartOptions = {
 *   type: 'column',
 *   title: 'Monthly Revenue',
 *   series: [
 *     { name: 'Jan', value: 120, color: '#6366f1' },
 *     { name: 'Feb', value: 85,  color: '#a78bfa' },
 *   ]
 * };
 * ```
 */

/** A single data point in the chart series. */
export interface ChartSeries {
    /** Display label for this data point (shown on axes and legend). */
    name: string;
    /** Numeric value — determines bar height, line position, or pie slice size. */
    value: number;
    /** CSS color string (hex, rgb, hsl, etc.) used to render this series. */
    color: string;
}

/** Configuration object passed to `<io-chart [chartOptions]="...">`. */
export interface ChartOptions {
    /** The chart type to render. */
    type: 'line' | 'column' | 'pie';
    /** Title displayed at the top of the chart card. */
    title: string;
    /** Array of data points to visualize. */
    series: ChartSeries[];
}
