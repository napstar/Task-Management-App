import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective], // Add TaskListComponent here when created
    templateUrl: './dashboard.component.html',
    styleUrls: []
})
export class DashboardComponent implements OnInit {
    private taskService = inject(TaskService);

    tasks: Task[] = [];

    // Metrics
    totalTasks = 0;
    pendingTasks = 0;
    blockedTasks = 0;
    completedTasks = 0;

    // Chart Data
    statusPieChartData: ChartData<'pie'> = {
        labels: [],
        datasets: [{ data: [] }]
    };

    projectBarChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{ data: [], label: 'Tasks by Project' }]
    };

    chartOptions: ChartOptions = {
        responsive: true,
    };

    ngOnInit(): void {
        this.taskService.getTasks().subscribe({
            next: (data) => {
                this.tasks = data;
                this.calculateMetrics();
                this.prepareCharts();
            },
            error: (err) => console.error('Failed to load tasks', err)
        });
    }

    private calculateMetrics(): void {
        this.totalTasks = this.tasks.length;
        this.pendingTasks = this.tasks.filter(t => t.status === 'ToDo' || t.status === 'InProgress').length;
        this.blockedTasks = this.tasks.filter(t => t.status === 'Blocked').length;
        this.completedTasks = this.tasks.filter(t => t.status === 'Completed').length;
    }

    private prepareCharts(): void {
        // 1. Status Pie Chart
        const statusCounts = this.tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        this.statusPieChartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'] // Blue, Red, Green, Yellow
            }]
        };

        // 2. Project Bar Chart
        const projectCounts = this.tasks.reduce((acc, task) => {
            const proj = task.projectName || 'Unassigned';
            acc[proj] = (acc[proj] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        this.projectBarChartData = {
            labels: Object.keys(projectCounts),
            datasets: [{
                data: Object.values(projectCounts),
                label: 'Tasks',
                backgroundColor: '#6366f1' // Indigo
            }]
        };
    }
}
