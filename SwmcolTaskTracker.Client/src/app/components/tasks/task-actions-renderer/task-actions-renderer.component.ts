import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-actions-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex space-x-2">
      <button (click)="onEdit()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm">
        Edit
      </button>
      <button (click)="onDelete()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
        Delete
      </button>
    </div>
  `,
  styles: []
})
export class TaskActionsRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;
  private router = inject(Router);

  taskId!: number;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.taskId = params.data.taskId;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.taskId = params.data.taskId;
    return true;
  }

  onEdit(): void {
    console.log('Edit clicked for ID:', this.taskId);
    this.router.navigate(['/tasks/edit', this.taskId]);
  }

  onDelete(): void {
    console.log('Delete clicked for ID:', this.taskId);
    if (confirm('Are you sure you want to delete this task?')) {
      // Call parent component method via context
      if (this.params.context && this.params.context.componentParent) {
        this.params.context.componentParent.onDeleteTask(this.taskId);
      } else {
        console.error('Context not found for Delete action');
      }
    }
  }
}
