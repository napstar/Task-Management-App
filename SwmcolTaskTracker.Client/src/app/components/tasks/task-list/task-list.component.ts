import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';
import { TaskActionsRendererComponent } from '../task-actions-renderer/task-actions-renderer.component';

@Component({
    selector: 'app-task-list',
    standalone: true,
    imports: [CommonModule, AgGridAngular, TaskActionsRendererComponent],
    templateUrl: './task-list.component.html',
    styles: [`
    :host { display: block; height: 100%; }
    .ag-theme-quartz { height: 600px; width: 100%; }
  `]
})
export class TaskListComponent implements OnInit {
    private taskService = inject(TaskService);

    tasks: Task[] = [];
    gridApi!: GridApi;

    // Context passed to renderer
    context = { componentParent: this };

    // Column Definitions: Title, Project Name, Status, Due Date, Actions
    colDefs: ColDef[] = [
        { field: 'title', headerName: 'Task Title', sortable: true, filter: true, flex: 2 },
        { field: 'projectName', headerName: 'Project Name', sortable: true, filter: true, flex: 1 },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            flex: 1,
            cellClassRules: {
                'text-green-600 font-bold': params => params.value === 'Completed',
                'text-red-600 font-bold': params => params.value === 'Blocked',
                'text-yellow-600': params => params.value === 'InProgress'
            }
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            sortable: true,
            filter: 'agDateColumnFilter',
            flex: 1,
            valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : ''
        },
        {
            headerName: 'Actions',
            field: 'taskId',
            cellRenderer: TaskActionsRendererComponent,
            flex: 1,
            sortable: false,
            filter: false
        }
    ];

    defaultColDef: ColDef = {
        resizable: true
    };

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        this.taskService.getAllTasks().subscribe({
            next: (data) => {
                this.tasks = data;
                console.log('Task List Component loaded tasks:', data);
            },
            error: (err) => console.error('Failed to load tasks', err)
        });
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
    }

    onDeleteTask(id: number) {
        console.log('Parent component deleting task id:', id);
        this.taskService.deleteTask(id).subscribe({
            next: () => {
                console.log('Delete successful, refreshing list...');
                this.loadTasks(); // Refresh list from server
            },
            error: (err) => console.error('Error deleting task', err)
        });
    }
}
