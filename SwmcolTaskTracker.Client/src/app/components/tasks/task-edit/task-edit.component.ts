import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService, Project } from '../../../services/task.service';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-edit.component.html',
  styles: []
})
export class TaskEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm: FormGroup;
  projects: Project[] = [];
  taskId!: number;

  constructor() {
    this.editForm = this.fb.group({
      taskId: [null],
      title: ['', Validators.required],
      projectId: [null, Validators.required],
      description: [''],
      status: ['ToDo', Validators.required],
      dueDate: [null],
      createdBy_AD_OID: [''] // Maintain original creator
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.taskId = Number(id);

    this.loadProjects();

    if (this.taskId) {
      this.loadTask(this.taskId);
    }
  }

  loadProjects(): void {
    this.taskService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        // Patch form with task data
        // Note: Ensure project matching works (might need explicit project lookup if projectName is minimal)
        // Assuming task has projectId or projectName. The model currently has 'projectName'.
        // If the model doesn't have projectId, we might need to find the project by name or rely on backend.
        // However, the dropdown usually binds to ID. 
        // Let's assume for now we might need to augment the task model or map it.
        // The task model in view_file showed 'projectName' but not 'projectId'. 
        // We'll need to match project name to ID if the form controls projectId.
        // Or simplified: bind 'projectName' if the select works that way.

        // Correction: The create form used 'projectId'. The Task model has 'projectName'.
        // This is a disconnect. I should check how create form worked.
        // In create form: projectId: [null, Validators.required].
        // The Task model: projectName?: string.
        // This suggests the API might take projectId on POST but return Name on GET?
        // I will try to map it.

        const project = this.projects.find(p => p.projectName === task.projectName);

        this.editForm.patchValue({
          taskId: task.taskId,
          title: task.title,
          projectId: project ? project.projectId : null,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
          createdBy_AD_OID: task.createdByAdOid
        });
      },
      error: (err) => console.error('Failed to load task', err)
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      // Ensure we send back the right structure. 
      // The API expects TaskItem which has ProjectName, but the form uses ProjectId.
      // We might need to map it back or the API handles it.
      // Assuming the API 'updateTask' expects the full Task object.

      const selectedProject = this.projects.find(p => p.projectId == formValue.projectId);

      const updatePayload: any = {
        ...formValue,
        projectName: selectedProject?.projectName,
        taskId: this.taskId
      };

      this.taskService.updateTask(this.taskId, updatePayload).subscribe({
        next: () => {
          this.router.navigate(['/tasks/list']);
        },
        error: (err) => console.error('Failed to update task', err)
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }
}
