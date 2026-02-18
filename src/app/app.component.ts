import { Component } from '@angular/core';
import { NgFor, TitleCasePipe } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { ChartOptions } from './chart/chart.models';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ChartComponent, NgFor, TitleCasePipe],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    activeType: 'line' | 'column' | 'pie' = 'column';

    readonly chartTypes: Array<'line' | 'column' | 'pie'> = ['column', 'line', 'pie'];

    readonly chartData: ChartOptions = {
        type: 'column',
        title: 'Sales Report',
        series: [
            { name: 'Jan', value: 40, color: '#6366f1' },
            { name: 'Feb', value: 65, color: '#8b5cf6' },
            { name: 'Mar', value: 50, color: '#a78bfa' },
            { name: 'Apr', value: 80, color: '#7c3aed' },
            { name: 'May', value: 55, color: '#4f46e5' },
        ]
    };

    get options(): ChartOptions {
        return { ...this.chartData, type: this.activeType };
    }

    setType(type: 'line' | 'column' | 'pie') {
        this.activeType = type;
    }

    getIcon(type: 'line' | 'column' | 'pie'): string {
        const icons: Record<string, string> = {
            column: '▊',
            line: '〰',
            pie: '◕'
        };
        return icons[type] ?? '';
    }
}
