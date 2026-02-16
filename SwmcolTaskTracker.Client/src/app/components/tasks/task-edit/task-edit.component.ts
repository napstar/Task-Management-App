import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

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
  private projectService = inject(ProjectService);
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
      completedDate: [null],
      createdBy_AD_OID: [''] // Maintain original creator
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.taskId = Number(id);

    // Setup dynamic validation for completedDate based on status
    this.setupValidation();

    // Load projects first, then load task inside the subscription
    this.loadProjects();
  }

  setupValidation(): void {
    const statusControl = this.editForm.get('status');
    const completedDateControl = this.editForm.get('completedDate');

    statusControl?.valueChanges.subscribe(status => {
      if (status === 'Completed') {
        completedDateControl?.setValidators([Validators.required]);
      } else {
        completedDateControl?.clearValidators();
      }
      completedDateControl?.updateValueAndValidity();
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        if (this.taskId) {
          this.loadTask(this.taskId);
        }
      },
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        // Patch form with task data
        console.log('Task loaded:', task);

        // Handle potential casing issues (ProjectID vs projectId) or missing ID
        // The API might return projectID (capital ID) or projectId depending on serialization
        let pId = (task as any).projectID || task.projectId; // Try both casings

        // Fallback: If no ID found on task, try to match by name (legacy support or if ID is null)
        if (!pId && task.projectName) {
          const tName = task.projectName;
          console.log("No ProjectID found on task, searching by name:", tName);
          const match = this.projects.find(p => p.projectName && p.projectName.toLowerCase() === tName.toLowerCase());
          if (match) {
            pId = match.projectId;
            console.log("Matched project by name:", match);
          }
        }

        this.editForm.patchValue({
          taskId: task.taskId,
          title: task.title,
          projectId: pId,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
          completedDate: task.completedDate ? new Date(task.completedDate).toISOString().split('T')[0] : null,
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
        taskId: this.taskId,
        ProjectID: formValue.projectId // Ensure we send the ID to the backend property
      };

      console.log("Updating task with payload:", updatePayload);

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
